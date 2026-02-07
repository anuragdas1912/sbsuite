import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import './globals.css'
import { cn } from "@/lib/utils"

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' })

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
      <body className={cn(inter.variable, playfair.variable, 'font-sans antialiased bg-background')}>
        {children}
      </body>
    </html>
  )
}
