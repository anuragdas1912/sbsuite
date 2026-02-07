import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import './globals.css'
import { cn } from "@/lib/utils"
import CustomCursor from '@/components/ui/custom-cursor'
import Preloader from '@/components/ui/preloader'
import { ThemeProvider } from "@/components/theme-provider"
import { LanguageProvider } from "@/context/language-context"

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
            <body className={cn(inter.variable, playfair.variable, 'font-sans antialiased bg-background text-foreground transition-colors duration-300')}>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="dark"
                    enableSystem
                    disableTransitionOnChange
                >
                    <LanguageProvider>
                        <div className="fixed inset-0 w-full h-full bg-noise opacity-[0.03] z-[50] pointer-events-none mix-blend-overlay"></div>
                        <CustomCursor />
                        <Preloader />
                        {children}
                    </LanguageProvider>
                </ThemeProvider>
            </body>
        </html>
    )
}
