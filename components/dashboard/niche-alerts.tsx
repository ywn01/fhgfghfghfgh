"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { GlassCard } from "@/components/glass-card"
import { GlassButton } from "@/components/glass-button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { useAuth, hasFeatureAccess } from "@/lib/auth-context"
import { 
  Bell,
  BellRing,
  Loader2, 
  Crown,
  TrendingUp,
  Users,
  DollarSign,
  Eye,
  Bookmark,
  Type,
  ImageIcon,
  FileText,
  Settings,
  Trash2,
  Video,
  Sparkles,
  AlertCircle,
  Check
} from "lucide-react"
import Link from "next/link"

interface NicheAlert {
  id: string
  nicheName: string
  score: number
  triggerReason: "views" | "subs" | "monetization" | "score"
  avgViews: number
  avgSubGrowth: number
  monetizationRating: "High" | "Medium" | "Low"
  facelessFriendly: boolean
  triggeredAt: Date
  isNew: boolean
}

// Mock alerts for demo - in production these would come from the backend
const mockAlerts: NicheAlert[] = [
  {
    id: "1",
    nicheName: "AI Tool Tutorials for Beginners",
    score: 89,
    triggerReason: "score",
    avgViews: 125000,
    avgSubGrowth: 6500,
    monetizationRating: "High",
    facelessFriendly: true,
    triggeredAt: new Date(Date.now() - 1000 * 60 * 30), // 30 mins ago
    isNew: true,
  },
  {
    id: "2",
    nicheName: "Budget Home Office Setup Reviews",
    score: 82,
    triggerReason: "views",
    avgViews: 95000,
    avgSubGrowth: 4200,
    monetizationRating: "High",
    facelessFriendly: true,
    triggeredAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    isNew: true,
  },
  {
    id: "3",
    nicheName: "Productivity Apps Deep Dives",
    score: 78,
    triggerReason: "subs",
    avgViews: 75000,
    avgSubGrowth: 5800,
    monetizationRating: "Medium",
    facelessFriendly: true,
    triggeredAt: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
    isNew: false,
  },
]

const channelTypes = [
  { value: "either", label: "Either" },
  { value: "faceless", label: "Faceless Only" },
  { value: "on-camera", label: "On-Camera Only" },
]

export function NicheAlerts() {
  const { user, updateNicheAlertPreferences, saveNiche } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [alerts, setAlerts] = useState<NicheAlert[]>([])
  const [showSettings, setShowSettings] = useState(false)
  
  // Alert preferences
  const [alertsEnabled, setAlertsEnabled] = useState(user?.nicheAlertPreferences?.enabled ?? false)
  const [scoreThreshold, setScoreThreshold] = useState(user?.nicheAlertPreferences?.threshold ?? 70)
  const [channelType, setChannelType] = useState(user?.nicheAlertPreferences?.channelType ?? "either")
  const [isSaving, setIsSaving] = useState(false)

  const hasAccess = hasFeatureAccess(user, "nicheAlerts")
  const hasFacelessFilter = hasFeatureAccess(user, "facelessFiltering")
  const hasMonetization = hasFeatureAccess(user, "monetizationScore")

  useEffect(() => {
    // Simulate fetching alerts
    const fetchAlerts = async () => {
      setIsLoading(true)
      // In production, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      if (hasAccess && alertsEnabled) {
        // Filter alerts based on threshold
        const filteredAlerts = mockAlerts.filter(a => a.score >= scoreThreshold)
        setAlerts(filteredAlerts)
      } else {
        setAlerts([])
      }
      setIsLoading(false)
    }

    fetchAlerts()
  }, [hasAccess, alertsEnabled, scoreThreshold])

  const handleSavePreferences = async () => {
    setIsSaving(true)
    await updateNicheAlertPreferences({
      enabled: alertsEnabled,
      threshold: scoreThreshold,
      channelType: channelType as "faceless" | "on-camera" | "either",
    })
    setIsSaving(false)
    setShowSettings(false)
  }

  const handleDismissAlert = (alertId: string) => {
    setAlerts(prev => prev.filter(a => a.id !== alertId))
  }

  const handleSaveNiche = async (alert: NicheAlert) => {
    await saveNiche(alert.nicheName)
    setAlerts(prev => prev.map(a => 
      a.id === alert.id ? { ...a, isNew: false } : a
    ))
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

  const getTriggerReasonText = (reason: string) => {
    switch (reason) {
      case "views": return "High view velocity detected"
      case "subs": return "Fast subscriber growth"
      case "monetization": return "High monetization potential"
      case "score": return "Niche score exceeded threshold"
      default: return "Trending"
    }
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)
    if (seconds < 60) return "Just now"
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    return `${Math.floor(seconds / 86400)}d ago`
  }

  const newAlertsCount = alerts.filter(a => a.isNew).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <GlassCard className="p-6" hover={false}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center relative">
              <Bell className="w-6 h-6 text-primary" />
              {newAlertsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-xs font-bold rounded-full flex items-center justify-center">
                  {newAlertsCount}
                </span>
              )}
            </div>
            <div>
              <h2 className="text-xl font-semibold">Niche Alerts</h2>
              <p className="text-sm text-muted-foreground">
                {alertsEnabled 
                  ? `Monitoring niches with score ≥ ${scoreThreshold}`
                  : "Enable alerts to get notified"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Switch
                checked={alertsEnabled}
                onCheckedChange={setAlertsEnabled}
                disabled={!hasAccess}
              />
              <Label className="text-sm">{alertsEnabled ? "Enabled" : "Disabled"}</Label>
            </div>

            <GlassButton
              variant="secondary"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
              disabled={!hasAccess}
            >
              <Settings className="w-4 h-4" />
              Settings
            </GlassButton>
          </div>
        </div>

        {!hasAccess && (
          <div className="mt-4 p-4 rounded-xl bg-primary/10 border border-primary/20 flex items-center gap-3">
            <Crown className="w-5 h-5 text-primary flex-shrink-0" />
            <div>
              <p className="font-medium">Upgrade to Access Niche Alerts</p>
              <p className="text-sm text-muted-foreground">
                Auto Niche Alerts are available on Creator and Pro plans
              </p>
            </div>
            <Link href="/pricing" className="ml-auto">
              <GlassButton size="sm">
                Upgrade
              </GlassButton>
            </Link>
          </div>
        )}

        {/* Settings Panel */}
        <AnimatePresence>
          {showSettings && hasAccess && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-6 pt-6 border-t border-glass-border space-y-6">
                <div className="space-y-3">
                  <Label>Minimum Niche Score Threshold: {scoreThreshold}</Label>
                  <Slider
                    value={[scoreThreshold]}
                    onValueChange={(value) => setScoreThreshold(value[0])}
                    min={50}
                    max={95}
                    step={5}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">
                    You{"'"}ll be alerted when a niche reaches this score or higher
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Channel Type Filter</Label>
                  <Select 
                    value={channelType} 
                    onValueChange={setChannelType}
                    disabled={!hasFacelessFilter}
                  >
                    <SelectTrigger className="w-full md:w-64 bg-input/50 border-glass-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {channelTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-end gap-2">
                  <GlassButton
                    variant="secondary"
                    size="sm"
                    onClick={() => setShowSettings(false)}
                  >
                    Cancel
                  </GlassButton>
                  <GlassButton
                    size="sm"
                    onClick={handleSavePreferences}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                    Save Preferences
                  </GlassButton>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </GlassCard>

      {/* Alerts List */}
      {isLoading ? (
        <GlassCard className="p-8" hover={false}>
          <div className="text-center">
            <motion.div
              className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <BellRing className="w-8 h-8 text-primary" />
            </motion.div>
            <p className="text-muted-foreground">Checking for new alerts...</p>
          </div>
        </GlassCard>
      ) : alerts.length > 0 ? (
        <div className="space-y-4">
          <AnimatePresence>
            {alerts.map((alert, index) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
              >
                <GlassCard 
                  className={`p-5 ${alert.isNew ? "border-l-4 border-l-primary" : ""}`} 
                  hover={false}
                >
                  <div className="flex flex-col md:flex-row md:items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {alert.isNew && (
                          <Badge className="bg-primary/20 text-primary text-xs">New</Badge>
                        )}
                        <h3 className="font-semibold text-lg">{alert.nicheName}</h3>
                        {alert.facelessFriendly && hasFacelessFilter && (
                          <Badge variant="secondary" className="text-xs">
                            <Video className="w-3 h-3 mr-1" />
                            Faceless
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-4 mb-3 text-sm">
                        <div className="flex items-center gap-1">
                          <Sparkles className="w-4 h-4 text-primary" />
                          <span className={`font-bold ${getScoreColor(alert.score)}`}>
                            {alert.score}
                          </span>
                          <span className="text-muted-foreground">/100</span>
                        </div>
                        <span className="text-muted-foreground">
                          {formatTimeAgo(alert.triggeredAt)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 p-2 rounded-lg bg-accent/50 mb-4">
                        <TrendingUp className="w-4 h-4 text-green-500" />
                        <span className="text-sm">{getTriggerReasonText(alert.triggerReason)}</span>
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Eye className="w-4 h-4 text-muted-foreground" />
                          <span>{formatNumber(alert.avgViews)} avg views</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4 text-muted-foreground" />
                          <span>{formatNumber(alert.avgSubGrowth)}/mo growth</span>
                        </div>
                        {hasMonetization && (
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4 text-muted-foreground" />
                            <Badge className={getMonetizationColor(alert.monetizationRating)}>
                              {alert.monetizationRating}
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2">
                      <Link href={`/dashboard/titles?niche=${encodeURIComponent(alert.nicheName)}`}>
                        <GlassButton variant="secondary" size="sm">
                          <Type className="w-3 h-3" />
                          Titles
                        </GlassButton>
                      </Link>
                      <Link href={`/dashboard/thumbnails?niche=${encodeURIComponent(alert.nicheName)}`}>
                        <GlassButton variant="secondary" size="sm">
                          <ImageIcon className="w-3 h-3" />
                          Thumbnails
                        </GlassButton>
                      </Link>
                      <Link href={`/dashboard?niche=${encodeURIComponent(alert.nicheName)}`}>
                        <GlassButton variant="secondary" size="sm">
                          <FileText className="w-3 h-3" />
                          Script
                        </GlassButton>
                      </Link>
                      <GlassButton
                        variant="secondary"
                        size="sm"
                        onClick={() => handleSaveNiche(alert)}
                      >
                        <Bookmark className="w-3 h-3" />
                        Save
                      </GlassButton>
                      <GlassButton
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDismissAlert(alert.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </GlassButton>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : hasAccess && alertsEnabled ? (
        <GlassCard className="p-8" hover={false}>
          <div className="text-center text-muted-foreground">
            <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No alerts yet</p>
            <p className="text-sm mt-1">
              We{"'"}ll notify you when niches meet your threshold of {scoreThreshold}+
            </p>
          </div>
        </GlassCard>
      ) : hasAccess ? (
        <GlassCard className="p-8" hover={false}>
          <div className="text-center text-muted-foreground">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Alerts are disabled</p>
            <p className="text-sm mt-1">
              Enable alerts above to get notified about trending niches
            </p>
          </div>
        </GlassCard>
      ) : null}
    </div>
  )
}
