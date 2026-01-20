"use client"

import React from "react"

import { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { GlassCard } from "@/components/glass-card"
import { GlassButton } from "@/components/glass-button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth, hasReachedLimit, getRemainingUsage, PLAN_LIMITS } from "@/lib/auth-context"
import { 
  ImageIcon, 
  Loader2, 
  Download, 
  AlertTriangle,
  Crown,
  Upload,
  X
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export function ThumbnailGenerator() {
  const { user, updateUsage } = useAuth()
  const [prompt, setPrompt] = useState("")
  const [referenceImage, setReferenceImage] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImage, setGeneratedImage] = useState("")
  const [error, setError] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const limitReached = hasReachedLimit(user, "thumbnail")
  const remaining = getRemainingUsage(user, "thumbnail")
  const limits = user ? PLAN_LIMITS[user.plan] : PLAN_LIMITS.free
  const canGenerateThumbnails = limits.thumbnails > 0 || limits.thumbnails === Infinity

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setReferenceImage(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeReferenceImage = () => {
    setReferenceImage(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleGenerate = async () => {
    if (!prompt) {
      setError("Please enter a thumbnail prompt")
      return
    }

    if (!canGenerateThumbnails) {
      setError("Thumbnail generation is not available on the Free plan")
      return
    }

    if (limitReached) {
      setError("You've reached your thumbnail generation limit")
      return
    }

    setError("")
    setIsGenerating(true)
    setGeneratedImage("")

    try {
      const response = await fetch("/api/generate-thumbnail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          prompt, 
          referenceImage,
          userId: user?.id 
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate thumbnail")
      }

      setGeneratedImage(data.imageUrl)
      updateUsage("thumbnail")
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsGenerating(false)
    }
  }

  const downloadImage = async () => {
    if (!generatedImage) return
    
    const link = document.createElement("a")
    link.href = generatedImage
    link.download = `lumigen-thumbnail-${Date.now()}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Input Panel */}
      <GlassCard className="p-6" hover={false}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
            <ImageIcon className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h3 className="font-semibold">Nano Banana Pro Thumbnails</h3>
            <p className="text-sm text-muted-foreground">
              {!canGenerateThumbnails 
                ? "Upgrade to unlock" 
                : limits.thumbnails === Infinity 
                  ? "Unlimited generations" 
                  : `${remaining} generations remaining`}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="prompt">Thumbnail Description</Label>
            <Input
              id="prompt"
              placeholder="e.g., Excited person pointing at code on screen, neon colors"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="bg-input/50 border-glass-border"
              disabled={limitReached || !canGenerateThumbnails}
            />
          </div>

          {/* Reference Image Upload */}
          <div className="space-y-2">
            <Label>Reference Image (Optional)</Label>
            <div className="relative">
              {referenceImage ? (
                <div className="relative rounded-xl overflow-hidden border border-glass-border">
                  <Image
                    src={referenceImage || "/placeholder.svg"}
                    alt="Reference"
                    width={400}
                    height={225}
                    className="w-full aspect-video object-cover"
                  />
                  <button
                    onClick={removeReferenceImage}
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-background/80 backdrop-blur-sm hover:bg-background transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={!canGenerateThumbnails}
                  className="w-full aspect-video rounded-xl border-2 border-dashed border-glass-border hover:border-primary/50 transition-colors flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Upload className="w-8 h-8" />
                  <span className="text-sm">Upload reference thumbnail</span>
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Upload an existing thumbnail to match its style
            </p>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm"
              >
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {!canGenerateThumbnails || limitReached ? (
            <Link href="/pricing">
              <GlassButton className="w-full">
                <Crown className="w-4 h-4" />
                {!canGenerateThumbnails ? "Upgrade to Generate Thumbnails" : "Upgrade to Generate More"}
              </GlassButton>
            </Link>
          ) : (
            <GlassButton
              onClick={handleGenerate}
              disabled={isGenerating || !prompt}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <ImageIcon className="w-4 h-4" />
                  Generate Thumbnail
                </>
              )}
            </GlassButton>
          )}
        </div>
      </GlassCard>

      {/* Output Panel */}
      <GlassCard className="p-6" hover={false}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Generated Thumbnail</h3>
          {generatedImage && (
            <GlassButton
              variant="secondary"
              size="sm"
              onClick={downloadImage}
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              Download
            </GlassButton>
          )}
        </div>

        <div className="relative aspect-video rounded-xl overflow-hidden bg-muted/30">
          {isGenerating ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <motion.div
                  className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent/20 flex items-center justify-center"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <ImageIcon className="w-8 h-8 text-accent" />
                </motion.div>
                <p className="text-muted-foreground">Creating your thumbnail...</p>
              </div>
            </div>
          ) : generatedImage ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="w-full h-full"
            >
              <Image
                src={generatedImage || "/placeholder.svg"}
                alt="Generated thumbnail"
                fill
                className="object-cover"
              />
            </motion.div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
              <p className="text-center px-4">
                Your generated thumbnail will appear here.
                <br />
                <span className="text-sm">16:9 aspect ratio optimized for YouTube.</span>
              </p>
            </div>
          )}
        </div>
      </GlassCard>
    </div>
  )
}
