import React from "react"
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Providers } from '@/components/providers'
import './globals.css'

const inter = Inter({ 
  subsets: ["latin"],
  variable: '--font-sans'
});

export const metadata: Metadata = {
  title: 'LumiGen - Create Viral YouTube Scripts & Thumbnails',
  description: 'Generate viral YouTube scripts and stunning thumbnails instantly with AI. Powered by advanced AI technology for content creators.',
  keywords: ['YouTube', 'AI', 'Script Generator', 'Thumbnail Generator', 'Content Creator', 'Video Marketing'],
    generator: 'v0.app'
}

export const viewport: Viewport = {
  themeColor: '#60a5fa',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.variable} font-sans antialiased overflow-x-hidden`}>
        <Providers>
          {children}
        </Providers>
        <Analytics />
      </body>
    </html>
  )
}
