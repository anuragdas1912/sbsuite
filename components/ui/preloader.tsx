"use client"
import { motion } from "framer-motion"
import { useEffect, useState } from "react"

export default function Preloader() {
    const [complete, setComplete] = useState(false)

    useEffect(() => {
        const timer = setTimeout(() => {
            setComplete(true)
        }, 2500) // 2.5s intro
        return () => clearTimeout(timer)
    }, [])

    if (complete) return null

    return (
        <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ delay: 2.2, duration: 0.5, ease: "easeInOut" }}
            className="fixed inset-0 z-[100] bg-black flex items-center justify-center pointer-events-none"
        >
            {/* Loading Text */}
            <div className="overflow-hidden relative">
                <motion.h1
                    initial={{ y: 100 }}
                    animate={{ y: 0 }}
                    transition={{ duration: 1, ease: [0.76, 0, 0.24, 1] }}
                    className="text-6xl md:text-9xl font-serif text-white tracking-widest uppercase font-bold text-transparent bg-clip-text bg-gradient-to-t from-white/50 to-white"
                >
                    SB SUITE
                </motion.h1>
            </div>

            {/* Loading Bar */}
            <div className="absolute bottom-10 left-0 w-full flex justify-center">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "200px" }}
                    transition={{ duration: 2, ease: "easeInOut" }}
                    className="h-[1px] bg-primary"
                />
            </div>
        </motion.div>
    )
}
