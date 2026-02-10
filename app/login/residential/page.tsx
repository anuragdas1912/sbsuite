"use client"

import { LoginLayout } from "@/components/login-layout"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Home } from "lucide-react"
import { useLanguage } from "@/context/language-context"

export default function ResidentialLogin() {
    const { t } = useLanguage()

    return (
        <LoginLayout
            title={t('login_residential_title')}
            subtitle={t('login_residential_subtitle')}
            icon={<Home className="w-8 h-8 text-indigo-500" />}
            colorClass="from-indigo-500/20"
        >
            <form className="space-y-4" action="/dashboard/tenant">
                <div className="space-y-2">
                    <Label>{t('mobile_number')}</Label>
                    <Input required placeholder="+91 98765 43210" className="bg-background/50 border-border focus:border-indigo-500/50" />
                </div>
                <div className="space-y-2">
                    <Label>{t('enter_otp')}</Label>
                    <Input required placeholder="• • • • • •" className="bg-background/50 border-border text-center tracking-[1em] font-bold" />
                </div>
                <button type="submit" className="w-full h-11 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20 text-sm tracking-wide uppercase font-medium">
                    {t('verify_access')}
                </button>
            </form>
        </LoginLayout>
    )
}
