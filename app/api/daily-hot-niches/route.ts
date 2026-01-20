import { NextResponse } from "next/server"
import { generateText } from "ai"

// Plan limits for server-side enforcement
const PLAN_LIMITS = {
  free: { hotNicheFeed: false },
  creator: { hotNicheFeed: true },
  pro: { hotNicheFeed: true },
}

// Cache for daily hot niches
let cachedNiches: { date: string; niches: HotNiche[]; region: string } | null = null

interface YouTubeChannel {
  id: string
  title: string
  description: string
  subscriberCount: number
  viewCount: number
  videoCount: number
  thumbnailUrl: string
  customUrl?: string
  publishedAt: string
}

interface HotNiche {
  id: string
  name: string
  score: number
  avgViews: number
  avgSubGrowth: number
  monetizationRating: "High" | "Medium" | "Low"
  facelessFriendly: boolean
  contentType: "long-form" | "short-form" | "both"
  trendingReason: string
  channels: {
    name: string
    subscribers: string
    avgViews: string
    channelUrl: string
    isFaceless: boolean
  }[]
  details: {
    whyItWorks: string
    risks: string[]
    exampleChannels: string[]
    exampleTitles: string[]
  }
}

// YouTube API helper to search for channels
async function searchYouTubeChannels(query: string, maxResults: number = 10): Promise<YouTubeChannel[]> {
  const apiKey = process.env.YOUTUBE_API_KEY
  
  if (!apiKey) {
    console.log("YouTube API key not configured, using AI-generated data")
    return []
  }
  
  try {
    // Search for channels
    const searchResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${encodeURIComponent(query)}&maxResults=${maxResults}&key=${apiKey}`
    )
    
    if (!searchResponse.ok) {
      console.error("YouTube search failed:", await searchResponse.text())
      return []
    }
    
    const searchData = await searchResponse.json()
    const channelIds = searchData.items?.map((item: { id: { channelId: string } }) => item.id.channelId).join(",")
    
    if (!channelIds) return []
    
    // Get channel statistics
    const channelResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${channelIds}&key=${apiKey}`
    )
    
    if (!channelResponse.ok) {
      console.error("YouTube channels fetch failed:", await channelResponse.text())
      return []
    }
    
    const channelData = await channelResponse.json()
    
    return channelData.items?.map((channel: {
      id: string
      snippet: {
        title: string
        description: string
        customUrl?: string
        thumbnails: { default: { url: string } }
        publishedAt: string
      }
      statistics: {
        subscriberCount: string
        viewCount: string
        videoCount: string
      }
    }) => ({
      id: channel.id,
      title: channel.snippet.title,
      description: channel.snippet.description,
      subscriberCount: parseInt(channel.statistics.subscriberCount || "0"),
      viewCount: parseInt(channel.statistics.viewCount || "0"),
      videoCount: parseInt(channel.statistics.videoCount || "0"),
      thumbnailUrl: channel.snippet.thumbnails?.default?.url,
      customUrl: channel.snippet.customUrl,
      publishedAt: channel.snippet.publishedAt,
    })) || []
  } catch (error) {
    console.error("YouTube API error:", error)
    return []
  }
}

// Analyze if a channel is likely faceless based on description and name
function analyzeFacelessProbability(channel: YouTubeChannel): boolean {
  const facelessKeywords = [
    "faceless", "animation", "animated", "no face", "voiceover", "voice over",
    "ai generated", "stock footage", "compilation", "facts", "top 10", "explained",
    "documentary", "mystery", "stories", "reddit", "cash cow", "automated",
    "relaxing", "ambient", "lofi", "lo-fi", "music mix", "meditation", "sleep"
  ]
  
  const combinedText = `${channel.title} ${channel.description}`.toLowerCase()
  
  return facelessKeywords.some(keyword => combinedText.includes(keyword))
}

// Format subscriber count for display
function formatCount(count: number): string {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`
  return count.toString()
}

async function generateHotNiches(region: string, contentFilter?: "long-form" | "short-form"): Promise<HotNiche[]> {
  const today = new Date().toISOString().split("T")[0]
  
  // Check cache
  if (cachedNiches && cachedNiches.date === today && cachedNiches.region === region) {
    return cachedNiches.niches
  }
  
  // Faceless YouTube niche categories for searching
  const facelessNicheCategories = [
    { query: "faceless youtube channel motivation", niche: "Motivational Content" },
    { query: "reddit stories youtube", niche: "Reddit Stories" },
    { query: "top 10 facts youtube channel", niche: "Top 10 Lists" },
    { query: "relaxing music sleep youtube", niche: "Relaxation/Sleep Content" },
    { query: "true crime documentary youtube", niche: "True Crime" },
    { query: "history documentary faceless", niche: "History Documentaries" },
    { query: "personal finance animation youtube", niche: "Personal Finance" },
    { query: "gaming compilation youtube", niche: "Gaming Compilations" },
    { query: "ai news technology explained", niche: "Tech/AI Explainers" },
    { query: "scary stories animated youtube", niche: "Horror Stories" },
    { query: "travel compilation 4k", niche: "Travel Compilations" },
    { query: "cooking recipe shorts", niche: "Cooking/Recipe Shorts" },
  ]
  
  // Try to get real YouTube data
  const youtubeChannelsByNiche: Record<string, YouTubeChannel[]> = {}
  
  for (const category of facelessNicheCategories) {
    const channels = await searchYouTubeChannels(category.query, 5)
    if (channels.length > 0) {
      youtubeChannelsByNiche[category.niche] = channels
    }
  }
  
  const hasYouTubeData = Object.keys(youtubeChannelsByNiche).length > 0
  
  const prompt = `You are a YouTube trend analyst specializing in faceless YouTube channels. Generate today's top 10 hottest FACELESS YouTube niches based on current trends.

${hasYouTubeData ? `I have real YouTube channel data for some niches. Incorporate this data and analyze these channels:
${JSON.stringify(youtubeChannelsByNiche, null, 2)}` : ""}

For each niche, provide:
1. A specific, actionable niche name
2. A niche score (0-100) based on current trending potential for FACELESS content
3. Average views per video estimate
4. Average monthly subscriber growth estimate
5. Monetization potential (High/Medium/Low) - consider CPM and sponsorship potential
6. Whether it's suitable for long-form, short-form, or both content types
7. Why it's trending right now
8. Detailed analysis including risks and example titles

Focus specifically on:
- Niches that work well WITHOUT showing your face
- Content that can be created with stock footage, animations, or AI-generated visuals
- Topics with high search volume and viewer retention
- Sustainable niches with monetization potential

Return in this exact JSON format:
{
  "niches": [
    {
      "id": "unique-slug",
      "name": "Specific Niche Name",
      "score": 92,
      "avgViews": 150000,
      "avgSubGrowth": 8000,
      "monetizationRating": "High",
      "facelessFriendly": true,
      "contentType": "long-form",
      "trendingReason": "Brief explanation of why this is hot right now",
      "channels": [
        {
          "name": "Channel Name",
          "subscribers": "1.2M",
          "avgViews": "500K",
          "channelUrl": "https://youtube.com/@channelname",
          "isFaceless": true
        }
      ],
      "details": {
        "whyItWorks": "Detailed explanation of why this faceless niche works",
        "risks": ["Risk 1", "Risk 2"],
        "exampleChannels": ["Channel 1", "Channel 2"],
        "exampleTitles": ["Title 1", "Title 2", "Title 3"]
      }
    }
  ]
}

${contentFilter ? `Focus on ${contentFilter} content specifically.` : "Include both long-form and short-form opportunities."}

Make niches specific and actionable. All niches must be FACELESS-FRIENDLY.`

  const { text } = await generateText({
    model: "openai/gpt-4o-mini",
    system: "You are a YouTube trend analyst specializing in faceless content creation. Always respond with valid JSON only, no markdown formatting or code blocks.",
    prompt,
  })

  let parsed
  try {
    const cleanedText = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim()
    parsed = JSON.parse(cleanedText)
  } catch {
    console.error("Failed to parse hot niches response:", text)
    throw new Error("Failed to generate hot niches")
  }

  // Enhance with real YouTube data if available
  const enhancedNiches = parsed.niches.map((niche: HotNiche) => {
    const matchingChannels = youtubeChannelsByNiche[niche.name]
    if (matchingChannels && matchingChannels.length > 0) {
      niche.channels = matchingChannels.slice(0, 3).map(channel => ({
        name: channel.title,
        subscribers: formatCount(channel.subscriberCount),
        avgViews: formatCount(Math.round(channel.viewCount / Math.max(channel.videoCount, 1))),
        channelUrl: channel.customUrl 
          ? `https://youtube.com/${channel.customUrl}`
          : `https://youtube.com/channel/${channel.id}`,
        isFaceless: analyzeFacelessProbability(channel),
      }))
    }
    return niche
  })

  // Sort by score descending
  const sortedNiches = enhancedNiches.sort((a: HotNiche, b: HotNiche) => b.score - a.score)
  
  // Cache the result
  cachedNiches = { date: today, niches: sortedNiches, region }
  
  return sortedNiches
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const region = searchParams.get("region") || "global"
    const contentFilter = searchParams.get("contentType") as "long-form" | "short-form" | undefined
    
    // For demo purposes, we'll use a mock plan check
    const mockPlan = "creator"
    
    // Check if user has access
    const limits = PLAN_LIMITS[mockPlan as keyof typeof PLAN_LIMITS] || PLAN_LIMITS.free
    
    if (!limits.hotNicheFeed) {
      return NextResponse.json(
        { error: "Daily Hot Niches is only available for Creator and Pro plans." },
        { status: 403 }
      )
    }
    
    const niches = await generateHotNiches(region, contentFilter)
    
    return NextResponse.json({ 
      date: new Date().toISOString().split("T")[0],
      region,
      niches,
      hasYouTubeData: !!process.env.YOUTUBE_API_KEY,
      success: true 
    })
    
  } catch (error) {
    console.error("Hot niches error:", error)
    return NextResponse.json(
      { error: "Failed to fetch hot niches. Please try again." },
      { status: 500 }
    )
  }
}
