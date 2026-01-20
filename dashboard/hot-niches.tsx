"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { GlassCard } from "@/components/glass-card"
import { GlassButton } from "@/components/glass-button"
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth, hasFeatureAccess } from "@/lib/auth-context"
import { 
  Flame,
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
  RefreshCw,
  Video,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Film,
  Clapperboard,
  Play
} from "lucide-react"
import Link from "next/link"

const regions = [
  { value: "global", label: "Global" },
  { value: "us", label: "United States" },
  { value: "uk", label: "United Kingdom" },
  { value: "in", label: "India" },
  { value: "br", label: "Brazil" },
  { value: "de", label: "Germany" },
]

interface ChannelInfo {
  name: string
  subscribers: string
  avgViews: string
  channelUrl: string
  isFaceless: boolean
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
  channels?: ChannelInfo[]
  details: {
    whyItWorks: string
    risks: string[]
    exampleChannels: string[]
    exampleTitles: string[]
  }
}

export function HotNiches() {
  const { user, saveNiche } = useAuth()
  const [region, setRegion] = useState("global")
  const [contentType, setContentType] = useState<"all" | "long-form" | "short-form">("all")
  const [isLoading, setIsLoading] = useState(true)
  const [niches, setNiches] = useState<HotNiche[]>([])
  const [error, setError] = useState("")
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)
  const [savedNiches, setSavedNiches] = useState<Set<string>>(new Set(user?.savedNiches || []))
  const [lastUpdated, setLastUpdated] = useState<string>("")
  const [hasYouTubeData, setHasYouTubeData] = useState(false)

  const hasAccess = hasFeatureAccess(user, "hotNicheFeed")
  const hasFacelessFilter = hasFeatureAccess(user, "facelessFiltering")
  const hasMonetization = hasFeatureAccess(user, "monetizationScore")

  const fetchHotNiches = async () => {
    if (!hasAccess) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const params = new URLSearchParams({ region })
      if (contentType !== "all") {
        params.append("contentType", contentType)
      }
      
      const response = await fetch(`/api/daily-hot-niches?${params}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch hot niches")
      }

      setNiches(data.niches)
      setLastUpdated(data.date)
      setHasYouTubeData(data.hasYouTubeData || false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchHotNiches()
  }, [region, contentType, hasAccess])

  const handleSaveNiche = async (niche: HotNiche) => {
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

  const getContentTypeIcon = (type: string) => {
    if (type === "long-form") return <Film className="w-3 h-3" />
    if (type === "short-form") return <Clapperboard className="w-3 h-3" />
    return <Play className="w-3 h-3" />
  }

  const getContentTypeLabel = (type: string) => {
    if (type === "long-form") return "Long Form"
    if (type === "short-form") return "Shorts"
    return "Both"
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const filteredNiches = niches.filter(niche => {
    if (contentType === "all") return true
    return niche.contentType === contentType || niche.contentType === "both"
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <GlassCard className="p-6" hover={false}>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500/20 to-red-500/20 flex items-center justify-center">
                <Flame className="w-6 h-6 text-orange-500" />
              </div>
              <div>
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  Daily Hot Niches
                  <Badge className="bg-orange-500/20 text-orange-500">Live</Badge>
                  {hasYouTubeData && (
                    <Badge variant="outline" className="text-xs">
                      YouTube Data
                    </Badge>
                  )}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {lastUpdated ? `Updated: ${lastUpdated}` : "Top trending faceless niches today"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Select value={region} onValueChange={setRegion} disabled={!hasAccess}>
                <SelectTrigger className="w-40 bg-input/50 border-glass-border">
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

              <GlassButton
                variant="secondary"
                size="sm"
                onClick={fetchHotNiches}
                disabled={isLoading || !hasAccess}
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
                Refresh
              </GlassButton>
            </div>
          </div>

          {/* Content Type Filter */}
          {hasAccess && (
            <Tabs value={contentType} onValueChange={(v) => setContentType(v as typeof contentType)} className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-muted/50">
                <TabsTrigger value="all" className="flex items-center gap-2 data-[state=active]:bg-background">
                  <Play className="w-4 h-4" />
                  All Content
                </TabsTrigger>
                <TabsTrigger value="long-form" className="flex items-center gap-2 data-[state=active]:bg-background">
                  <Film className="w-4 h-4" />
                  Long Form
                </TabsTrigger>
                <TabsTrigger value="short-form" className="flex items-center gap-2 data-[state=active]:bg-background">
                  <Clapperboard className="w-4 h-4" />
                  Shorts
                </TabsTrigger>
              </TabsList>
            </Tabs>
          )}
        </div>

        {!hasAccess && (
          <div className="mt-4 p-4 rounded-xl bg-primary/10 border border-primary/20 flex items-center gap-3">
            <Crown className="w-5 h-5 text-primary flex-shrink-0" />
            <div>
              <p className="font-medium">Upgrade to Access Hot Niches</p>
              <p className="text-sm text-muted-foreground">
                Daily Hot Niches feed is available on Creator and Pro plans
              </p>
            </div>
            <Link href="/pricing" className="ml-auto">
              <GlassButton size="sm">
                Upgrade
              </GlassButton>
            </Link>
          </div>
        )}
      </GlassCard>

      {/* Loading State */}
      {isLoading ? (
        <GlassCard className="p-8" hover={false}>
          <div className="text-center">
            <motion.div
              className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-orange-500/20 to-red-500/20 flex items-center justify-center"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <Flame className="w-8 h-8 text-orange-500" />
            </motion.div>
            <p className="text-muted-foreground">Fetching today{"'"}s hottest faceless niches...</p>
          </div>
        </GlassCard>
      ) : error ? (
        <GlassCard className="p-8" hover={false}>
          <div className="text-center text-destructive">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>{error}</p>
          </div>
        </GlassCard>
      ) : filteredNiches.length > 0 ? (
        <div className="grid md:grid-cols-2 gap-4">
          <AnimatePresence>
            {filteredNiches.map((niche, index) => (
              <motion.div
                key={niche.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
              >
                <Collapsible
                  open={expandedIndex === index}
                  onOpenChange={() => setExpandedIndex(expandedIndex === index ? null : index)}
                >
                  <GlassCard className="p-5 relative overflow-hidden" hover={false}>
                    {/* Hot rank badge */}
                    {index < 3 && (
                      <div className="absolute top-0 right-0 px-3 py-1 bg-gradient-to-l from-orange-500/20 to-transparent rounded-bl-xl">
                        <span className="text-xs font-bold text-orange-500">#{index + 1}</span>
                      </div>
                    )}

                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="font-semibold text-lg">{niche.name}</h3>
                          {niche.facelessFriendly && hasFacelessFilter && (
                            <Badge variant="secondary" className="text-xs">
                              <Video className="w-3 h-3 mr-1" />
                              Faceless
                            </Badge>
                          )}
                          <Badge variant="outline" className="text-xs">
                            {getContentTypeIcon(niche.contentType)}
                            <span className="ml-1">{getContentTypeLabel(niche.contentType)}</span>
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1">
                          <Sparkles className="w-4 h-4 text-orange-500" />
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

                    {/* Trending reason */}
                    <p className="text-sm text-muted-foreground mb-4 flex items-start gap-2">
                      <TrendingUp className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                      {niche.trendingReason}
                    </p>

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
                        {expandedIndex === index ? "Show Less" : "Show Details & Channels"}
                        <ChevronDown className={`w-4 h-4 transition-transform ${expandedIndex === index ? "rotate-180" : ""}`} />
                      </button>
                    </CollapsibleTrigger>

                    <CollapsibleContent>
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="pt-4 border-t border-glass-border space-y-4"
                      >
                        {/* Real YouTube Channels */}
                        {niche.channels && niche.channels.length > 0 && (
                          <div>
                            <p className="text-sm font-medium mb-3 flex items-center gap-2">
                              <Video className="w-4 h-4 text-red-500" />
                              Faceless Channels in This Niche
                            </p>
                            <div className="space-y-2">
                              {niche.channels.map((channel, i) => (
                                <a
                                  key={i}
                                  href={channel.channelUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center justify-between p-3 rounded-lg bg-accent/30 hover:bg-accent/50 transition-colors group"
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center">
                                      <Video className="w-4 h-4 text-red-500" />
                                    </div>
                                    <div>
                                      <p className="font-medium text-sm flex items-center gap-1">
                                        {channel.name}
                                        {channel.isFaceless && (
                                          <Badge variant="outline" className="text-[10px] px-1 py-0">Faceless</Badge>
                                        )}
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        {channel.subscribers} subs · {channel.avgViews} avg views
                                      </p>
                                    </div>
                                  </div>
                                  <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                                </a>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Why it works */}
                        <div className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium">Why this niche is hot</p>
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
                          <p className="text-sm font-medium mb-2">Example channels to study</p>
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
                                <span className="text-primary">-</span>
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
            <Flame className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No hot niches available for the selected filter.</p>
            <p className="text-sm mt-1">Try selecting a different content type.</p>
          </div>
        </GlassCard>
      ) : null}
    </div>
  )
}
