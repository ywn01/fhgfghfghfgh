"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LumiGenLogo } from "@/components/lumigen-logo"
import { useAuth, PLAN_LIMITS } from "@/lib/auth-context"
import { FileText, ImageIcon, BarChart2, LogOut, Crown, Menu, X, Type, Search, Bell, Flame } from "lucide-react"
import { useState } from "react"

const navItems = [
  { 
    href: "/dashboard", 
    label: "Script Generator", 
    icon: FileText,
    exact: true 
  },
  { 
    href: "/dashboard/titles", 
    label: "Title Generator", 
    icon: Type 
  },
  { 
    href: "/dashboard/thumbnails", 
    label: "Thumbnail Generator", 
    icon: ImageIcon 
  },
  { 
    href: "/dashboard/niche-finder", 
    label: "Niche Finder", 
    icon: Search 
  },
  { 
    href: "/dashboard/hot-niches", 
    label: "Hot Niches", 
    icon: Flame,
    badge: "Daily"
  },
  { 
    href: "/dashboard/niche-alerts", 
    label: "Niche Alerts", 
    icon: Bell 
  },
  { 
    href: "/dashboard/usage", 
    label: "Usage", 
    icon: BarChart2 
  },
]

export function DashboardSidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  
  const limits = user ? PLAN_LIMITS[user.plan] : PLAN_LIMITS.free

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <LumiGenLogo size="md" />
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const isActive = item.exact 
            ? pathname === item.href 
            : pathname.startsWith(item.href)
          
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                "hover:bg-sidebar-accent",
                isActive && "bg-sidebar-accent text-sidebar-accent-foreground"
              )}
            >
              <item.icon className={cn(
                "w-5 h-5",
                isActive ? "text-primary" : "text-muted-foreground"
              )} />
              <span className={cn(
                "font-medium flex-1",
                isActive ? "text-foreground" : "text-muted-foreground"
              )}>
                {item.label}
              </span>
              {"badge" in item && item.badge && (
                <span className="px-2 py-0.5 text-xs rounded-full bg-primary/20 text-primary font-medium">
                  {item.badge}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Plan & Usage */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="glass-panel rounded-xl p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium capitalize">{user?.plan} Plan</span>
            {user?.plan !== "pro" && (
              <Link href="/pricing">
                <span className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                  <Crown className="w-3 h-3" />
                  Upgrade
                </span>
              </Link>
            )}
          </div>
          
          {/* Script usage */}
          <div className="space-y-1 mb-3">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Scripts</span>
              <span>
                {user?.scriptUsage || 0} / {limits.scripts === Infinity ? "∞" : limits.scripts}
              </span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-primary rounded-full"
                initial={{ width: 0 }}
                animate={{ 
                  width: `${limits.scripts === Infinity ? 10 : Math.min(100, ((user?.scriptUsage || 0) / limits.scripts) * 100)}%` 
                }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
          
          {/* Thumbnail usage */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Thumbnails</span>
              <span>
                {user?.thumbnailUsage || 0} / {limits.thumbnails === Infinity ? "∞" : limits.thumbnails}
              </span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-accent rounded-full"
                initial={{ width: 0 }}
                animate={{ 
                  width: `${limits.thumbnails === Infinity ? 10 : (limits.thumbnails === 0 ? 0 : Math.min(100, ((user?.thumbnailUsage || 0) / limits.thumbnails) * 100))}%` 
                }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        </div>

        {/* User info & Logout */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-medium text-primary">
                {user?.email?.[0]?.toUpperCase() || "U"}
              </span>
            </div>
            <span className="text-sm text-muted-foreground truncate">
              {user?.email || "User"}
            </span>
          </div>
          <button
            onClick={logout}
            className="p-2 rounded-lg hover:bg-sidebar-accent transition-colors"
            title="Logout"
          >
            <LogOut className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>
    </>
  )

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-50 md:hidden glass-panel p-3 rounded-xl"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <motion.aside
        initial={{ x: "-100%" }}
        animate={{ x: mobileOpen ? 0 : "-100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed inset-y-0 left-0 z-50 w-72 md:hidden glass-panel flex flex-col"
      >
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-sidebar-accent transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        <SidebarContent />
      </motion.aside>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 md:left-0 glass-panel border-r border-sidebar-border">
        <SidebarContent />
      </aside>
    </>
  )
}
