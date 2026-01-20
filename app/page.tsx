"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { LumiGenLogo } from "@/components/lumigen-logo"
import { GlassButton } from "@/components/glass-button"
import { GlassCard } from "@/components/glass-card"
import { Sparkles, ImageIcon, Youtube, Zap, ArrowRight, ChevronRight } from "lucide-react"

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
}

export default function LandingPage() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated liquid gradient background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 liquid-gradient-animated opacity-50" />
        <div 
          className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-30"
          style={{ background: "oklch(0.7 0.15 220)" }}
        />
        <div 
          className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full blur-3xl opacity-20"
          style={{ background: "oklch(0.65 0.12 250)" }}
        />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <motion.div 
            className="flex items-center justify-between glass-panel rounded-2xl px-6 py-3"
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
          >
            <LumiGenLogo size="sm" />
            
            <div className="hidden md:flex items-center gap-8">
              <Link href="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Pricing
              </Link>
              <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Login
              </Link>
              <Link href="/signup">
                <GlassButton size="sm">
                  Get Started
                </GlassButton>
              </Link>
            </div>
            
            <Link href="/signup" className="md:hidden">
              <GlassButton size="sm">
                Start
              </GlassButton>
            </Link>
          </motion.div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="mx-auto max-w-5xl text-center">
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="space-y-8"
          >
            {/* Headline */}
            <motion.h1 
              variants={fadeInUp}
              className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight text-balance"
            >
              Generate Viral YouTube
              <br />
              <span className="text-gradient">Scripts & Thumbnails</span>
              <br />
              Instantly
            </motion.h1>

            {/* Subtext */}
            <motion.p 
              variants={fadeInUp}
              className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto text-pretty"
            >
              Create engaging scripts and eye-catching thumbnails for your YouTube videos with the power of AI. Perfect for content creators who want to go viral.
            </motion.p>

            {/* CTAs */}
            <motion.div 
              variants={fadeInUp}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link href="/signup">
                <GlassButton size="lg" className="w-full sm:w-auto">
                  Get Started Free
                  <ArrowRight className="w-5 h-5" />
                </GlassButton>
              </Link>
              <Link href="/login">
                <GlassButton variant="secondary" size="lg" className="w-full sm:w-auto">
                  Login
                </GlassButton>
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div 
              variants={fadeInUp}
              className="flex flex-wrap items-center justify-center gap-8 pt-8"
            >
              {[
                { value: "10K+", label: "Creators" },
                { value: "1M+", label: "Scripts Generated" },
                { value: "500K+", label: "Thumbnails Created" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-gradient">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything You Need to Create
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Powerful AI tools designed specifically for YouTube content creators
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Sparkles,
                title: "AI Script Generator",
                description: "Generate engaging, viral-ready scripts tailored to your niche and audience in seconds.",
              },
              {
                icon: ImageIcon,
                title: "Nano Banana Pro Thumbnails",
                description: "Create stunning 16:9 thumbnails with AI. Upload reference images for style matching.",
              },
              {
                icon: Youtube,
                title: "YouTube Optimized",
                description: "All content is optimized for YouTube's algorithm to maximize views and engagement.",
              },
              {
                icon: Zap,
                title: "Lightning Fast",
                description: "Get your scripts and thumbnails in seconds, not hours. Focus on creating, not waiting.",
              },
              {
                icon: ChevronRight,
                title: "Creator Workflow",
                description: "Streamlined process designed by creators, for creators. From idea to upload in minutes.",
              },
              {
                icon: ArrowRight,
                title: "Reference Support",
                description: "Upload existing thumbnails as references to match styles or create variations.",
              },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <GlassCard className="p-6 h-full">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <GlassCard className="p-8 md:p-12 text-center" glow>
              <h2 className="text-2xl md:text-4xl font-bold mb-4">
                Ready to Create Viral Content?
              </h2>
              <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
                Join thousands of creators who are already using LumiGen to grow their channels.
              </p>
              <Link href="/signup">
                <GlassButton size="lg">
                  Start Creating Now
                  <ArrowRight className="w-5 h-5" />
                </GlassButton>
              </Link>
            </GlassCard>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-border/50">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <LumiGenLogo size="sm" />
            
            <div className="flex items-center gap-8">
              <Link href="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Pricing
              </Link>
              <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Login
              </Link>
              <Link href="/signup" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Sign Up
              </Link>
            </div>
            
            <p className="text-sm text-muted-foreground">
              2026 LumiGen. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
