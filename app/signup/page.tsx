"use client"

import React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { LumiGenLogo } from "@/components/lumigen-logo"
import { GlassButton } from "@/components/glass-button"
import { GlassCard } from "@/components/glass-card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/lib/auth-context"
import { AlertCircle, Loader2, ArrowLeft, Check } from "lucide-react"

export default function SignupPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const { signup, isLoading } = useAuth()
  const router = useRouter()

  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    
    if (!email || !password || !confirmPassword) {
      setError("Please fill in all fields")
      return
    }
    
    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }
    
    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }
    
    const result = await signup(email, password)
    
    if (result.success) {
      if (result.needsConfirmation) {
        // Show success message for email confirmation
        setSuccess(true)
      } else {
        // User is immediately signed in, redirect to dashboard
        window.location.href = "/dashboard"
      }
    } else {
      setError(result.error || "An error occurred during signup")
    }
  }

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Animated background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 liquid-gradient-animated opacity-30" />
        <div 
          className="absolute top-1/3 left-1/4 w-80 h-80 rounded-full blur-3xl opacity-20"
          style={{ background: "oklch(0.7 0.15 220)" }}
        />
        <div 
          className="absolute bottom-1/4 right-1/3 w-72 h-72 rounded-full blur-3xl opacity-15"
          style={{ background: "oklch(0.65 0.12 250)" }}
        />
      </div>

      {/* Back link */}
      <nav className="p-6">
        <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back to home</span>
        </Link>
      </nav>

      {/* Signup form */}
      <main className="flex-1 flex items-center justify-center px-6 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <GlassCard className="p-8">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <LumiGenLogo size="lg" showText={false} />
              </div>
              <h1 className="text-2xl font-bold mb-2">Create Your Account</h1>
              <p className="text-muted-foreground text-sm">
                Start creating viral content in minutes
              </p>
            </div>

            {/* Success message for email confirmation */}
            {success ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-6"
              >
                <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-xl font-semibold mb-2">Check your email</h2>
                <p className="text-muted-foreground text-sm mb-4">
                  {"We've sent a confirmation link to"} <strong>{email}</strong>. 
                  Please click the link to verify your account.
                </p>
                <Link href="/login">
                  <GlassButton variant="outline" className="mt-4">
                    Back to Login
                  </GlassButton>
                </Link>
              </motion.div>
            ) : (
              <div>
                {/* Benefits */}
                <div className="mb-6 space-y-2">
                  {[
                    "5 free script generations per day",
                    "Access to AI-powered tools",
                    "No credit card required",
                  ].map((benefit) => (
                    <div key={benefit} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <Check className="w-2.5 h-2.5 text-primary" />
                      </div>
                      {benefit}
                    </div>
                  ))}
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive"
                    >
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span className="text-sm">{error}</span>
                    </motion.div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-input/50 border-glass-border backdrop-blur-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Create a password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="bg-input/50 border-glass-border backdrop-blur-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="bg-input/50 border-glass-border backdrop-blur-sm"
                    />
                  </div>

                  <GlassButton type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      "Create Account"
                    )}
                  </GlassButton>
                </form>

                <div className="mt-6 text-center">
                  <p className="text-sm text-muted-foreground">
                    Already have an account?{" "}
                    <Link href="/login" className="text-primary hover:underline">
                      Sign in
                    </Link>
                  </p>
                </div>
              </div>
            )}
          </GlassCard>
        </motion.div>
      </main>
    </div>
  )
}
