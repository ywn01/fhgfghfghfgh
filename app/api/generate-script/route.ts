import { NextResponse } from "next/server"
import { generateText } from "ai"

// Plan limits for server-side enforcement
const PLAN_LIMITS = {
  free: { scripts: 5, resetPeriod: "day" },
  creator: { scripts: 100, resetPeriod: "month" },
  pro: { scripts: Infinity, resetPeriod: "month" },
}

// Mock user database (in production, this would be a real database)
const userUsage = new Map<string, { scriptUsage: number; lastReset: Date }>()

function checkAndUpdateUsage(userId: string, plan: string): { allowed: boolean; remaining: number } {
  const limits = PLAN_LIMITS[plan as keyof typeof PLAN_LIMITS] || PLAN_LIMITS.free
  
  let usage = userUsage.get(userId)
  
  if (!usage) {
    usage = { scriptUsage: 0, lastReset: new Date() }
    userUsage.set(userId, usage)
  }
  
  // Check if reset is needed
  const now = new Date()
  const lastReset = new Date(usage.lastReset)
  
  if (limits.resetPeriod === "day") {
    if (now.toDateString() !== lastReset.toDateString()) {
      usage.scriptUsage = 0
      usage.lastReset = now
    }
  } else {
    if (now.getMonth() !== lastReset.getMonth() || now.getFullYear() !== lastReset.getFullYear()) {
      usage.scriptUsage = 0
      usage.lastReset = now
    }
  }
  
  // Check limit
  if (limits.scripts !== Infinity && usage.scriptUsage >= limits.scripts) {
    return { allowed: false, remaining: 0 }
  }
  
  // Increment usage
  usage.scriptUsage++
  userUsage.set(userId, usage)
  
  const remaining = limits.scripts === Infinity ? Infinity : limits.scripts - usage.scriptUsage
  return { allowed: true, remaining }
}

function getScriptPrompt(topic: string, niche: string, format: "short" | "long", duration: number): string {
  if (format === "short") {
    // Short form script (TikTok, Reels, Shorts)
    const wordCount = Math.round((duration / 60) * 150) // ~150 words per minute for fast-paced content
    return `Create a viral short-form video script for TikTok/Reels/YouTube Shorts:

Topic: ${topic}
Niche: ${niche}
Target Duration: ${duration} seconds
Approximate Word Count: ${wordCount} words

Requirements:
1. HOOK (first 1-2 seconds): Start with an attention-grabbing statement, question, or visual cue that stops the scroll
2. PROBLEM/INTRIGUE (2-5 seconds): State the problem or create curiosity
3. MAIN CONTENT (bulk of video): Deliver value quickly with punchy, fast-paced points
4. PAYOFF/CTA (last 3-5 seconds): Satisfying conclusion with a clear call to action (follow, like, comment)

Format Guidelines:
- Use [VISUAL:] tags for on-screen text/graphics suggestions
- Use [ACTION:] tags for physical movements or transitions
- Keep sentences SHORT and punchy
- Include trending hooks patterns
- Write for fast-paced, energetic delivery
- Each line should be its own beat/moment

Make it scroll-stopping and highly shareable!`
  } else {
    // Long form script (YouTube)
    const wordCount = Math.round(duration * 150) // ~150 words per minute
    const sections = duration <= 5 ? 3 : duration <= 10 ? 4 : duration <= 20 ? 5 : 6
    
    return `Create a YouTube long-form video script:

Topic: ${topic}
Niche: ${niche}
Target Duration: ${duration} minutes
Approximate Word Count: ${wordCount} words
Number of Main Sections: ${sections}

Structure:
1. HOOK (0:00-0:05): Powerful opening that grabs attention immediately
2. INTRO (0:05-0:30): Quick preview of what viewers will learn + why it matters
3. MAIN CONTENT: ${sections} distinct sections with clear transitions
4. ENGAGEMENT PROMPTS: Naturally placed reminders to like, subscribe, comment
5. CONCLUSION: Summary + strong call to action + preview next video

Format Guidelines:
- Use [SECTION:] headers for main content breaks
- Use [B-ROLL:] suggestions for visual variety
- Use [GRAPHICS:] for on-screen text/lower thirds
- Use [TIMESTAMP:] markers at key points
- Include pattern interrupts every 2-3 minutes to maintain attention
- Write conversationally - short sentences, simple words
- Add emphasis markers for **key points**

Make it engaging, valuable, and optimized for watch time!`
  }
}

export async function POST(request: Request) {
  try {
    const { topic, niche, format = "long", duration = 8, userId } = await request.json()
    
    if (!topic || !niche) {
      return NextResponse.json(
        { error: "Topic and niche are required" },
        { status: 400 }
      )
    }
    
    // For demo purposes, we'll use a mock plan check
    // In production, this would fetch the user's actual plan from the database
    const mockPlan = "free"
    
    // Check usage limits (server-side enforcement)
    const { allowed, remaining } = checkAndUpdateUsage(userId || "anonymous", mockPlan)
    
    if (!allowed) {
      return NextResponse.json(
        { error: "Script generation limit reached. Please upgrade your plan." },
        { status: 429 }
      )
    }
    
    const systemPrompt = format === "short" 
      ? `You are an expert short-form content creator who writes viral TikTok, Instagram Reels, and YouTube Shorts scripts. 
You understand platform algorithms, trending formats, and how to create scroll-stopping content that gets views and engagement.
Your scripts are punchy, fast-paced, and optimized for the vertical video format.`
      : `You are an expert YouTube script writer who creates engaging, viral-ready long-form scripts. 
You understand YouTube's algorithm and know how to create content that maximizes watch time and engagement.
Your scripts are well-structured with hooks, pattern interrupts, and strong calls to action.`
    
    // Generate script using AI SDK
    const { text: script } = await generateText({
      model: "openai/gpt-4o-mini",
      system: systemPrompt,
      prompt: getScriptPrompt(topic, niche, format, duration),
    })
    
    return NextResponse.json({ 
      script,
      remaining,
      format,
      duration,
      success: true 
    })
    
  } catch (error) {
    console.error("Script generation error:", error)
    return NextResponse.json(
      { error: "Failed to generate script. Please try again." },
      { status: 500 }
    )
  }
}
