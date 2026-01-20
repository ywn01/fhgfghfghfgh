"use client"

import { motion } from "framer-motion"
import { GlassCard } from "@/components/glass-card"
import { GlassButton } from "@/components/glass-button"
import { useAuth, PLAN_LIMITS } from "@/lib/auth-context"
import { FileText, ImageIcon, Crown, Calendar, TrendingUp } from "lucide-react"
import Link from "next/link"

export function UsageStats() {
  const { user } = useAuth()
  const limits = user ? PLAN_LIMITS[user.plan] : PLAN_LIMITS.free

  const stats = [
    {
      label: "Scripts Generated",
      value: user?.scriptUsage || 0,
      limit: limits.scripts,
      icon: FileText,
      color: "primary",
    },
    {
      label: "Thumbnails Created",
      value: user?.thumbnailUsage || 0,
      limit: limits.thumbnails,
      icon: ImageIcon,
      color: "accent",
    },
  ]

  const resetInfo = limits.resetPeriod === "day" 
    ? "Resets daily at midnight UTC" 
    : "Resets monthly"

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 gap-6">
        {stats.map((stat, index) => {
          const percentage = stat.limit === Infinity 
            ? 0 
            : stat.limit === 0 
              ? 100 
              : (stat.value / stat.limit) * 100
          const isWarning = percentage >= 80 && percentage < 100
          const isMaxed = percentage >= 100

          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <GlassCard className="p-6" hover={false}>
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-${stat.color}/10 flex items-center justify-center`}>
                    <stat.icon className={`w-6 h-6 text-${stat.color}`} />
                  </div>
                  {stat.limit === Infinity && (
                    <span className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                      Unlimited
                    </span>
                  )}
                </div>

                <div className="mb-4">
                  <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold">{stat.value}</span>
                    <span className="text-muted-foreground">
                      / {stat.limit === Infinity ? "∞" : stat.limit}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full ${
                      isMaxed 
                        ? "bg-destructive" 
                        : isWarning 
                          ? "bg-yellow-500" 
                          : `bg-${stat.color}`
                    }`}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, percentage)}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  />
                </div>

                {isMaxed && stat.limit !== 0 && (
                  <p className="text-destructive text-xs mt-2">
                    Limit reached. Upgrade for more.
                  </p>
                )}
              </GlassCard>
            </motion.div>
          )
        })}
      </div>

      {/* Plan Info */}
      <GlassCard className="p-6" hover={false}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
              <Crown className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold capitalize">{user?.plan || "Free"} Plan</h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                {resetInfo}
              </div>
            </div>
          </div>

          {user?.plan !== "pro" && (
            <Link href="/pricing">
              <GlassButton>
                <TrendingUp className="w-4 h-4" />
                Upgrade Plan
              </GlassButton>
            </Link>
          )}
        </div>

        {/* Plan comparison */}
        <div className="mt-6 pt-6 border-t border-border/50">
          <h4 className="text-sm font-medium mb-4">Plan Comparison</h4>
          <div className="grid grid-cols-3 gap-4 text-sm">
            {(["free", "creator", "pro"] as const).map((plan) => {
              const planLimits = PLAN_LIMITS[plan]
              const isCurrentPlan = user?.plan === plan

              return (
                <div
                  key={plan}
                  className={`p-4 rounded-xl ${
                    isCurrentPlan 
                      ? "bg-primary/10 border border-primary/20" 
                      : "bg-muted/30"
                  }`}
                >
                  <p className={`font-medium capitalize mb-2 ${isCurrentPlan ? "text-primary" : ""}`}>
                    {plan}
                    {isCurrentPlan && " (Current)"}
                  </p>
                  <ul className="space-y-1 text-muted-foreground text-xs">
                    <li>
                      {planLimits.scripts === Infinity ? "∞" : planLimits.scripts} scripts/{planLimits.resetPeriod}
                    </li>
                    <li>
                      {planLimits.thumbnails === Infinity ? "∞" : planLimits.thumbnails} thumbnails/{planLimits.resetPeriod}
                    </li>
                  </ul>
                </div>
              )
            })}
          </div>
        </div>
      </GlassCard>
    </div>
  )
}
