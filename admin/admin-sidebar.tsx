"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LumiGenLogo } from "@/components/lumigen-logo"
import { useAuth } from "@/lib/auth-context"
import { 
  LayoutDashboard, 
  Users, 
  BarChart3, 
  LogOut, 
  ArrowLeft,
  Shield
} from "lucide-react"

const navItems = [
  { 
    href: "/admin", 
    label: "Overview", 
    icon: LayoutDashboard,
    exact: true 
  },
  { 
    href: "/admin/users", 
    label: "Users", 
    icon: Users 
  },
  { 
    href: "/admin/analytics", 
    label: "Analytics", 
    icon: BarChart3 
  },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  return (
    <aside className="hidden md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 md:left-0 glass-panel border-r border-sidebar-border">
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <LumiGenLogo size="sm" showText={false} />
          <div>
            <span className="font-semibold">LumiGen</span>
            <div className="flex items-center gap-1 text-xs text-primary">
              <Shield className="w-3 h-3" />
              Admin Panel
            </div>
          </div>
        </div>
      </div>

      {/* Back to Dashboard */}
      <div className="p-4 border-b border-sidebar-border">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
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
                "font-medium",
                isActive ? "text-foreground" : "text-muted-foreground"
              )}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </nav>

      {/* User info & Logout */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-medium text-primary">
                {user?.email?.[0]?.toUpperCase() || "A"}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{user?.email}</p>
              <p className="text-xs text-muted-foreground">Administrator</p>
            </div>
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
    </aside>
  )
}
