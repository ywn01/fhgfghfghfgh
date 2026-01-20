"use client"

import { motion } from "framer-motion"

interface LumiGenLogoProps {
  className?: string
  showText?: boolean
  size?: "sm" | "md" | "lg"
}

export function LumiGenLogo({ className = "", showText = true, size = "md" }: LumiGenLogoProps) {
  const sizes = {
    sm: { icon: 28, text: "text-lg" },
    md: { icon: 36, text: "text-xl" },
    lg: { icon: 48, text: "text-2xl" },
  }

  const { icon, text } = sizes[size]

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Liquid Glass Orb Icon */}
      <motion.div
        className="relative"
        whileHover={{ scale: 1.05 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      >
        <svg
          width={icon}
          height={icon}
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Outer glow */}
          <defs>
            <linearGradient id="orbGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="oklch(0.75 0.15 220)" />
              <stop offset="50%" stopColor="oklch(0.65 0.15 230)" />
              <stop offset="100%" stopColor="oklch(0.6 0.12 250)" />
            </linearGradient>
            <linearGradient id="shineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="white" stopOpacity="0.8" />
              <stop offset="50%" stopColor="white" stopOpacity="0.2" />
              <stop offset="100%" stopColor="white" stopOpacity="0" />
            </linearGradient>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          
          {/* Main orb */}
          <circle
            cx="24"
            cy="24"
            r="18"
            fill="url(#orbGradient)"
            filter="url(#glow)"
          />
          
          {/* Glass shine effect */}
          <ellipse
            cx="24"
            cy="18"
            rx="12"
            ry="8"
            fill="url(#shineGradient)"
          />
          
          {/* Inner liquid droplet */}
          <path
            d="M24 12C24 12 16 22 16 28C16 32.4183 19.5817 36 24 36C28.4183 36 32 32.4183 32 28C32 22 24 12 24 12Z"
            fill="white"
            fillOpacity="0.3"
          />
          
          {/* Highlight dot */}
          <circle cx="19" cy="16" r="3" fill="white" fillOpacity="0.6" />
        </svg>
      </motion.div>

      {showText && (
        <span className={`font-semibold tracking-tight ${text} text-foreground`}>
          LumiGen
        </span>
      )}
    </div>
  )
}
