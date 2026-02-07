"use client"

import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import Link from "next/link"
import { useLanguage } from "@/context/language-context"

const languages = [
  { code: "en", name: "English", label: "Enter" },
  { code: "hi", name: "हिन्दी", label: "प्रवेश करें" },
  { code: "mr", name: "मराठी", label: "प्रवेश करा" },
  { code: "bn", name: "বাংলা", label: "প্রবেশ করুন" },
  { code: "pa", name: "ਪੰਜਾਬੀ", label: "ਦਾਖਲ ਕਰੋ" },
  { code: "gu", name: "ગુજરાતી", label: "પવેશ કરો" },
]

export default function LanguagePage() {
  const { setLanguage } = useLanguage()

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 relative overflow-hidden bg-background selection:bg-primary/30 selection:text-foreground transition-colors duration-500">

      {/* Background Subtle Gradient */}
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-20%] w-[80vw] h-[80vw] rounded-full bg-primary/5 blur-[120px] animate-pulse duration-[8000ms]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-indigo-500/5 blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="z-10 max-w-4xl w-full flex flex-col items-center text-center space-y-12"
      >
        <div className="space-y-4">
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-foreground tracking-tight">
            Select Your Language
          </h1>
          <p className="text-muted-foreground text-lg font-light tracking-wide">
            Choose your preferred language to continue to SB Suite.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 w-full max-w-2xl">
          {languages.map((lang, index) => (
            <motion.div
              key={lang.code}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 + 0.5, duration: 0.5 }}
            >
              <Link href="/home" className="block h-full" onClick={() => setLanguage(lang.code as any)}>
                <Button
                  variant="secondary"
                  className="w-full h-32 flex flex-col items-center justify-center gap-2 text-xl font-serif hover:scale-105 transition-transform border border-border bg-card/50 backdrop-blur-md shadow-sm hover:shadow-lg dark:bg-white/5"
                >
                  <span className="text-3xl font-bold text-primary">{lang.name}</span>
                  <span className="text-xs text-muted-foreground uppercase tracking-widest">{lang.label}</span>
                </Button>
              </Link>
            </motion.div>
          ))}
        </div>

        <footer className="absolute bottom-8 text-xs text-muted-foreground uppercase tracking-[0.2em] opacity-50">
          SB Suite Experience © 2026
        </footer>

      </motion.div>
    </main>
  )
}
