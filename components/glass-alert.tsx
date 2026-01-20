"use client"

import { motion, AnimatePresence } from "framer-motion"
import { AlertTriangle, CheckCircle, Info, XCircle, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface GlassAlertProps {
  type: "success" | "error" | "warning" | "info"
  message: string
  show: boolean
  onClose?: () => void
  className?: string
}

const alertConfig = {
  success: {
    icon: CheckCircle,
    bgColor: "bg-green-500/10",
    borderColor: "border-green-500/20",
    textColor: "text-green-600",
    iconColor: "text-green-500",
  },
  error: {
    icon: XCircle,
    bgColor: "bg-destructive/10",
    borderColor: "border-destructive/20",
    textColor: "text-destructive",
    iconColor: "text-destructive",
  },
  warning: {
    icon: AlertTriangle,
    bgColor: "bg-yellow-500/10",
    borderColor: "border-yellow-500/20",
    textColor: "text-yellow-600",
    iconColor: "text-yellow-500",
  },
  info: {
    icon: Info,
    bgColor: "bg-primary/10",
    borderColor: "border-primary/20",
    textColor: "text-primary",
    iconColor: "text-primary",
  },
}

export function GlassAlert({ type, message, show, onClose, className }: GlassAlertProps) {
  const config = alertConfig[type]
  const Icon = config.icon

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className={cn(
            "fixed top-4 right-4 z-50 max-w-md",
            "glass-panel rounded-xl p-4",
            config.bgColor,
            config.borderColor,
            className
          )}
        >
          <div className="flex items-start gap-3">
            <Icon className={cn("w-5 h-5 flex-shrink-0 mt-0.5", config.iconColor)} />
            <p className={cn("text-sm flex-1", config.textColor)}>{message}</p>
            {onClose && (
              <button
                onClick={onClose}
                className="p-1 rounded-lg hover:bg-background/50 transition-colors"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Hook for managing alerts
import { useState, useCallback } from "react"

export function useGlassAlert() {
  const [alert, setAlert] = useState<{
    type: "success" | "error" | "warning" | "info"
    message: string
    show: boolean
  }>({
    type: "info",
    message: "",
    show: false,
  })

  const showAlert = useCallback((type: "success" | "error" | "warning" | "info", message: string, duration = 5000) => {
    setAlert({ type, message, show: true })
    
    if (duration > 0) {
      setTimeout(() => {
        setAlert((prev) => ({ ...prev, show: false }))
      }, duration)
    }
  }, [])

  const hideAlert = useCallback(() => {
    setAlert((prev) => ({ ...prev, show: false }))
  }, [])

  return { alert, showAlert, hideAlert }
}
