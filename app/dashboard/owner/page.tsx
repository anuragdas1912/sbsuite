import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowUpRight, CheckCircle, Clock } from "lucide-react"

export default function OwnerDashboard() {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-serif font-medium text-white">Owner Command Center</h1>
                    <p className="text-gray-400">Financial Pulse & Audit Vault</p>
                </div>
                <div className="flex gap-2 text-sm text-gray-500 bg-white/5 px-3 py-1 rounded-full border border-white/5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 animate-pulse"></span>
                    System Live
                </div>
            </div>

            {/* Financial Pulse */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-gradient-to-br from-white/5 to-transparent border-primary/20">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-sans font-medium text-gray-400 uppercase tracking-wider">Total Revenue (Feb)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-serif text-primary">₹ 4,30,000</span>
                            <span className="text-emerald-500 text-sm flex items-center font-medium">
                                <ArrowUpRight className="h-4 w-4 mr-1" />
                                12%
                            </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">Vs. Previous Month</p>
                    </CardContent>
                </Card>

                <Card className="bg-white/5 border-white/5">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-sans font-medium text-gray-400 uppercase tracking-wider">Pending Dues</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-serif text-white">₹ 45,200</span>
                            <span className="text-red-400 text-sm font-medium">
                                3 Tenants
                            </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">Action Required</p>
                    </CardContent>
                </Card>
            </div>

            {/* Reconciliation Bridge */}
            <section className="space-y-4">
                <h2 className="text-xl text-white font-medium border-l-2 border-primary pl-4">Reconciliation Bridge</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Mock Items */}
                    <div className="rounded-xl border border-white/10 bg-white/5 overflow-hidden">
                        <div className="p-4 flex flex-row items-center justify-between space-y-0 pb-2">
                            <div className="text-sm font-medium text-white">Cash Deposit</div>
                            <Clock className="h-4 w-4 text-orange-400" />
                        </div>
                        <div className="p-4 pt-2">
                            <div className="text-2xl font-bold mb-1 text-white">₹ 25,000</div>
                            <p className="text-xs text-gray-400 mb-4">Manager: Rajesh Kumar • 2 hours ago</p>
                            <div className="aspect-video bg-black/50 rounded-lg mb-4 border border-white/10 flex items-center justify-center">
                                <span className="text-xs text-gray-600">Proof Screenshot</span>
                            </div>
                            <div className="flex gap-2">
                                <button className="flex-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 py-2 rounded-md text-sm font-medium transition-colors border border-emerald-500/20">
                                    Verify
                                </button>
                                <button className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-500 py-2 rounded-md text-sm font-medium transition-colors border border-red-500/20">
                                    Reject
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Audit Vault */}
            <section className="space-y-4">
                <h2 className="text-xl text-white font-medium border-l-2 border-primary pl-4">Audit Vault (Recent Activity)</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="aspect-square bg-white/5 rounded-xl border border-white/5 hover:border-primary/50 transition-all cursor-pointer relative overflow-hidden group">
                            {/* Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-4">
                                <p className="text-white font-medium">Room 30{i}</p>
                                <p className="text-xs text-gray-400">Meter Reading • Today</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    )
}
