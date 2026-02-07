import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Camera, Zap, Wallet, Plus, History } from "lucide-react"

export default function ManagerDashboard() {
    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-serif font-medium text-white">Field Operations</h1>
                <p className="text-gray-400">Intake, Readings & Cash</p>
            </div>

            {/* Field-Flow Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button className="h-32 flex flex-col items-center justify-center gap-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-primary/50 transition-all group">
                    <div className="p-3 rounded-full bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                        <Plus className="h-6 w-6" />
                    </div>
                    <span className="font-medium text-white">Capture Intake</span>
                </button>

                <button className="h-32 flex flex-col items-center justify-center gap-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-primary/50 transition-all group">
                    <div className="p-3 rounded-full bg-indigo-500/10 text-indigo-400 group-hover:scale-110 transition-transform">
                        <Zap className="h-6 w-6" />
                    </div>
                    <span className="font-medium text-white">Monthly Reading</span>
                </button>

                <button className="h-32 flex flex-col items-center justify-center gap-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-primary/50 transition-all group">
                    <div className="p-3 rounded-full bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition-transform">
                        <Wallet className="h-6 w-6" />
                    </div>
                    <span className="font-medium text-white">Record Cash</span>
                </button>
            </div>

            {/* Digital Wallet / Deposit Flow */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                <Card className="bg-gradient-to-br from-white/5 to-transparent border-white/10">
                    <CardHeader>
                        <CardTitle className="text-lg font-serif">Digital Wallet</CardTitle>
                        <CardDescription>Cash collected but not deposited.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-serif text-white mb-2">₹ 12,400</div>
                        <div className="flex gap-2 mt-4">
                            <Button className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/10">
                                View History
                            </Button>
                            <Button className="w-full" variant="primary">
                                Deposit to Owner
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white/5 border-white/10">
                    <CardHeader>
                        <CardTitle className="text-lg font-serif">Pending Approvals</CardTitle>
                        <CardDescription>Recent deposits waiting for owner verification.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {[1].map((i) => (
                            <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-black/20 border border-white/5">
                                <div className="flex items-center gap-3">
                                    <History className="h-4 w-4 text-orange-400" />
                                    <div>
                                        <div className="text-sm font-medium text-white">₹ 5,000</div>
                                        <div className="text-xs text-gray-500">Today, 10:30 AM</div>
                                    </div>
                                </div>
                                <span className="text-xs bg-orange-500/10 text-orange-400 px-2 py-1 rounded-full">Pending</span>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </section>
        </div>
    )
}
