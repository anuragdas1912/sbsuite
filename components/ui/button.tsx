"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "outline" | "ghost"
    size?: "sm" | "md" | "lg"
    asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "primary", size = "md", asChild = false, ...props }, ref) => {

        // Magnetic logic
        const refLocal = React.useRef<HTMLButtonElement>(null)
        const x = useMotionValue(0)
        const y = useMotionValue(0)

        const mouseXSpring = useSpring(x)
        const mouseYSpring = useSpring(y)

        const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
            const { height, width, left, top } = e.currentTarget.getBoundingClientRect();
            const mouseX = e.clientX - left - width / 2;
            const mouseY = e.clientY - top - height / 2;
            x.set(mouseX * 0.1); // Magnetic strength
            y.set(mouseY * 0.1);
        }

        const handleMouseLeave = () => {
            x.set(0);
            y.set(0);
        }

        const baseStyles = "relative overflow-hidden inline-flex items-center justify-center rounded-lg font-medium transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50 active:scale-95 group"

        const variants = {
            primary: "bg-primary text-black hover:bg-primary/90 shadow-[0_0_25px_-5px_var(--tw-shadow-color)] shadow-primary/40 hover:shadow-primary/60 border border-primary/20",
            secondary: "bg-white/10 backdrop-blur-md text-secondary hover:bg-white/20 border border-white/10 hover:border-white/20 hover:shadow-[0_0_15px_-5px_rgba(255,255,255,0.3)]",
            outline: "border border-primary/40 text-primary hover:bg-primary/5 bg-transparent hover:border-primary/80 hover:shadow-[0_0_10px_rgba(197,160,89,0.3)]",
            ghost: "hover:bg-white/5 text-secondary hover:text-white",
        }

        const sizes = {
            sm: "h-9 px-4 text-xs tracking-wide uppercase",
            md: "h-11 px-8 text-sm tracking-wide uppercase",
            lg: "h-14 px-10 text-base tracking-widest uppercase font-semibold",
        }

        return (
            <motion.button
                ref={refLocal}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                style={{ x: mouseXSpring, y: mouseYSpring }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={cn(baseStyles, variants[variant], sizes[size], className)}
                {...(props as any)}
            >
                <span className="relative z-20 flex items-center justify-center gap-2 pointer-events-none">
                    {props.children}
                </span>

                {/* Hover Highlight (Sheen) */}
                <div className="absolute inset-0 z-10 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] skew-x-12" />
            </motion.button>
        )
    }
)
Button.displayName = "Button"

export { Button }
