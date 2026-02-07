"use client"

import { LoginLayout } from "@/components/login-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Home } from "lucide-react"
import { useState } from "react"
import { useLanguage } from "@/context/language-context"

export default function ResidentialLogin() {
    const [step, setStep] = useState<'phone' | 'otp'>('phone')
    const { t } = useLanguage()

    return (
        <LoginLayout
            title={t('login_residential_title')}
            subtitle={t('login_residential_subtitle')}
            icon={<Home className="w-8 h-8 text-indigo-500" />}
            colorClass="from-indigo-500/20"
        >
            <div className="space-y-4">
                {step === 'phone' ? (
                    <>
                        <div className="space-y-2">
                            <Label>{t('mobile_number')}</Label>
                            <Input placeholder="+91 98765 43210" className="bg-background/50 border-border focus:border-indigo-500/50" />
                        </div>
                        <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20" onClick={() => setStep('otp')}>
                            {t('send_otp')}
                        </Button>
                    </>
                ) : (
                    <>
                        <div className="space-y-2">
                            <Label>{t('enter_otp')}</Label>
                            <Input placeholder="• • • • • •" className="bg-background/50 border-border text-center tracking-[1em] font-bold" />
                        </div>
                        <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20">
                            {t('verify_access')}
                        </Button>
                        <p className="text-xs text-center text-muted-foreground cursor-pointer hover:text-foreground" onClick={() => setStep('phone')}>
                            {t('change_number')}
                        </p>
                    </>
                )}
            </div>
        </LoginLayout>
    )
}
