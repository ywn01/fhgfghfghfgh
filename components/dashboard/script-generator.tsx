"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { GlassCard } from "@/components/glass-card"
import { GlassButton } from "@/components/glass-button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Slider } from "@/components/ui/slider"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { useAuth, hasReachedLimit, getRemainingUsage, PLAN_LIMITS } from "@/lib/auth-context"
import { 
  Sparkles, 
  Loader2, 
  Copy, 
  Check, 
  AlertTriangle,
  Crown,
  Clock,
  FileText
} from "lucide-react"
import Link from "next/link"

const niches = [
  "Technology",
  "Gaming",
  "Education",
  "Entertainment",
  "Lifestyle",
  "Business",
  "Health & Fitness",
  "Travel",
  "Food & Cooking",
  "Music",
  "Sports",
  "DIY & Crafts",
]

type ScriptFormat = "short" | "long"

const formatDetails = {
  short: {
    label: "Short Form",
    description: "TikTok, Reels, Shorts (15-60 seconds)",
    minDuration: 15,
    maxDuration: 60,
    defaultDuration: 30,
  },
  long: {
    label: "Long Form",
    description: "YouTube videos (3-30 minutes)",
    minDuration: 3,
    maxDuration: 30,
    defaultDuration: 8,
  },
}

export function ScriptGenerator() {
  const { user, updateUsage } = useAuth()
  const [topic, setTopic] = useState("")
  const [niche, setNiche] = useState("")
  const [scriptFormat, setScriptFormat] = useState<ScriptFormat>("long")
  const [duration, setDuration] = useState(formatDetails.long.defaultDuration)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedScript, setGeneratedScript] = useState("")
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState("")

  const limitReached = hasReachedLimit(user, "script")
  const remaining = getRemainingUsage(user, "script")
  const limits = user ? PLAN_LIMITS[user.plan] : PLAN_LIMITS.free

  const handleFormatChange = (format: ScriptFormat) => {
    setScriptFormat(format)
    setDuration(formatDetails[format].defaultDuration)
  }

  const formatDuration = (value: number) => {
    if (scriptFormat === "short") {
      return `${value} seconds`
    }
    return `${value} minutes`
  }

  const handleGenerate = async () => {
    if (!topic || !niche) {
      setError("Please fill in all fields")
      return
    }

    if (limitReached) {
      setError("You've reached your script generation limit")
      return
    }

    setError("")
    setIsGenerating(true)
    setGeneratedScript("")

    try {
      const response = await fetch("/api/generate-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          topic, 
          niche, 
          format: scriptFormat,
          duration,
          userId: user?.id 
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate script")
      }

      setGeneratedScript(data.script)
      updateUsage("script")
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsGenerating(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedScript)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const currentFormat = formatDetails[scriptFormat]

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Input Panel */}
      <GlassCard className="p-6" hover={false}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">AI Script Generator</h3>
            <p className="text-sm text-muted-foreground">
              {limits.scripts === Infinity 
                ? "Unlimited generations" 
                : `${remaining} generations remaining`}
            </p>
          </div>
        </div>

        <div className="space-y-5">
          {/* Script Format Selection */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Script Format
            </Label>
            <RadioGroup 
              value={scriptFormat} 
              onValueChange={(v) => handleFormatChange(v as ScriptFormat)}
              className="grid grid-cols-2 gap-3"
              disabled={limitReached}
            >
              {(Object.keys(formatDetails) as ScriptFormat[]).map((format) => (
                <Label
                  key={format}
                  htmlFor={format}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    scriptFormat === format
                      ? "border-primary bg-primary/5"
                      : "border-glass-border hover:border-primary/50"
                  } ${limitReached ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <RadioGroupItem value={format} id={format} className="sr-only" />
                  <span className="font-medium text-sm">{formatDetails[format].label}</span>
                  <span className="text-xs text-muted-foreground text-center mt-1">
                    {formatDetails[format].description}
                  </span>
                </Label>
              ))}
            </RadioGroup>
          </div>

          {/* Duration Slider */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Target Duration
              </Label>
              <span className="text-sm font-medium text-primary">
                {formatDuration(duration)}
              </span>
            </div>
            <Slider
              value={[duration]}
              onValueChange={(v) => setDuration(v[0])}
              min={currentFormat.minDuration}
              max={currentFormat.maxDuration}
              step={scriptFormat === "short" ? 5 : 1}
              disabled={limitReached}
              className="py-2"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{formatDuration(currentFormat.minDuration)}</span>
              <span>{formatDuration(currentFormat.maxDuration)}</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="topic">Video Topic</Label>
            <Input
              id="topic"
              placeholder="e.g., How to Start a YouTube Channel in 2026"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="bg-input/50 border-glass-border"
              disabled={limitReached}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="niche">Niche</Label>
            <Select value={niche} onValueChange={setNiche} disabled={limitReached}>
              <SelectTrigger className="bg-input/50 border-glass-border">
                <SelectValue placeholder="Select your niche" />
              </SelectTrigger>
              <SelectContent>
                {niches.map((n) => (
                  <SelectItem key={n} value={n.toLowerCase()}>
                    {n}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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

          {limitReached ? (
            <Link href="/pricing">
              <GlassButton className="w-full">
                <Crown className="w-4 h-4" />
                Upgrade to Generate More
              </GlassButton>
            </Link>
          ) : (
            <GlassButton
              onClick={handleGenerate}
              disabled={isGenerating || !topic || !niche}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating {scriptFormat === "short" ? "Short" : "Long"} Script...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate {scriptFormat === "short" ? "Short" : "Long"} Script
                </>
              )}
            </GlassButton>
          )}
        </div>
      </GlassCard>

      {/* Output Panel */}
      <GlassCard className="p-6" hover={false}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Generated Script</h3>
          {generatedScript && (
            <GlassButton
              variant="ghost"
              size="sm"
              onClick={copyToClipboard}
              className="gap-2"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-green-500" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy
                </>
              )}
            </GlassButton>
          )}
        </div>

        <div className="relative min-h-[300px] max-h-[500px] overflow-auto">
          {isGenerating ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <motion.div
                  className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <Sparkles className="w-8 h-8 text-primary" />
                </motion.div>
                <p className="text-muted-foreground">Creating your viral script...</p>
              </div>
            </div>
          ) : generatedScript ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Textarea
                value={generatedScript}
                readOnly
                className="min-h-[300px] bg-transparent border-0 resize-none focus-visible:ring-0 text-sm leading-relaxed"
              />
            </motion.div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
              <p className="text-center">
                Your generated script will appear here.
                <br />
                <span className="text-sm">Fill in the details and click Generate.</span>
              </p>
            </div>
          )}
        </div>
      </GlassCard>
    </div>
  )
}
