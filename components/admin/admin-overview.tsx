"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { GlassCard } from "@/components/glass-card"
import { Users, FileText, ImageIcon, TrendingUp, Activity, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface Stats {
  totalUsers: number
  totalScripts: number
  totalThumbnails: number
  planDistribution: { plan: string; users: number; percentage: number }[]
}

export function AdminOverview() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true)
      
      // Fetch all profiles
      const { data: profiles, error } = await supabase
        .from("profiles")
        .select("*")
      
      if (profiles && !error) {
        const totalUsers = profiles.length
        const totalScripts = profiles.reduce((sum, p) => sum + (p.script_usage || 0), 0)
        const totalThumbnails = profiles.reduce((sum, p) => sum + (p.thumbnail_usage || 0), 0)
        
        // Calculate plan distribution
        const planCounts = profiles.reduce((acc, p) => {
          const plan = p.plan || "free"
          acc[plan] = (acc[plan] || 0) + 1
          return acc
        }, {} as Record<string, number>)
        
        const planDistribution = ["free", "creator", "pro"].map((plan) => ({
          plan,
          users: planCounts[plan] || 0,
          percentage: totalUsers > 0 ? Math.round(((planCounts[plan] || 0) / totalUsers) * 100) : 0,
        }))
        
        setStats({
          totalUsers,
          totalScripts,
          totalThumbnails,
          planDistribution,
        })
      }
      
      setIsLoading(false)
    }
    
    fetchStats()
  }, [supabase])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  const statCards = [
    {
      label: "Total Users",
      value: stats?.totalUsers.toLocaleString() || "0",
      icon: Users,
    },
    {
      label: "Scripts Generated",
      value: stats?.totalScripts.toLocaleString() || "0",
      icon: FileText,
    },
    {
      label: "Thumbnails Created",
      value: stats?.totalThumbnails.toLocaleString() || "0",
      icon: ImageIcon,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <GlassCard className="p-6" hover={false}>
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <stat.icon className="w-5 h-5 text-primary" />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Plan Distribution */}
      <div className="grid lg:grid-cols-2 gap-6">
        <GlassCard className="p-6" hover={false}>
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Users by Plan</h3>
          </div>
          
          {stats && stats.totalUsers > 0 ? (
            <div className="space-y-4">
              {stats.planDistribution.map((plan) => (
                <div key={plan.plan} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium capitalize">{plan.plan}</span>
                    <span className="text-muted-foreground">
                      {plan.users.toLocaleString()} users ({plan.percentage}%)
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-primary rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${plan.percentage}%` }}
                      transition={{ duration: 0.8, delay: 0.2 }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground text-sm">No users yet</p>
            </div>
          )}
        </GlassCard>

        <GlassCard className="p-6" hover={false}>
          <div className="flex items-center gap-2 mb-6">
            <Activity className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Quick Stats</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-border/50">
              <span className="text-sm text-muted-foreground">Avg. Scripts per User</span>
              <span className="font-medium">
                {stats && stats.totalUsers > 0 
                  ? (stats.totalScripts / stats.totalUsers).toFixed(1) 
                  : "0"}
              </span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-border/50">
              <span className="text-sm text-muted-foreground">Avg. Thumbnails per User</span>
              <span className="font-medium">
                {stats && stats.totalUsers > 0 
                  ? (stats.totalThumbnails / stats.totalUsers).toFixed(1) 
                  : "0"}
              </span>
            </div>
            <div className="flex items-center justify-between py-3">
              <span className="text-sm text-muted-foreground">Total Generations</span>
              <span className="font-medium">
                {((stats?.totalScripts || 0) + (stats?.totalThumbnails || 0)).toLocaleString()}
              </span>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  )
}
