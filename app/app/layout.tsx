import type { Metadata, Viewport } from 'next'
import './globals.css'
import { cn } from "@/lib/utils"

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export const metadata: Metadata = {
  title: 'SB Suite @ Das Market',
  description: 'Modern Infrastructure. Managed Seamlessly.',
  manifest: '/manifest.json'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={cn('font-sans antialiased bg-background')}>
        {children}
      </body>
    </html>
  )
}
