"use client"

import { LoginLayout } from "@/components/login-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Zap } from "lucide-react"
import { useLanguage } from "@/context/language-context"

export default function ParkingLogin() {
    const { t } = useLanguage()

    return (
        <LoginLayout
            title={t('login_parking_title')}
            subtitle={t('login_parking_subtitle')}
            icon={<Zap className="w-8 h-8 text-amber-500" />}
            colorClass="from-amber-500/20"
        >
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label>{t('vehicle_number')}</Label>
                    <Input placeholder="UP 16 AB 1234" className="bg-background/50 border-border focus:border-amber-500/50 uppercase" />
                </div>
                <div className="space-y-2">
                    <Label>{t('pass_code')}</Label>
                    <Input type="password" placeholder="• • • •" className="bg-background/50 border-border focus:border-amber-500/50" />
                </div>
                <Button className="w-full bg-amber-600 hover:bg-amber-700 text-black font-bold shadow-lg shadow-amber-500/20">
                    {t('access_bay')}
                </Button>
            </div>
        </LoginLayout>
    )
}
