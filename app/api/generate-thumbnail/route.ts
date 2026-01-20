import { NextResponse } from "next/server"

// Plan limits for server-side enforcement
const PLAN_LIMITS = {
  free: { thumbnails: 3, resetPeriod: "day" },
  creator: { thumbnails: 30, resetPeriod: "month" },
  pro: { thumbnails: Infinity, resetPeriod: "month" },
}

// Mock user database (in production, this would be a real database)
const userUsage = new Map<string, { thumbnailUsage: number; lastReset: Date }>()

function checkAndUpdateUsage(userId: string, plan: string): { allowed: boolean; remaining: number } {
  const limits = PLAN_LIMITS[plan as keyof typeof PLAN_LIMITS] || PLAN_LIMITS.free
  
  let usage = userUsage.get(userId)
  
  if (!usage) {
    usage = { thumbnailUsage: 0, lastReset: new Date() }
    userUsage.set(userId, usage)
  }
  
  // Check if reset is needed
  const now = new Date()
  const lastReset = new Date(usage.lastReset)
  
  if (limits.resetPeriod === "day") {
    if (now.toDateString() !== lastReset.toDateString()) {
      usage.thumbnailUsage = 0
      usage.lastReset = now
    }
  } else {
    if (now.getMonth() !== lastReset.getMonth() || now.getFullYear() !== lastReset.getFullYear()) {
      usage.thumbnailUsage = 0
      usage.lastReset = now
    }
  }
  
  // Check limit
  if (limits.thumbnails !== Infinity && usage.thumbnailUsage >= limits.thumbnails) {
    return { allowed: false, remaining: 0 }
  }
  
  // Increment usage
  usage.thumbnailUsage++
  userUsage.set(userId, usage)
  
  const remaining = limits.thumbnails === Infinity ? Infinity : limits.thumbnails - usage.thumbnailUsage
  return { allowed: true, remaining }
}

export async function POST(request: Request) {
  try {
    const { prompt, userId } = await request.json()
    
    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      )
    }
    
    // For demo purposes, we'll use a mock plan check
    // In production, this would fetch the user's actual plan from the database
    const mockPlan = "creator"
    
    // Check usage limits (server-side enforcement)
    const { allowed, remaining } = checkAndUpdateUsage(userId || "anonymous", mockPlan)
    
    if (!allowed) {
      return NextResponse.json(
        { error: "Thumbnail generation limit reached. Please upgrade your plan." },
        { status: 429 }
      )
    }
    
    // Build the enhanced prompt for YouTube thumbnail generation
    const enhancedPrompt = `Professional YouTube thumbnail, 16:9 aspect ratio, high quality, vibrant saturated colors, eye-catching composition, dramatic lighting, bold visual impact, click-worthy, photorealistic: ${prompt}`
    
    // Use Pollinations.ai - completely free, no API key required
    // Pollinations uses Flux model for high quality image generation
    const encodedPrompt = encodeURIComponent(enhancedPrompt)
    const width = 1280
    const height = 720
    const seed = Math.floor(Math.random() * 1000000) // Random seed for variety
    
    // Pollinations.ai image URL format with Flux model
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&seed=${seed}&model=flux&nologo=true`
    
    // Verify the image is accessible by making a HEAD request
    const checkResponse = await fetch(imageUrl, { method: "HEAD" })
    
    if (!checkResponse.ok) {
      throw new Error("Failed to generate image")
    }
    
    return NextResponse.json({ 
      imageUrl,
      remaining,
      success: true,
    })
    
  } catch (error) {
    console.error("Thumbnail generation error:", error)
    
    return NextResponse.json(
      { error: "Failed to generate thumbnail. Please try again." },
      { status: 500 }
    )
  }
}
