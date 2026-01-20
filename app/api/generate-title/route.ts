import { NextResponse } from "next/server"
import { generateText } from "ai"

// Plan limits for server-side enforcement
const PLAN_LIMITS = {
  free: { titles: 10, hasCtr: false, resetPeriod: "day" },
  creator: { titles: 200, hasCtr: true, resetPeriod: "month" },
  pro: { titles: Infinity, hasCtr: true, resetPeriod: "month" },
}

// Mock user database (in production, this would be a real database)
const userUsage = new Map<string, { titleUsage: number; lastReset: Date }>()

function checkAndUpdateUsage(userId: string, plan: string): { allowed: boolean; remaining: number } {
  const limits = PLAN_LIMITS[plan as keyof typeof PLAN_LIMITS] || PLAN_LIMITS.free
  
  let usage = userUsage.get(userId)
  
  if (!usage) {
    usage = { titleUsage: 0, lastReset: new Date() }
    userUsage.set(userId, usage)
  }
  
  // Check if reset is needed
  const now = new Date()
  const lastReset = new Date(usage.lastReset)
  
  if (limits.resetPeriod === "day") {
    if (now.toDateString() !== lastReset.toDateString()) {
      usage.titleUsage = 0
      usage.lastReset = now
    }
  } else {
    if (now.getMonth() !== lastReset.getMonth() || now.getFullYear() !== lastReset.getFullYear()) {
      usage.titleUsage = 0
      usage.lastReset = now
    }
  }
  
  // Check limit
  if (limits.titles !== Infinity && usage.titleUsage >= limits.titles) {
    return { allowed: false, remaining: 0 }
  }
  
  // Increment usage
  usage.titleUsage++
  userUsage.set(userId, usage)
  
  const remaining = limits.titles === Infinity ? Infinity : limits.titles - usage.titleUsage
  return { allowed: true, remaining }
}

const toneInstructions: Record<string, string> = {
  informative: "Clear, educational, and factual. Focus on what viewers will learn.",
  curiosity: "Create intrigue and make viewers NEED to click. Use open loops and mystery.",
  bold: "Make strong, confident statements. Be provocative but not clickbait.",
  emotional: "Connect with feelings. Use words that evoke emotion and relatability.",
  punchy: "Short, direct, and impactful. Every word must earn its place.",
}

const lengthLimits: Record<string, number> = {
  short: 50,
  medium: 60,
  long: 70,
}

export async function POST(request: Request) {
  try {
    const { 
      topic, 
      inspiration, 
      tone, 
      length, 
      showEmojis,
      currentTitle,
      iterateAction,
      userId 
    } = await request.json()
    
    if (!topic && !currentTitle) {
      return NextResponse.json(
        { error: "Topic or current title is required" },
        { status: 400 }
      )
    }
    
    // For demo purposes, we'll use a mock plan check
    const mockPlan = "creator"
    
    // Check usage limits (server-side enforcement)
    const { allowed, remaining } = checkAndUpdateUsage(userId || "anonymous", mockPlan)
    
    if (!allowed) {
      return NextResponse.json(
        { error: "Title generation limit reached. Please upgrade your plan." },
        { status: 429 }
      )
    }
    
    const maxChars = lengthLimits[length] || 60
    const toneGuide = toneInstructions[tone] || toneInstructions.curiosity
    const hasCtr = PLAN_LIMITS[mockPlan as keyof typeof PLAN_LIMITS]?.hasCtr ?? false
    
    let prompt: string
    
    if (iterateAction && currentTitle) {
      // Iteration mode
      const iterateInstructions: Record<string, string> = {
        improve: "Make this title better while keeping the same core message. Improve word choice, flow, and impact.",
        viral: "Make this title more viral and clickable. Add more intrigue, urgency, or emotional pull.",
        shorten: "Make this title shorter and punchier while keeping the key message. Remove unnecessary words.",
        curiosity: "Add more curiosity and intrigue. Make viewers feel they MUST click to find out more.",
      }
      
      prompt = `You are a YouTube title optimization expert. ${iterateInstructions[iterateAction]}

Current title: "${currentTitle}"
Topic: ${topic}
Tone style: ${toneGuide}
Maximum characters: ${maxChars}
${showEmojis ? "Suggest a relevant emoji that could enhance the title." : "Do not include emojis."}

Return exactly 1 improved title in this JSON format:
{
  "titles": [
    {
      "title": "Your improved title here",
      "predictedCtr": 8,
      "charCount": 45,
      ${showEmojis ? '"emojiSuggestion": "relevant emoji",' : ""}
      "recommendation": {
        "whyItWorks": "Explanation of why this title is effective",
        "suggestedImprovements": ["Optional improvement 1", "Optional improvement 2"],
        "hookExplanation": "How the hook grabs attention"
      }
    }
  ]
}

Predicted CTR should be 1-10 based on: curiosity factor, emotional impact, specificity, and relevance.`
    } else {
      // Initial generation mode
      prompt = `You are a world-class YouTube title expert who creates viral, high-CTR titles.

Topic: ${topic}
${inspiration ? `Style inspiration: ${inspiration}` : ""}
Tone style: ${toneGuide}
Maximum characters: ${maxChars}
${showEmojis ? "Suggest a relevant emoji for each title that could enhance it." : "Do not include emojis."}

Generate 7 unique, high-performing YouTube titles. Each title should:
- Be under ${maxChars} characters
- Follow the ${tone} tone
- Be optimized for maximum click-through rate
- NOT be clickbait (deliver on the promise)
- Use proven YouTube title patterns (numbers, questions, curiosity gaps, etc.)

Return the titles in this exact JSON format:
{
  "titles": [
    {
      "title": "Your title here",
      "predictedCtr": 8,
      "charCount": 45,
      ${showEmojis ? '"emojiSuggestion": "relevant emoji",' : ""}
      "recommendation": {
        "whyItWorks": "Explanation of why this title is effective",
        "suggestedImprovements": ["Optional improvement 1"],
        "hookExplanation": "How the hook grabs attention"
      }
    }
  ]
}

Predicted CTR should be 1-10 based on: curiosity factor, emotional impact, specificity, and relevance.
Make titles diverse - different structures, hooks, and approaches.`
    }
    
    const { text } = await generateText({
      model: "openai/gpt-4o-mini",
      system: "You are a YouTube title optimization expert. Always respond with valid JSON only, no markdown formatting or code blocks.",
      prompt,
    })
    
    // Parse the response
    let parsed
    try {
      // Remove any markdown code blocks if present
      const cleanedText = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim()
      parsed = JSON.parse(cleanedText)
    } catch {
      console.error("Failed to parse title response:", text)
      return NextResponse.json(
        { error: "Failed to generate titles. Please try again." },
        { status: 500 }
      )
    }
    
    // If user doesn't have CTR access, remove scoring info
    const titles = parsed.titles.map((t: { title: string; charCount: number; emojiSuggestion?: string; predictedCtr: number; recommendation: { whyItWorks: string; suggestedImprovements: string[]; hookExplanation: string } }) => ({
      ...t,
      predictedCtr: hasCtr ? t.predictedCtr : 0,
      recommendation: hasCtr ? t.recommendation : {
        whyItWorks: "Upgrade to Creator or Pro plan for AI recommendations",
        suggestedImprovements: [],
        hookExplanation: "Upgrade to see hook analysis",
      },
    }))
    
    return NextResponse.json({ 
      titles,
      remaining,
      success: true 
    })
    
  } catch (error) {
    console.error("Title generation error:", error)
    return NextResponse.json(
      { error: "Failed to generate titles. Please try again." },
      { status: 500 }
    )
  }
}
