"use client"

import { LoginLayout } from "@/components/login-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Building2 } from "lucide-react"
import { useLanguage } from "@/context/language-context"

export default function CommercialLogin() {
    const { t } = useLanguage()

    return (
        <LoginLayout
            title={t('login_commercial_title')}
            subtitle={t('login_commercial_subtitle')}
            icon={<Building2 className="w-8 h-8 text-emerald-500" />}
            colorClass="from-emerald-500/20"
        >
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label>{t('shop_id')}</Label>
                    <Input placeholder="SB-SHOP-001" className="bg-background/50 border-border focus:border-emerald-500/50" />
                </div>
                <div className="space-y-2">
                    <Label>{t('registered_mobile')}</Label>
                    <Input placeholder="+91 98765 43210" className="bg-background/50 border-border focus:border-emerald-500/50" />
                </div>
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/20">
                    {t('secure_login')}
                </Button>
            </div>
        </LoginLayout>
    )
}
