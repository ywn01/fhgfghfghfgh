"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { GlassCard } from "@/components/glass-card"
import { 
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
  Legend
} from "recharts"
import { FileText, ImageIcon, TrendingUp, Loader2, BarChart3, Type, Search, Flame, Bell } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface AnalyticsData {
  totalScripts: number
  totalThumbnails: number
  totalTitles: number
  totalNicheSearches: number
  avgCtrScore: number
  usageByPlan: { name: string; value: number; color: string }[]
  generationTrends: { name: string; scripts: number; thumbnails: number; titles: number }[]
  topNicheCategories: { name: string; searches: number }[]
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{value: number; name?: string; color?: string}>; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-panel rounded-lg p-3 shadow-lg border border-glass-border">
        <p className="text-sm font-medium">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm text-muted-foreground">
            {entry.name || "Count"}: {entry.value}
          </p>
        ))}
      </div>
    )
  }
  return null
}

export function AdminAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchAnalytics = async () => {
      setIsLoading(true)
      
      const { data: profiles, error } = await supabase
        .from("profiles")
        .select("*")
      
      if (profiles && !error) {
        const totalScripts = profiles.reduce((sum, p) => sum + (p.script_usage || 0), 0)
        const totalThumbnails = profiles.reduce((sum, p) => sum + (p.thumbnail_usage || 0), 0)
        const totalTitles = profiles.reduce((sum, p) => sum + (p.title_usage || 0), 0)
        const totalNicheSearches = profiles.reduce((sum, p) => sum + (p.niche_finder_usage || 0), 0)
        
        // Calculate usage by plan
        const planUsage = profiles.reduce((acc, p) => {
          const plan = p.plan || "free"
          if (!acc[plan]) {
            acc[plan] = { scripts: 0, thumbnails: 0, titles: 0, niches: 0 }
          }
          acc[plan].scripts += p.script_usage || 0
          acc[plan].thumbnails += p.thumbnail_usage || 0
          acc[plan].titles += p.title_usage || 0
          acc[plan].niches += p.niche_finder_usage || 0
          return acc
        }, {} as Record<string, { scripts: number; thumbnails: number; titles: number; niches: number }>)
        
        const totalUsage = totalScripts + totalThumbnails + totalTitles + totalNicheSearches
        const usageByPlan = [
          { 
            name: "Free", 
            value: totalUsage > 0 
              ? Math.round(((planUsage.free?.scripts || 0) + (planUsage.free?.thumbnails || 0) + (planUsage.free?.titles || 0)) / totalUsage * 100) 
              : 0, 
            color: "oklch(0.6 0.1 240)" 
          },
          { 
            name: "Creator", 
            value: totalUsage > 0 
              ? Math.round(((planUsage.creator?.scripts || 0) + (planUsage.creator?.thumbnails || 0) + (planUsage.creator?.titles || 0) + (planUsage.creator?.niches || 0)) / totalUsage * 100) 
              : 0, 
            color: "oklch(0.75 0.12 220)" 
          },
          { 
            name: "Pro", 
            value: totalUsage > 0 
              ? Math.round(((planUsage.pro?.scripts || 0) + (planUsage.pro?.thumbnails || 0) + (planUsage.pro?.titles || 0) + (planUsage.pro?.niches || 0)) / totalUsage * 100) 
              : 0, 
            color: "oklch(0.65 0.15 230)" 
          },
        ]

        // Mock generation trends (in production, this would come from time-series data)
        const generationTrends = [
          { name: "Mon", scripts: 45, thumbnails: 32, titles: 78 },
          { name: "Tue", scripts: 52, thumbnails: 41, titles: 95 },
          { name: "Wed", scripts: 61, thumbnails: 48, titles: 112 },
          { name: "Thu", scripts: 58, thumbnails: 55, titles: 98 },
          { name: "Fri", scripts: 72, thumbnails: 62, titles: 134 },
          { name: "Sat", scripts: 48, thumbnails: 38, titles: 87 },
          { name: "Sun", scripts: 42, thumbnails: 35, titles: 72 },
        ]

        // Mock top niche categories
        const topNicheCategories = [
          { name: "AI & Tech", searches: 342 },
          { name: "Finance", searches: 287 },
          { name: "Gaming", searches: 256 },
          { name: "Lifestyle", searches: 198 },
          { name: "Education", searches: 175 },
        ]
        
        setData({
          totalScripts,
          totalThumbnails,
          totalTitles,
          totalNicheSearches,
          avgCtrScore: 7.2, // Mock average CTR score
          usageByPlan,
          generationTrends,
          topNicheCategories,
        })
      }
      
      setIsLoading(false)
    }
    
    fetchAnalytics()
  }, [supabase])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  const hasData = data && (data.totalScripts > 0 || data.totalThumbnails > 0 || data.totalTitles > 0)

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Scripts", value: data?.totalScripts.toLocaleString() || "0", icon: FileText, color: "text-blue-500" },
          { label: "Total Thumbnails", value: data?.totalThumbnails.toLocaleString() || "0", icon: ImageIcon, color: "text-green-500" },
          { label: "Total Titles", value: data?.totalTitles.toLocaleString() || "0", icon: Type, color: "text-purple-500" },
          { label: "Niche Searches", value: data?.totalNicheSearches.toLocaleString() || "0", icon: Search, color: "text-orange-500" },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <GlassCard className="p-5" hover={false}>
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl bg-accent/50 flex items-center justify-center`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Secondary Stats */}
      <div className="grid sm:grid-cols-3 gap-4">
        <GlassCard className="p-5" hover={false}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{data?.avgCtrScore.toFixed(1) || "0"}/10</p>
              <p className="text-sm text-muted-foreground">Avg CTR Score</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-5" hover={false}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center">
              <Flame className="w-6 h-6 text-orange-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{data?.topNicheCategories[0]?.name || "N/A"}</p>
              <p className="text-sm text-muted-foreground">Top Niche Category</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-5" hover={false}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
              <Bell className="w-6 h-6 text-purple-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">24</p>
              <p className="text-sm text-muted-foreground">Active Alerts Today</p>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Charts Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Generation Trends */}
        <GlassCard className="p-6" hover={false}>
          <h3 className="font-semibold mb-6">Weekly Generation Trends</h3>
          {hasData ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data?.generationTrends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.4 0 0 / 0.2)" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false}
                    tick={{ fill: 'oklch(0.556 0 0)', fontSize: 12 }}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false}
                    tick={{ fill: 'oklch(0.556 0 0)', fontSize: 12 }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="scripts" 
                    stroke="oklch(0.65 0.15 230)" 
                    strokeWidth={2}
                    dot={false}
                    name="Scripts"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="thumbnails" 
                    stroke="oklch(0.6 0.15 150)" 
                    strokeWidth={2}
                    dot={false}
                    name="Thumbnails"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="titles" 
                    stroke="oklch(0.6 0.15 300)" 
                    strokeWidth={2}
                    dot={false}
                    name="Titles"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
                <p className="text-muted-foreground text-sm">No generation data yet</p>
              </div>
            </div>
          )}
        </GlassCard>

        {/* Usage by Plan */}
        <GlassCard className="p-6" hover={false}>
          <h3 className="font-semibold mb-6">Usage by Plan</h3>
          {hasData && data?.usageByPlan.some(p => p.value > 0) ? (
            <>
              <div className="h-64 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.usageByPlan.filter(p => p.value > 0)}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {data.usageByPlan.filter(p => p.value > 0).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center justify-center gap-6 mt-4">
                {data.usageByPlan.map((plan) => (
                  <div key={plan.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ background: plan.color }} />
                    <span className="text-sm text-muted-foreground">{plan.name} ({plan.value}%)</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-64 flex items-center justify-center">
              <div className="text-center">
                <TrendingUp className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
                <p className="text-muted-foreground text-sm">No usage data yet</p>
              </div>
            </div>
          )}
        </GlassCard>

        {/* Feature Usage Comparison */}
        <GlassCard className="p-6" hover={false}>
          <h3 className="font-semibold mb-6">Feature Usage Comparison</h3>
          {hasData ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[
                  { name: "Scripts", value: data?.totalScripts || 0 },
                  { name: "Titles", value: data?.totalTitles || 0 },
                  { name: "Thumbnails", value: data?.totalThumbnails || 0 },
                  { name: "Niches", value: data?.totalNicheSearches || 0 },
                ]}>
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false}
                    tick={{ fill: 'oklch(0.556 0 0)', fontSize: 12 }}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false}
                    tick={{ fill: 'oklch(0.556 0 0)', fontSize: 12 }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar 
                    dataKey="value" 
                    fill="oklch(0.65 0.15 230)" 
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
                <p className="text-muted-foreground text-sm">No generation data yet</p>
              </div>
            </div>
          )}
        </GlassCard>

        {/* Top Niche Categories */}
        <GlassCard className="p-6" hover={false}>
          <h3 className="font-semibold mb-6">Top Niche Categories</h3>
          {data?.topNicheCategories && data.topNicheCategories.length > 0 ? (
            <div className="space-y-4">
              {data.topNicheCategories.map((category, index) => (
                <div key={category.name} className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-lg bg-accent/50 flex items-center justify-center text-sm font-bold text-muted-foreground">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">{category.name}</span>
                      <span className="text-sm text-muted-foreground">{category.searches} searches</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-primary rounded-full"
                        initial={{ width: 0 }}
                        animate={{ 
                          width: `${(category.searches / data.topNicheCategories[0].searches) * 100}%` 
                        }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center">
              <div className="text-center">
                <Search className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
                <p className="text-muted-foreground text-sm">No niche search data yet</p>
              </div>
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  )
}
