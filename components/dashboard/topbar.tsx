"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { GlassButton } from "@/components/glass-button"
import { Crown, Shield } from "lucide-react"

interface TopbarProps {
  title: string
  description?: string
}

export function DashboardTopbar({ title, description }: TopbarProps) {
  const { user } = useAuth()

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel rounded-2xl p-6 mb-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          {description && (
            <p className="text-muted-foreground text-sm mt-1">{description}</p>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          {user?.role === "admin" && (
            <Link href="/admin">
              <GlassButton variant="secondary" size="sm">
                <Shield className="w-4 h-4" />
                Admin
              </GlassButton>
            </Link>
          )}
          
          {user?.plan !== "pro" && (
            <Link href="/pricing">
              <GlassButton size="sm">
                <Crown className="w-4 h-4" />
                Upgrade
              </GlassButton>
            </Link>
          )}
        </div>
      </div>
    </motion.header>
  )
}
