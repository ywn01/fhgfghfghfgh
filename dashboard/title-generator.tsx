"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { GlassCard } from "@/components/glass-card"
import { GlassButton } from "@/components/glass-button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { useAuth, hasReachedLimit, getRemainingUsage, PLAN_LIMITS, hasFeatureAccess } from "@/lib/auth-context"
import { 
  Type, 
  Loader2, 
  Copy, 
  Check, 
  AlertTriangle,
  Crown,
  Sparkles,
  TrendingUp,
  ChevronDown,
  Lightbulb,
  Zap,
  RefreshCw,
  Minus,
  MessageSquare
} from "lucide-react"
import Link from "next/link"

const tones = [
  { value: "informative", label: "Informative", description: "Clear and educational" },
  { value: "curiosity", label: "Curiosity-driven", description: "Sparks interest" },
  { value: "bold", label: "Bold", description: "Strong statements" },
  { value: "emotional", label: "Emotional", description: "Connects feelings" },
  { value: "punchy", label: "Short & Punchy", description: "Direct impact" },
]

const lengths = [
  { value: "short", label: "Short", chars: 50, description: "≤50 characters" },
  { value: "medium", label: "Medium", chars: 60, description: "≤60 characters" },
  { value: "long", label: "Long", chars: 70, description: "≤70 characters" },
]

interface GeneratedTitle {
  title: string
  predictedCtr: number
  charCount: number
  emojiSuggestion?: string
  recommendation: {
    whyItWorks: string
    suggestedImprovements: string[]
    hookExplanation: string
  }
}

export function TitleGenerator() {
  const { user, updateUsage } = useAuth()
  const [topic, setTopic] = useState("")
  const [inspiration, setInspiration] = useState("")
  const [tone, setTone] = useState("curiosity")
  const [length, setLength] = useState("medium")
  const [showEmojis, setShowEmojis] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedTitles, setGeneratedTitles] = useState<GeneratedTitle[]>([])
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const [error, setError] = useState("")
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)
  const [iteratingIndex, setIteratingIndex] = useState<number | null>(null)

  const limitReached = hasReachedLimit(user, "title")
  const remaining = getRemainingUsage(user, "title")
  const limits = user ? PLAN_LIMITS[user.plan] : PLAN_LIMITS.free
  const hasCtrScoring = hasFeatureAccess(user, "titleCtrScoring")

  const handleGenerate = async () => {
    if (!topic) {
      setError("Please enter a video topic")
      return
    }

    if (limitReached) {
      setError("You've reached your title generation limit")
      return
    }

    setError("")
    setIsGenerating(true)
    setGeneratedTitles([])

    try {
      const response = await fetch("/api/generate-title", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          topic, 
          inspiration,
          tone,
          length,
          showEmojis,
          userId: user?.id 
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate titles")
      }

      setGeneratedTitles(data.titles)
      updateUsage("title")
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleIterate = async (index: number, action: "improve" | "viral" | "shorten" | "curiosity") => {
    if (limitReached) return
    
    setIteratingIndex(index)
    const currentTitle = generatedTitles[index]

    try {
      const response = await fetch("/api/generate-title", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          topic,
          currentTitle: currentTitle.title,
          iterateAction: action,
          tone,
          length,
          showEmojis,
          userId: user?.id 
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to iterate title")
      }

      // Replace the title at this index with the new one
      const updatedTitles = [...generatedTitles]
      updatedTitles[index] = data.titles[0]
      setGeneratedTitles(updatedTitles)
      updateUsage("title")
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIteratingIndex(null)
    }
  }

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  const getCtrColor = (ctr: number) => {
    if (ctr >= 8) return "text-green-500"
    if (ctr >= 6) return "text-yellow-500"
    return "text-orange-500"
  }

  return (
    <div className="grid lg:grid-cols-5 gap-6">
      {/* Input Panel */}
      <GlassCard className="lg:col-span-2 p-6" hover={false}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Type className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">AI Title Generator</h3>
            <p className="text-sm text-muted-foreground">
              {limits.titles === Infinity 
                ? "Unlimited generations" 
                : `${remaining} generations remaining`}
            </p>
          </div>
        </div>

        <div className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="topic">Video Topic *</Label>
            <Input
              id="topic"
              placeholder="e.g., How to grow a YouTube channel fast"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="bg-input/50 border-glass-border"
              disabled={limitReached}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="inspiration">
              Inspiration URL or Title
              <span className="text-muted-foreground text-xs ml-2">(optional)</span>
            </Label>
            <Input
              id="inspiration"
              placeholder="YouTube URL or a title you like"
              value={inspiration}
              onChange={(e) => setInspiration(e.target.value)}
              className="bg-input/50 border-glass-border"
              disabled={limitReached}
            />
          </div>

          <div className="space-y-2">
            <Label>Tone</Label>
            <Select value={tone} onValueChange={setTone} disabled={limitReached}>
              <SelectTrigger className="bg-input/50 border-glass-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {tones.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    <div className="flex flex-col">
                      <span>{t.label}</span>
                      <span className="text-xs text-muted-foreground">{t.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Target Length</Label>
            <div className="grid grid-cols-3 gap-2">
              {lengths.map((l) => (
                <button
                  key={l.value}
                  onClick={() => setLength(l.value)}
                  disabled={limitReached}
                  className={`p-3 rounded-xl border-2 transition-all ${
                    length === l.value
                      ? "border-primary bg-primary/5"
                      : "border-glass-border hover:border-primary/50"
                  } ${limitReached ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                >
                  <span className="block font-medium text-sm">{l.label}</span>
                  <span className="block text-xs text-muted-foreground">{l.description}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="emoji-toggle" className="cursor-pointer">Include Emoji Suggestions</Label>
            <Switch
              id="emoji-toggle"
              checked={showEmojis}
              onCheckedChange={setShowEmojis}
              disabled={limitReached}
            />
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
              disabled={isGenerating || !topic}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating Titles...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate Titles
                </>
              )}
            </GlassButton>
          )}
        </div>
      </GlassCard>

      {/* Output Panel */}
      <div className="lg:col-span-3 space-y-4">
        {isGenerating ? (
          <GlassCard className="p-8" hover={false}>
            <div className="text-center">
              <motion.div
                className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <Type className="w-8 h-8 text-primary" />
              </motion.div>
              <p className="text-muted-foreground">Creating click-worthy titles...</p>
            </div>
          </GlassCard>
        ) : generatedTitles.length > 0 ? (
          <AnimatePresence>
            {generatedTitles.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
              >
                <Collapsible
                  open={expandedIndex === index}
                  onOpenChange={() => setExpandedIndex(expandedIndex === index ? null : index)}
                >
                  <GlassCard className="p-4" hover={false}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-lg leading-snug mb-2">
                          {item.title}
                          {showEmojis && item.emojiSuggestion && (
                            <span className="ml-2">{item.emojiSuggestion}</span>
                          )}
                        </p>
                        <div className="flex items-center gap-4 text-sm">
                          {hasCtrScoring && (
                            <div className="flex items-center gap-1">
                              <TrendingUp className={`w-4 h-4 ${getCtrColor(item.predictedCtr)}`} />
                              <span className={getCtrColor(item.predictedCtr)}>
                                CTR: {item.predictedCtr}/10
                              </span>
                            </div>
                          )}
                          <span className="text-muted-foreground">
                            {item.charCount} chars
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <GlassButton
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(item.title, index)}
                        >
                          {copiedIndex === index ? (
                            <Check className="w-4 h-4 text-green-500" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </GlassButton>
                        <CollapsibleTrigger asChild>
                          <GlassButton variant="ghost" size="sm">
                            <ChevronDown className={`w-4 h-4 transition-transform ${expandedIndex === index ? "rotate-180" : ""}`} />
                          </GlassButton>
                        </CollapsibleTrigger>
                      </div>
                    </div>

                    <CollapsibleContent>
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mt-4 pt-4 border-t border-glass-border space-y-4"
                      >
                        {/* AI Recommendations */}
                        {hasCtrScoring && (
                          <div className="space-y-3">
                            <div className="flex items-start gap-2">
                              <Lightbulb className="w-4 h-4 text-yellow-500 mt-1 flex-shrink-0" />
                              <div>
                                <p className="text-sm font-medium">Why it works</p>
                                <p className="text-sm text-muted-foreground">{item.recommendation.whyItWorks}</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-2">
                              <MessageSquare className="w-4 h-4 text-blue-500 mt-1 flex-shrink-0" />
                              <div>
                                <p className="text-sm font-medium">Hook explanation</p>
                                <p className="text-sm text-muted-foreground">{item.recommendation.hookExplanation}</p>
                              </div>
                            </div>
                            {item.recommendation.suggestedImprovements.length > 0 && (
                              <div className="flex items-start gap-2">
                                <Zap className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                                <div>
                                  <p className="text-sm font-medium">Suggested improvements</p>
                                  <ul className="text-sm text-muted-foreground list-disc list-inside">
                                    {item.recommendation.suggestedImprovements.map((improvement, i) => (
                                      <li key={i}>{improvement}</li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Iteration Buttons */}
                        <div className="flex flex-wrap gap-2">
                          <GlassButton
                            variant="secondary"
                            size="sm"
                            onClick={() => handleIterate(index, "improve")}
                            disabled={iteratingIndex === index || limitReached}
                          >
                            {iteratingIndex === index ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <RefreshCw className="w-3 h-3" />
                            )}
                            Improve
                          </GlassButton>
                          <GlassButton
                            variant="secondary"
                            size="sm"
                            onClick={() => handleIterate(index, "viral")}
                            disabled={iteratingIndex === index || limitReached}
                          >
                            <Zap className="w-3 h-3" />
                            Make Viral
                          </GlassButton>
                          <GlassButton
                            variant="secondary"
                            size="sm"
                            onClick={() => handleIterate(index, "shorten")}
                            disabled={iteratingIndex === index || limitReached}
                          >
                            <Minus className="w-3 h-3" />
                            Shorten
                          </GlassButton>
                          <GlassButton
                            variant="secondary"
                            size="sm"
                            onClick={() => handleIterate(index, "curiosity")}
                            disabled={iteratingIndex === index || limitReached}
                          >
                            <Sparkles className="w-3 h-3" />
                            Add Curiosity
                          </GlassButton>
                        </div>
                      </motion.div>
                    </CollapsibleContent>
                  </GlassCard>
                </Collapsible>
              </motion.div>
            ))}
          </AnimatePresence>
        ) : (
          <GlassCard className="p-8" hover={false}>
            <div className="text-center text-muted-foreground">
              <Type className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Your generated titles will appear here.</p>
              <p className="text-sm mt-1">Fill in the details and click Generate.</p>
            </div>
          </GlassCard>
        )}
      </div>
    </div>
  )
}
