"use client"

import type React from "react"
import { cn } from "@/lib/utils"

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  className?: string
  hover?: boolean
  glow?: boolean
  shine?: boolean
}

export function GlassCard({
  children,
  className,
  hover = true,
  glow = false,
  shine = true,
  ...props
}: GlassCardProps) {
  return (
    <div
      className={cn(
        "relative rounded-2xl overflow-hidden",
        "bg-glass backdrop-blur-xl",
        "border border-glass-border",
        "shadow-lg shadow-primary/5",
        "transition-all duration-200",
        hover && "hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10",
        glow && "glow-primary",
        className
      )}
      {...props}
    >
      {/* Glass shine overlay */}
      {shine && (
        <div 
          className="absolute inset-x-0 top-0 h-1/2 pointer-events-none"
          style={{
            background: "linear-gradient(180deg, oklch(1 0 0 / 0.15) 0%, transparent 100%)",
            borderRadius: "inherit",
          }}
        />
      )}
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}
