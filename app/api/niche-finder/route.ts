import { NextResponse } from "next/server"
import { generateText } from "ai"

// Plan limits for server-side enforcement
const PLAN_LIMITS = {
  free: { nicheFinder: false },
  creator: { nicheFinder: true },
  pro: { nicheFinder: true },
}

export async function POST(request: Request) {
  try {
    const { 
      channelType,
      goals,
      timeframe,
      region,
      userId 
    } = await request.json()
    
    // For demo purposes, we'll use a mock plan check
    const mockPlan = "creator"
    
    // Check if user has access
    const limits = PLAN_LIMITS[mockPlan as keyof typeof PLAN_LIMITS] || PLAN_LIMITS.free
    
    if (!limits.nicheFinder) {
      return NextResponse.json(
        { error: "Niche Finder is only available for Creator and Pro plans." },
        { status: 403 }
      )
    }
    
    const goalsText = goals.join(", ")
    const channelTypeText = channelType === "faceless" 
      ? "faceless channels (no face on camera)" 
      : channelType === "on-camera" 
        ? "on-camera channels (face required)" 
        : "any channel type"
    
    const regionText = region === "global" ? "worldwide" : `focused on ${region.toUpperCase()}`
    
    const prompt = `You are a YouTube market research expert. Analyze current YouTube trends and identify high-opportunity niches.

Search Parameters:
- Channel Type: ${channelTypeText}
- Goals: ${goalsText}
- Timeframe: Last ${timeframe} days trends
- Region: ${regionText}

Generate 6 high-opportunity YouTube niches that match these criteria. For each niche, provide:
1. A specific, actionable niche name (not too broad)
2. A niche score (0-100) based on opportunity potential
3. Average views per video estimate
4. Average monthly subscriber growth estimate
5. Monetization potential (High/Medium/Low) based on CPM and sponsorship opportunities
6. Whether it's faceless-friendly (true/false)
7. Detailed analysis including why it works, risks, example channels, and example video titles

Consider these scoring factors:
- View velocity and growth potential
- Competition density (fewer established channels = higher score)
- Monetization potential (CPM rates, sponsorship appeal)
- Faceless compatibility (if applicable)
- Subscriber conversion ratio
- Content sustainability

Return in this exact JSON format:
{
  "niches": [
    {
      "id": "unique-slug-1",
      "name": "Specific Niche Name",
      "score": 85,
      "avgViews": 50000,
      "avgSubGrowth": 5000,
      "monetizationRating": "High",
      "facelessFriendly": true,
      "details": {
        "whyItWorks": "Detailed explanation of why this niche is a good opportunity",
        "risks": ["Risk 1", "Risk 2"],
        "exampleChannels": ["Channel 1", "Channel 2", "Channel 3"],
        "exampleTitles": ["Example Video Title 1", "Example Video Title 2", "Example Video Title 3"]
      }
    }
  ]
}

Make the niches specific and actionable, not generic categories like "Gaming" - instead use "Indie Horror Game Reviews" or "Minecraft Redstone Tutorials".`

    const { text } = await generateText({
      model: "openai/gpt-4o-mini",
      system: "You are a YouTube market research expert. Always respond with valid JSON only, no markdown formatting or code blocks.",
      prompt,
    })
    
    // Parse the response
    let parsed
    try {
      const cleanedText = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim()
      parsed = JSON.parse(cleanedText)
    } catch {
      console.error("Failed to parse niche finder response:", text)
      return NextResponse.json(
        { error: "Failed to analyze niches. Please try again." },
        { status: 500 }
      )
    }
    
    // Sort by score descending
    const sortedNiches = parsed.niches.sort((a: { score: number }, b: { score: number }) => b.score - a.score)
    
    return NextResponse.json({ 
      niches: sortedNiches,
      success: true 
    })
    
  } catch (error) {
    console.error("Niche finder error:", error)
    return NextResponse.json(
      { error: "Failed to find niches. Please try again." },
      { status: 500 }
    )
  }
}
