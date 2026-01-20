"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { GlassCard } from "@/components/glass-card"
import { GlassButton } from "@/components/glass-button"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
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
import { useAuth, PLAN_LIMITS, hasFeatureAccess } from "@/lib/auth-context"
import { 
  Search,
  Loader2, 
  AlertTriangle,
  Crown,
  TrendingUp,
  Users,
  DollarSign,
  Eye,
  ChevronDown,
  Bookmark,
  BookmarkCheck,
  Type,
  ImageIcon,
  FileText,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Video
} from "lucide-react"
import Link from "next/link"

const channelTypes = [
  { value: "either", label: "Either", description: "All channel types" },
  { value: "faceless", label: "Faceless", description: "No face on camera" },
  { value: "on-camera", label: "On-Camera", description: "Face on camera" },
]

const goals = [
  { value: "high-views", label: "High Views", icon: Eye },
  { value: "fast-growth", label: "Fast Subscriber Growth", icon: Users },
  { value: "monetizable", label: "Monetizable", icon: DollarSign },
  { value: "low-competition", label: "Low Competition", icon: TrendingUp },
]

const timeframes = [
  { value: "7", label: "Last 7 days" },
  { value: "30", label: "Last 30 days" },
  { value: "90", label: "Last 90 days" },
]

const regions = [
  { value: "global", label: "Global" },
  { value: "us", label: "United States" },
  { value: "uk", label: "United Kingdom" },
  { value: "in", label: "India" },
  { value: "br", label: "Brazil" },
  { value: "de", label: "Germany" },
]

interface NicheResult {
  id: string
  name: string
  score: number
  avgViews: number
  avgSubGrowth: number
  monetizationRating: "High" | "Medium" | "Low"
  facelessFriendly: boolean
  details: {
    whyItWorks: string
    risks: string[]
    exampleChannels: string[]
    exampleTitles: string[]
  }
}

export function NicheFinder() {
  const { user, saveNiche } = useAuth()
  const [channelType, setChannelType] = useState("either")
  const [selectedGoals, setSelectedGoals] = useState<string[]>(["high-views"])
  const [timeframe, setTimeframe] = useState("30")
  const [region, setRegion] = useState("global")
  const [isSearching, setIsSearching] = useState(false)
  const [results, setResults] = useState<NicheResult[]>([])
  const [error, setError] = useState("")
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)
  const [savedNiches, setSavedNiches] = useState<Set<string>>(new Set(user?.savedNiches || []))

  const hasAccess = hasFeatureAccess(user, "nicheFinder")
  const hasFacelessFilter = hasFeatureAccess(user, "facelessFiltering")
  const hasMonetization = hasFeatureAccess(user, "monetizationScore")
  const limits = user ? PLAN_LIMITS[user.plan] : PLAN_LIMITS.free

  const toggleGoal = (goal: string) => {
    setSelectedGoals((prev) => 
      prev.includes(goal) 
        ? prev.filter((g) => g !== goal) 
        : [...prev, goal]
    )
  }

  const handleSearch = async () => {
    if (!hasAccess) {
      setError("Niche Finder is only available for Creator and Pro plans")
      return
    }

    if (selectedGoals.length === 0) {
      setError("Please select at least one goal")
      return
    }

    setError("")
    setIsSearching(true)
    setResults([])

    try {
      const response = await fetch("/api/niche-finder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          channelType,
          goals: selectedGoals,
          timeframe,
          region,
          userId: user?.id 
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to find niches")
      }

      setResults(data.niches)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsSearching(false)
    }
  }

  const handleSaveNiche = async (niche: NicheResult) => {
    if (savedNiches.has(niche.id)) {
      setSavedNiches((prev) => {
        const next = new Set(prev)
        next.delete(niche.id)
        return next
      })
    } else {
      await saveNiche(niche.name)
      setSavedNiches((prev) => new Set([...prev, niche.id]))
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500"
    if (score >= 60) return "text-yellow-500"
    return "text-orange-500"
  }

  const getMonetizationColor = (rating: string) => {
    if (rating === "High") return "bg-green-500/20 text-green-500"
    if (rating === "Medium") return "bg-yellow-500/20 text-yellow-500"
    return "bg-orange-500/20 text-orange-500"
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  return (
    <div className="space-y-6">
      {/* Filters Panel */}
      <GlassCard className="p-6" hover={false}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Search className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">Niche Discovery</h3>
            <p className="text-sm text-muted-foreground">
              Find high-opportunity YouTube niches
            </p>
          </div>
        </div>

        {!hasAccess && (
          <div className="mb-6 p-4 rounded-xl bg-primary/10 border border-primary/20 flex items-center gap-3">
            <Crown className="w-5 h-5 text-primary flex-shrink-0" />
            <div>
              <p className="font-medium">Upgrade to Access Niche Finder</p>
              <p className="text-sm text-muted-foreground">
                Niche Finder is available on Creator and Pro plans
              </p>
            </div>
            <Link href="/pricing" className="ml-auto">
              <GlassButton size="sm">
                Upgrade
              </GlassButton>
            </Link>
          </div>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Channel Type */}
          <div className="space-y-2">
            <Label>Channel Type</Label>
            <Select 
              value={channelType} 
              onValueChange={setChannelType} 
              disabled={!hasAccess || (!hasFacelessFilter && channelType === "faceless")}
            >
              <SelectTrigger className="bg-input/50 border-glass-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {channelTypes.map((type) => (
                  <SelectItem 
                    key={type.value} 
                    value={type.value}
                    disabled={type.value === "faceless" && !hasFacelessFilter}
                  >
                    <div className="flex flex-col">
                      <span>{type.label}</span>
                      {type.value === "faceless" && !hasFacelessFilter && (
                        <span className="text-xs text-muted-foreground">Pro only</span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Timeframe */}
          <div className="space-y-2">
            <Label>Timeframe</Label>
            <Select value={timeframe} onValueChange={setTimeframe} disabled={!hasAccess}>
              <SelectTrigger className="bg-input/50 border-glass-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {timeframes.map((tf) => (
                  <SelectItem key={tf.value} value={tf.value}>
                    {tf.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Region */}
          <div className="space-y-2">
            <Label>Region</Label>
            <Select value={region} onValueChange={setRegion} disabled={!hasAccess}>
              <SelectTrigger className="bg-input/50 border-glass-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {regions.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Search Button */}
          <div className="space-y-2">
            <Label className="opacity-0">Search</Label>
            <GlassButton
              onClick={handleSearch}
              disabled={isSearching || !hasAccess || selectedGoals.length === 0}
              className="w-full"
            >
              {isSearching ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  Find Niches
                </>
              )}
            </GlassButton>
          </div>
        </div>

        {/* Goals Selection */}
        <div className="mt-4 space-y-2">
          <Label>Goals</Label>
          <div className="flex flex-wrap gap-2">
            {goals.map((goal) => {
              const isSelected = selectedGoals.includes(goal.value)
              const isMonetization = goal.value === "monetizable"
              const isDisabled = !hasAccess || (isMonetization && !hasMonetization)
              
              return (
                <button
                  key={goal.value}
                  onClick={() => !isDisabled && toggleGoal(goal.value)}
                  disabled={isDisabled}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 transition-all ${
                    isSelected
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-glass-border hover:border-primary/50"
                  } ${isDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                >
                  <goal.icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{goal.label}</span>
                  {isMonetization && !hasMonetization && (
                    <Crown className="w-3 h-3 text-muted-foreground" />
                  )}
                </button>
              )
            })}
          </div>
        </div>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-4 flex items-center gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm"
            >
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              {error}
            </motion.div>
          )}
        </AnimatePresence>
      </GlassCard>

      {/* Results */}
      {isSearching ? (
        <GlassCard className="p-8" hover={false}>
          <div className="text-center">
            <motion.div
              className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <Search className="w-8 h-8 text-primary" />
            </motion.div>
            <p className="text-muted-foreground">Analyzing YouTube trends and finding opportunities...</p>
          </div>
        </GlassCard>
      ) : results.length > 0 ? (
        <div className="grid md:grid-cols-2 gap-4">
          <AnimatePresence>
            {results.map((niche, index) => (
              <motion.div
                key={niche.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
              >
                <Collapsible
                  open={expandedIndex === index}
                  onOpenChange={() => setExpandedIndex(expandedIndex === index ? null : index)}
                >
                  <GlassCard className="p-5" hover={false}>
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-lg">{niche.name}</h3>
                          {niche.facelessFriendly && hasFacelessFilter && (
                            <Badge variant="secondary" className="text-xs">
                              <Video className="w-3 h-3 mr-1" />
                              Faceless
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-sm text-muted-foreground">Niche Score:</span>
                          <span className={`font-bold text-lg ${getScoreColor(niche.score)}`}>
                            {niche.score}
                          </span>
                          <span className="text-muted-foreground">/100</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleSaveNiche(niche)}
                        className="p-2 rounded-lg hover:bg-accent transition-colors"
                      >
                        {savedNiches.has(niche.id) ? (
                          <BookmarkCheck className="w-5 h-5 text-primary" />
                        ) : (
                          <Bookmark className="w-5 h-5 text-muted-foreground" />
                        )}
                      </button>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      <div className="p-3 rounded-xl bg-accent/50">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                          <Eye className="w-3 h-3" />
                          Avg. Views
                        </div>
                        <p className="font-semibold">{formatNumber(niche.avgViews)}</p>
                      </div>
                      <div className="p-3 rounded-xl bg-accent/50">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                          <Users className="w-3 h-3" />
                          Sub Growth
                        </div>
                        <p className="font-semibold">{formatNumber(niche.avgSubGrowth)}/mo</p>
                      </div>
                      {hasMonetization && (
                        <div className="p-3 rounded-xl bg-accent/50">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                            <DollarSign className="w-3 h-3" />
                            Monetization
                          </div>
                          <Badge className={getMonetizationColor(niche.monetizationRating)}>
                            {niche.monetizationRating}
                          </Badge>
                        </div>
                      )}
                    </div>

                    {/* Expand Button */}
                    <CollapsibleTrigger asChild>
                      <button className="w-full flex items-center justify-center gap-2 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                        {expandedIndex === index ? "Show Less" : "Show Details"}
                        <ChevronDown className={`w-4 h-4 transition-transform ${expandedIndex === index ? "rotate-180" : ""}`} />
                      </button>
                    </CollapsibleTrigger>

                    <CollapsibleContent>
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="pt-4 border-t border-glass-border space-y-4"
                      >
                        {/* Why it works */}
                        <div className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium">Why this niche works</p>
                            <p className="text-sm text-muted-foreground">{niche.details.whyItWorks}</p>
                          </div>
                        </div>

                        {/* Risks */}
                        <div className="flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-orange-500 mt-1 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium">Potential risks</p>
                            <ul className="text-sm text-muted-foreground list-disc list-inside">
                              {niche.details.risks.map((risk, i) => (
                                <li key={i}>{risk}</li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        {/* Example Channels */}
                        <div>
                          <p className="text-sm font-medium mb-2">Example channels</p>
                          <div className="flex flex-wrap gap-2">
                            {niche.details.exampleChannels.map((channel, i) => (
                              <Badge key={i} variant="outline">{channel}</Badge>
                            ))}
                          </div>
                        </div>

                        {/* Example Titles */}
                        <div>
                          <p className="text-sm font-medium mb-2">Example video titles</p>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            {niche.details.exampleTitles.map((title, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <span className="text-primary">•</span>
                                {title}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Quick Actions */}
                        <div className="flex flex-wrap gap-2 pt-2">
                          <Link href={`/dashboard/titles?niche=${encodeURIComponent(niche.name)}`}>
                            <GlassButton variant="secondary" size="sm">
                              <Type className="w-3 h-3" />
                              Generate Titles
                            </GlassButton>
                          </Link>
                          <Link href={`/dashboard/thumbnails?niche=${encodeURIComponent(niche.name)}`}>
                            <GlassButton variant="secondary" size="sm">
                              <ImageIcon className="w-3 h-3" />
                              Generate Thumbnails
                            </GlassButton>
                          </Link>
                          <Link href={`/dashboard?niche=${encodeURIComponent(niche.name)}`}>
                            <GlassButton variant="secondary" size="sm">
                              <FileText className="w-3 h-3" />
                              Create Script
                            </GlassButton>
                          </Link>
                        </div>
                      </motion.div>
                    </CollapsibleContent>
                  </GlassCard>
                </Collapsible>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : hasAccess ? (
        <GlassCard className="p-8" hover={false}>
          <div className="text-center text-muted-foreground">
            <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Select your filters and click Find Niches to discover opportunities.</p>
          </div>
        </GlassCard>
      ) : null}
    </div>
  )
}
