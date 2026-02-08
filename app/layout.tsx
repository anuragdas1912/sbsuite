import type { Metadata, Viewport } from 'next'
import './globals.css'
import { cn } from "@/lib/utils"
import Preloader from '@/components/ui/preloader'
import { ThemeProvider } from "@/components/theme-provider"
import { LanguageProvider } from "@/context/language-context"
import ServiceWorkerCleanup from '@/components/service-worker-cleanup'

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
            <body className={cn('font-sans antialiased bg-background text-foreground transition-colors duration-300')}>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="dark"
                    enableSystem
                    disableTransitionOnChange
                >
                    <LanguageProvider>
                        <ServiceWorkerCleanup />
                        <div className="fixed inset-0 w-full h-full bg-noise opacity-[0.03] z-[50] pointer-events-none mix-blend-overlay"></div>
                        <Preloader />
                        {children}
                    </LanguageProvider>
                </ThemeProvider>
            </body>
        </html>
    )
}
