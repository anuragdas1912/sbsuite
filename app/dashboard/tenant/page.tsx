import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Download, CreditCard, Image as ImageIcon, Video } from "lucide-react"

export default function TenantDashboard() {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-serif font-medium text-white">My Residency</h1>
                <p className="text-gray-400">Shop 101 • Commercial Block A</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Current Bill */}
                <Card className="border-primary/30 bg-gradient-to-br from-primary/10 to-transparent relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-3 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-bl-xl shadow-lg">
                        DUE: 10 FEB
                    </div>
                    <CardHeader>
                        <CardTitle className="text-sm font-sans font-medium text-gray-300 uppercase tracking-wider">Current Bill (Feb 2026)</CardTitle>
                        <CardDescription className="text-primary/70">Rent + Electricity (420 Units)</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-5xl font-serif text-white mb-2">₹ 10,200</div>
                        <div className="text-xs text-gray-400 mb-6">Last reading: 1240 • Current: 1660</div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="w-full">
                                <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-900/20 border-0">
                                    <CreditCard className="mr-2 h-4 w-4" /> Pay via UPI
                                </Button>
                            </div>
                            <div className="w-full">
                                <Button variant="outline" className="w-full text-white border-white/10 hover:bg-white/5">
                                    <Download className="mr-2 h-4 w-4" /> Receipt
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Evidence Vault */}
                <Card className="bg-white/5 border-white/10">
                    <CardHeader>
                        <CardTitle className="text-lg font-serif">Evidence Vault</CardTitle>
                        <CardDescription>Your registered proofs.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-4 p-3 rounded-lg bg-black/20 border border-white/5 hover:border-primary/30 transition-colors cursor-pointer group">
                            <div className="p-2 bg-white/5 rounded-md text-primary group-hover:bg-primary group-hover:text-black transition-colors">
                                <ImageIcon className="h-5 w-5" />
                            </div>
                            <div>
                                <div className="text-sm font-medium text-white">Meter Photo</div>
                                <div className="text-xs text-gray-500">Uploaded 1st Feb • 4.2 MB</div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 p-3 rounded-lg bg-black/20 border border-white/5 hover:border-primary/30 transition-colors cursor-pointer group">
                            <div className="p-2 bg-white/5 rounded-md text-primary group-hover:bg-primary group-hover:text-black transition-colors">
                                <Video className="h-5 w-5" />
                            </div>
                            <div>
                                <div className="text-sm font-medium text-white">Vehicle Entry Video</div>
                                <div className="text-xs text-gray-500">Uploaded 1st Feb • 24 MB</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
