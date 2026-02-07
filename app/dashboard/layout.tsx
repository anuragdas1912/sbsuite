import Link from "next/link"
import { LogOut, Menu } from "lucide-react"

// Simple button-like link to avoid circular deps if needed, but Button is fine.
import { Button } from "@/components/ui/button"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen bg-background relative selection:bg-primary/30">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-background/80 backdrop-blur-md h-16 flex items-center justify-between px-6">
                <Link href="/dashboard/owner" className="font-serif font-bold text-xl text-white tracking-tight">
                    SB Suite
                </Link>

                <nav className="flex items-center gap-4">
                    {/* User Menu / Avatar could go here */}
                    <Link href="/">
                        <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                            <LogOut className="h-4 w-4 mr-2" />
                            Sign Out
                        </Button>
                    </Link>
                </nav>
            </header>

            {/* Content */}
            <div className="pt-24 px-4 md:px-8 pb-12 max-w-7xl mx-auto">
                {children}
            </div>
        </div>
    )
}
