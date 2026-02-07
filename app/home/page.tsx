"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, Home, Zap, ShieldCheck, ArrowRight } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { useRef } from "react"
import { ModeToggle } from "@/components/mode-toggle"
import { useLanguage } from "@/context/language-context"

export default function PortalHub() {
    const containerRef = useRef(null)
    const { t } = useLanguage()

    return (
        <main ref={containerRef} className="flex min-h-screen flex-col items-center p-4 md:p-24 relative overflow-hidden bg-background selection:bg-primary/30 selection:text-foreground transition-colors duration-500">

            {/* Navbar with Toggles */}
            <nav className="absolute top-6 right-6 z-50 flex gap-4">
                <ModeToggle />
                <Link href="/">
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground uppercase tracking-widest text-xs">
                        Language
                    </Button>
                </Link>
            </nav>

            {/* Cinematic Background */}
            <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-50%] left-[-50%] w-[150%] h-[150%] rounded-full bg-gradient-radial from-primary/10 via-transparent to-transparent blur-3xl animate-aurora opacity-30 mix-blend-multiply dark:mix-blend-screen" />
                {/* Grid */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:80px_80px] opacity-[0.03]" />
            </div>

            <div className="z-10 max-w-7xl w-full flex flex-col items-center text-center space-y-16 relative pt-20">

                {/* Header */}
                <div className="space-y-4">
                    <motion.p
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-primary tracking-[0.3em] text-xs uppercase font-bold"
                    >
                        {t('welcome')}
                    </motion.p>
                    <motion.h1
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="text-6xl md:text-9xl font-serif font-bold text-foreground tracking-tighter"
                    >
                        SB SUITE
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.8 }}
                        className="text-lg text-muted-foreground font-light max-w-xl mx-auto"
                    >
                        {t('select_portal')}
                    </motion.p>
                </div>

                {/* Portal Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full pt-8 perspective-1000">

                    {/* Residential */}
                    <LoginCard
                        href="/login/residential"
                        icon={<Home className="w-8 h-8" />}
                        title={t('residential')}
                        desc={t('residential_desc')}
                        delay={0.1}
                        t={t}
                    />

                    {/* Commercial */}
                    <LoginCard
                        href="/login/commercial"
                        icon={<Building2 className="w-8 h-8" />}
                        title={t('commercial')}
                        desc={t('commercial_desc')}
                        delay={0.2}
                        t={t}
                    />

                    {/* Parking */}
                    <LoginCard
                        href="/login/parking"
                        icon={<Zap className="w-8 h-8" />}
                        title={t('parking')}
                        desc={t('parking_desc')}
                        delay={0.3}
                        t={t}
                    />

                    {/* Admin */}
                    <LoginCard
                        href="/login/admin"
                        icon={<ShieldCheck className="w-8 h-8" />}
                        title={t('admin')}
                        desc={t('admin_desc')}
                        delay={0.4}
                        admin={true}
                        t={t}
                    />
                </div>

                <footer className="absolute bottom-6 text-[10px] tracking-[0.2em] text-muted-foreground uppercase font-bold">
                    SB Suite © 2026 • Das Market
                </footer>
            </div>
        </main>
    )
}

function LoginCard({ href, icon, title, desc, delay, admin = false, t }: any) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: delay, duration: 0.6 }}
        >
            <Link href={href} className="block h-full group">
                <Card className={`h-full border-border bg-card/40 backdrop-blur-xl hover:bg-card/80 transition-all duration-500 cursor-pointer hover:-translate-y-2 hover:shadow-xl ${admin ? 'border-primary/20 bg-primary/5' : ''}`}>
                    <CardHeader className="items-center text-center pt-10">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-transform duration-500 group-hover:scale-110 ${admin ? 'bg-primary text-black shadow-lg shadow-primary/20' : 'bg-muted text-foreground group-hover:bg-primary/20 group-hover:text-primary'}`}>
                            {icon}
                        </div>
                        <CardTitle className="text-2xl font-serif">{title}</CardTitle>
                        <CardDescription className="text-sm pt-2 min-h-[40px]">{desc}</CardDescription>
                    </CardHeader>
                    <CardContent className="pb-10 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0">
                        <span className="text-xs font-bold text-primary tracking-widest uppercase flex items-center">
                            {t('enter_portal')} <ArrowRight className="ml-2 w-3 h-3" />
                        </span>
                    </CardContent>
                </Card>
            </Link>
        </motion.div>
    )
}
