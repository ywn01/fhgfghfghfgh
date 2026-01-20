"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { GlassCard } from "@/components/glass-card"
import { GlassButton } from "@/components/glass-button"
import { Input } from "@/components/ui/input"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
  Search, 
  MoreHorizontal, 
  Crown, 
  RefreshCw, 
  Ban,
  ArrowUpDown,
  Check,
  Users,
  Loader2
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import type { UserPlan } from "@/lib/auth-context"

interface UserProfile {
  id: string
  email: string
  plan: UserPlan
  script_usage: number
  thumbnail_usage: number
  last_reset: string
  role: string
  created_at: string
}

export function AdminUsers() {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [planFilter, setPlanFilter] = useState<string>("all")
  const [actionSuccess, setActionSuccess] = useState<string | null>(null)
  const supabase = createClient()

  // Fetch users from database
  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true)
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false })
      
      if (data && !error) {
        setUsers(data)
      }
      setIsLoading(false)
    }
    
    fetchUsers()
  }, [supabase])

  const filteredUsers = users.filter((user) => {
    const matchesSearch = user.email?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesPlan = planFilter === "all" || user.plan === planFilter
    return matchesSearch && matchesPlan
  })

  const handleChangePlan = async (userId: string, newPlan: UserPlan) => {
    const { error } = await supabase
      .from("profiles")
      .update({ plan: newPlan })
      .eq("id", userId)
    
    if (!error) {
      setUsers((prev) =>
        prev.map((user) =>
          user.id === userId ? { ...user, plan: newPlan } : user
        )
      )
      showSuccess("Plan updated successfully")
    }
  }

  const handleResetUsage = async (userId: string) => {
    const { error } = await supabase
      .from("profiles")
      .update({ 
        script_usage: 0, 
        thumbnail_usage: 0, 
        last_reset: new Date().toISOString() 
      })
      .eq("id", userId)
    
    if (!error) {
      setUsers((prev) =>
        prev.map((user) =>
          user.id === userId
            ? { ...user, script_usage: 0, thumbnail_usage: 0, last_reset: new Date().toISOString() }
            : user
        )
      )
      showSuccess("Usage reset successfully")
    }
  }

  const showSuccess = (message: string) => {
    setActionSuccess(message)
    setTimeout(() => setActionSuccess(null), 3000)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Success Toast */}
      <AnimatePresence>
        {actionSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-600"
          >
            <Check className="w-4 h-4" />
            {actionSuccess}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters */}
      <GlassCard className="p-4" hover={false}>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search users by email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-input/50 border-glass-border"
            />
          </div>
          <Select value={planFilter} onValueChange={setPlanFilter}>
            <SelectTrigger className="w-full sm:w-40 bg-input/50 border-glass-border">
              <SelectValue placeholder="Filter by plan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Plans</SelectItem>
              <SelectItem value="free">Free</SelectItem>
              <SelectItem value="creator">Creator</SelectItem>
              <SelectItem value="pro">Pro</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </GlassCard>

      {/* Users Table */}
      <GlassCard className="overflow-hidden" hover={false}>
        {filteredUsers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left p-4 font-medium text-muted-foreground">
                    <button className="flex items-center gap-1 hover:text-foreground transition-colors">
                      Email
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Plan</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Scripts</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Thumbnails</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Last Reset</th>
                  <th className="text-right p-4 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user, index) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-medium text-primary">
                            {user.email?.[0]?.toUpperCase() || "?"}
                          </span>
                        </div>
                        <span className="text-sm">{user.email || "No email"}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                        user.plan === "pro" 
                          ? "bg-primary/10 text-primary" 
                          : user.plan === "creator"
                            ? "bg-accent/10 text-accent"
                            : "bg-muted text-muted-foreground"
                      }`}>
                        {user.plan === "pro" && <Crown className="w-3 h-3" />}
                        {user.plan?.charAt(0).toUpperCase() + user.plan?.slice(1) || "Free"}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">{user.script_usage || 0}</td>
                    <td className="p-4 text-sm text-muted-foreground">{user.thumbnail_usage || 0}</td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {user.last_reset ? new Date(user.last_reset).toLocaleDateString() : "-"}
                    </td>
                    <td className="p-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <GlassButton variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </GlassButton>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onClick={() => handleChangePlan(user.id, "free")}>
                            <Crown className="w-4 h-4 mr-2 text-muted-foreground" />
                            Set to Free
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleChangePlan(user.id, "creator")}>
                            <Crown className="w-4 h-4 mr-2 text-accent" />
                            Set to Creator
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleChangePlan(user.id, "pro")}>
                            <Crown className="w-4 h-4 mr-2 text-primary" />
                            Set to Pro
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleResetUsage(user.id)}>
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Reset Usage
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-medium mb-2">No users found</h3>
            <p className="text-sm text-muted-foreground">
              {searchQuery || planFilter !== "all" 
                ? "Try adjusting your search or filter criteria." 
                : "Users will appear here once they sign up."}
            </p>
          </div>
        )}
      </GlassCard>
    </div>
  )
}
