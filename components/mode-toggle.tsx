"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

export function ModeToggle() {
    const { theme, setTheme } = useTheme()

    return (
        <Button variant="outline" size="sm" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="h-9 w-9 p-0 rounded-full border-primary/20 bg-background/50 hover:bg-background/80 backdrop-blur-sm">
            <motion.div
                initial={false}
                animate={{ rotate: theme === "dark" ? 0 : 90, scale: theme === "dark" ? 1 : 0 }}
                transition={{ duration: 0.2 }}
                className="absolute"
            >
                <Moon className="h-4 w-4 text-primary" />
            </motion.div>

            <motion.div
                initial={false}
                animate={{ rotate: theme === "dark" ? -90 : 0, scale: theme === "dark" ? 0 : 1 }}
                transition={{ duration: 0.2 }}
                className="absolute"
            >
                <Sun className="h-4 w-4 text-orange-500" />
            </motion.div>
        </Button>
    )
}
