"use client"
import { useEffect, useState } from "react"
import { motion, useMotionValue, useSpring } from "framer-motion"

export default function CustomCursor() {
    const mouseX = useMotionValue(0)
    const mouseY = useMotionValue(0)
    const [hovered, setHovered] = useState(false)

    const springConfig = { damping: 25, stiffness: 300 }
    const cursorX = useSpring(mouseX, springConfig)
    const cursorY = useSpring(mouseY, springConfig)

    useEffect(() => {
        const moveCursor = (e: MouseEvent) => {
            mouseX.set(e.clientX - 16)
            mouseY.set(e.clientY - 16)
        }

        const handleMouseOver = (e: MouseEvent) => {
            const target = e.target as HTMLElement
            if (target.tagName === 'BUTTON' || target.tagName === 'A' || target.closest('[data-hover="true"]')) {
                setHovered(true)
            } else {
                setHovered(false)
            }
        }

        window.addEventListener("mousemove", moveCursor)
        window.addEventListener("mouseover", handleMouseOver)

        return () => {
            window.removeEventListener("mousemove", moveCursor)
            window.removeEventListener("mouseover", handleMouseOver)
        }
    }, [mouseX, mouseY])

    return (
        <motion.div
            className="fixed top-0 left-0 w-8 h-8 rounded-full border border-primary/50 pointer-events-none z-[9999] mix-blend-difference flex items-center justify-center p-1"
            style={{
                x: cursorX,
                y: cursorY,
                scale: hovered ? 1.5 : 1,
                backgroundColor: hovered ? 'rgba(197, 160, 89, 0.1)' : 'transparent'
            }}
        >
            <div className={`w-1 h-1 bg-primary rounded-full transition-all duration-300 ${hovered ? 'w-2 h-2 opacity-50' : 'opacity-100'}`} />
        </motion.div>
    )
}
