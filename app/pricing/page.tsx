"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { LumiGenLogo } from "@/components/lumigen-logo"
import { GlassButton } from "@/components/glass-button"
import { GlassCard } from "@/components/glass-card"
import { Check, X, Sparkles, ArrowLeft } from "lucide-react"

const plans = [
  {
    name: "Free",
    description: "Perfect for trying out LumiGen",
    price: "$0",
    period: "forever",
    features: [
      { text: "5 script generations per day", included: true },
      { text: "Basic AI models", included: true },
      { text: "Thumbnail generation", included: false },
      { text: "Reference image support", included: false },
      { text: "Priority processing", included: false },
    ],
    cta: "Get Started",
    popular: false,
  },
  {
    name: "Creator",
    description: "For growing content creators",
    price: "$19",
    period: "per month",
    features: [
      { text: "100 scripts per month", included: true },
      { text: "30 thumbnails per month", included: true },
      { text: "Reference image support", included: true },
      { text: "Advanced AI models", included: true },
      { text: "Priority processing", included: false },
    ],
    cta: "Start Creating",
    popular: true,
  },
  {
    name: "Pro",
    description: "For professional creators",
    price: "$49",
    period: "per month",
    features: [
      { text: "Unlimited scripts", included: true },
      { text: "Unlimited thumbnails", included: true },
      { text: "Reference image support", included: true },
      { text: "Nano Banana Pro processing", included: true },
      { text: "Priority support", included: true },
    ],
    cta: "Go Pro",
    popular: false,
  },
]

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
}

export default function PricingPage() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 liquid-gradient-animated opacity-30" />
        <div 
          className="absolute top-1/3 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-20"
          style={{ background: "oklch(0.7 0.15 220)" }}
        />
        <div 
          className="absolute bottom-1/4 right-1/3 w-80 h-80 rounded-full blur-3xl opacity-15"
          style={{ background: "oklch(0.65 0.12 250)" }}
        />
      </div>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 px-6 py-4">
        <div className="mx-auto max-w-7xl">
          <motion.div 
            className="flex items-center justify-between glass-panel rounded-2xl px-6 py-3"
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
          >
            <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Back</span>
            </Link>
            
            <LumiGenLogo size="sm" />
            
            <Link href="/signup">
              <GlassButton size="sm">
                Sign Up
              </GlassButton>
            </Link>
          </motion.div>
        </div>
      </nav>

      {/* Header */}
      <section className="pt-12 pb-8 px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-4"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel text-sm text-muted-foreground">
            <Sparkles className="w-4 h-4 text-primary" />
            Simple, Transparent Pricing
          </span>
          <h1 className="text-4xl md:text-5xl font-bold">
            Choose Your Plan
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Start for free and upgrade as you grow. All plans include access to our AI-powered tools.
          </p>
        </motion.div>
      </section>

      {/* Pricing Cards */}
      <section className="py-12 px-6">
        <div className="mx-auto max-w-6xl">
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative"
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                    <span className="px-4 py-1 rounded-full bg-primary text-primary-foreground text-sm font-medium shadow-lg shadow-primary/30">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <GlassCard 
                  className={`p-6 lg:p-8 h-full flex flex-col ${plan.popular ? "ring-2 ring-primary glow-primary" : ""}`}
                  glow={plan.popular}
                >
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
                    <p className="text-muted-foreground text-sm">{plan.description}</p>
                  </div>

                  <div className="mb-6">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground ml-2">{plan.period}</span>
                  </div>

                  <ul className="space-y-3 mb-8 flex-1">
                    {plan.features.map((feature) => (
                      <li key={feature.text} className="flex items-center gap-3">
                        {feature.included ? (
                          <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                            <Check className="w-3 h-3 text-primary" />
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                            <X className="w-3 h-3 text-muted-foreground" />
                          </div>
                        )}
                        <span className={feature.included ? "text-foreground" : "text-muted-foreground"}>
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <Link href="/signup" className="mt-auto">
                    <GlassButton 
                      variant={plan.popular ? "primary" : "secondary"} 
                      className="w-full"
                    >
                      {plan.cta}
                    </GlassButton>
                  </Link>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ or Additional Info */}
      <section className="py-12 px-6">
        <div className="mx-auto max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <GlassCard className="p-8">
              <h3 className="text-xl font-semibold mb-4">Need More?</h3>
              <p className="text-muted-foreground mb-6">
                Contact us for custom enterprise plans with unlimited usage, dedicated support, and custom integrations.
              </p>
              <GlassButton variant="secondary">
                Contact Sales
              </GlassButton>
            </GlassCard>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-border/50">
        <div className="mx-auto max-w-6xl flex items-center justify-center">
          <p className="text-sm text-muted-foreground">
            2026 LumiGen. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
