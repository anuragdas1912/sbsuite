"use client"

import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { useLanguage } from "@/context/language-context"

export function LoginLayout({ title, subtitle, children, icon, colorClass = "from-primary/20" }: { title: string, subtitle: string, children: React.ReactNode, icon: React.ReactNode, colorClass?: string }) {
    const { t } = useLanguage()

    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-4 relative overflow-hidden bg-background selection:bg-primary/30 selection:text-foreground">

            {/* Back Button */}
            <Link href="/home" className="absolute top-6 left-6 z-50">
                <Button variant="ghost" size="sm" className="gap-2">
                    <ArrowLeft className="w-4 h-4" /> {t('back_to_hub')}
                </Button>
            </Link>

            {/* Cinematic Background */}
            <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className={`absolute top-[-20%] right-[-20%] w-[80vw] h-[80vw] rounded-full bg-gradient-radial ${colorClass} via-transparent to-transparent blur-[120px] opacity-40`} />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="z-10 max-w-md w-full"
            >
                <div className="glass-panel p-8 md:p-12 space-y-8 relative overflow-hidden">
                    {/* Glossy sheen */}
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/50 to-transparent opacity-50" />

                    <div className="text-center space-y-2">
                        <div className="inline-flex p-4 rounded-full bg-background/50 mb-4 border border-border shadow-inner">
                            {icon}
                        </div>
                        <h1 className="text-3xl font-serif font-bold">{title}</h1>
                        <p className="text-muted-foreground text-sm">{subtitle}</p>
                    </div>

                    {children}

                </div>
            </motion.div>
        </main>
    )
}
