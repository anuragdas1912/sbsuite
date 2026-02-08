"use client"

import { LoginLayout } from "@/components/login-layout"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ShieldCheck } from "lucide-react"
import { useLanguage } from "@/context/language-context"

export default function AdminLogin() {
    const { t } = useLanguage()

    return (
        <LoginLayout
            title={t('login_admin_title')}
            subtitle={t('login_admin_subtitle')}
            icon={<ShieldCheck className="w-8 h-8 text-primary" />}
            colorClass="from-primary/20"
        >
            <form className="space-y-4" action="/dashboard/owner">
                <div className="space-y-2">
                    <Label>{t('staff_email')}</Label>
                    <Input required placeholder="admin@sbsuite.in" className="bg-background/50 border-border focus:border-primary/50" />
                </div>
                <div className="space-y-2">
                    <Label>{t('password')}</Label>
                    <Input required type="password" placeholder="• • • • • • • •" className="bg-background/50 border-border focus:border-primary/50" />
                </div>
                <button type="submit" className="w-full h-11 rounded-lg bg-primary hover:bg-primary/90 text-black font-bold shadow-lg shadow-primary/20 text-sm tracking-wide uppercase">
                    {t('authenticate')}
                </button>
            </form>
        </LoginLayout>
    )
}
