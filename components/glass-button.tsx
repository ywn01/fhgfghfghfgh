"use client"

import type React from "react"
import { cn } from "@/lib/utils"
import { forwardRef } from "react"

interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost"
  size?: "sm" | "md" | "lg"
  children: React.ReactNode
}

export const GlassButton = forwardRef<HTMLButtonElement, GlassButtonProps>(
  ({ variant = "primary", size = "md", className, children, disabled, ...props }, ref) => {
    const baseStyles = cn(
      "relative inline-flex items-center justify-center gap-2",
      "font-medium rounded-xl overflow-hidden",
      "transition-all duration-200",
      "disabled:opacity-50 disabled:cursor-not-allowed",
      "hover:scale-[1.02] active:scale-[0.98]"
    )

    const variants = {
      primary: cn(
        "bg-primary text-primary-foreground",
        "shadow-lg shadow-primary/25",
        "hover:shadow-xl hover:shadow-primary/30"
      ),
      secondary: cn(
        "bg-glass backdrop-blur-xl",
        "border border-glass-border",
        "text-foreground",
        "hover:bg-secondary"
      ),
      ghost: cn(
        "bg-transparent",
        "text-foreground",
        "hover:bg-secondary/50"
      ),
    }

    const sizes = {
      sm: "px-4 py-2 text-sm",
      md: "px-6 py-3 text-base",
      lg: "px-8 py-4 text-lg",
    }

    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {/* Shine effect for primary */}
        {variant === "primary" && (
          <span 
            className="absolute inset-x-0 top-0 h-1/2 pointer-events-none"
            style={{
              background: "linear-gradient(180deg, oklch(1 0 0 / 0.2) 0%, transparent 100%)",
            }}
          />
        )}
        <span className="relative z-10 flex items-center gap-2">{children}</span>
      </button>
    )
  }
)

GlassButton.displayName = "GlassButton"
