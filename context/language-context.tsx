"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'

type Language = 'en' | 'hi' | 'mr' | 'bn' | 'pa' | 'gu'

interface LanguageContextType {
    language: Language
    setLanguage: (lang: Language) => void
    t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export const translations: Record<Language, Record<string, string>> = {
    en: {
        'welcome': 'Welcome to',
        'select_portal': 'Select your portal to continue.',
        'residential': 'Residential',
        'residential_desc': 'Residents & Hotel Guests',
        'commercial': 'Commercial',
        'commercial_desc': 'Shop Owners & Retail',
        'parking': 'Parking',
        'parking_desc': 'Vehicle Entry & Charging',
        'admin': 'Administration',
        'admin_desc': 'Owner & Management',
        'enter_portal': 'Enter Portal',
        'back_to_hub': 'Back to Hub',
        'login_residential_title': 'Residential Portal',
        'login_residential_subtitle': 'Access your home & amenities.',
        'mobile_number': 'Mobile Number',
        'send_otp': 'Send OTP',
        'enter_otp': 'Enter OTP',
        'verify_access': 'Verify & Access',
        'change_number': 'Change Number',
        'login_commercial_title': 'Merchants Portal',
        'login_commercial_subtitle': 'Manage your business space.',
        'shop_id': 'Shop ID / GSTIN',
        'registered_mobile': 'Registered Mobile',
        'secure_login': 'Secure Login',
        'login_parking_title': 'Smart Parking',
        'login_parking_subtitle': 'Vehicle recharging & entry.',
        'vehicle_number': 'Vehicle Number',
        'pass_code': 'Pass Code',
        'access_bay': 'Access Bay',
        'login_admin_title': 'Administration',
        'login_admin_subtitle': 'Owner & Manager Access.',
        'staff_email': 'Staff Email',
        'password': 'Password',
        'authenticate': 'Authenticate',
    },
    hi: {
        'welcome': 'स्वागत है',
        'select_portal': 'जारी रखने के लिए अपना पोर्टल चुनें।',
        'residential': 'आवासीय',
        'residential_desc': 'निवासी और होटल अतिथि',
        'commercial': 'व्यावसायिक',
        'commercial_desc': 'दुकान मालिक और खुदरा',
        'parking': 'पार्किंग',
        'parking_desc': 'वाहन प्रवेश और चार्जिंग',
        'admin': 'प्रशासन',
        'admin_desc': 'मालिक और प्रबंधन',
        'enter_portal': 'पोर्टल में प्रवेश करें',
        'back_to_hub': 'हब पर वापस जाएं',
        'login_residential_title': 'आवासीय पोर्टल',
        'login_residential_subtitle': 'अपने घर और सुविधाओं का उपयोग करें।',
        'mobile_number': 'मोबाइल नंबर',
        'send_otp': 'ओटीपी भेजें',
        'enter_otp': 'ओटीपी दर्ज करें',
        'verify_access': 'सत्यापित करें और पहुंचें',
        'change_number': 'नंबर बदलें',
        'login_commercial_title': 'व्यापारी पोर्टल',
        'login_commercial_subtitle': 'अपने व्यवसाय स्थान का प्रबंधन करें।',
        'shop_id': 'दुकान आईडी / जीएसटीआईएन',
        'registered_mobile': 'पंजीकृत मोबाइल',
        'secure_login': 'सुरक्षित लॉगिन',
        'login_parking_title': 'स्मार्ट पार्किंग',
        'login_parking_subtitle': 'वाहन रिचार्जिंग और प्रवेश।',
        'vehicle_number': 'वाहन नंबर',
        'pass_code': 'पास कोड',
        'access_bay': 'बे एक्सेस करें',
        'login_admin_title': 'प्रशासन',
        'login_admin_subtitle': 'मालिक और प्रबंधक पहुंच।',
        'staff_email': 'स्टाफ ईमेल',
        'password': 'पासवर्ड',
        'authenticate': 'प्रमाणित करें',
    },
    mr: {
        'welcome': 'स्वागत आहे',
        'select_portal': 'पुढे जाण्यासाठी आपले पोर्टल निवडा.',
        'residential': 'निवासी',
        'residential_desc': 'रहिवासी आणि हॉटेल अतिथी',
        'commercial': 'व्यावसायिक',
        'commercial_desc': 'दुकान मालक आणि किरकोळ',
        'parking': 'पार्किंग',
        'parking_desc': 'वाहन प्रवेश आणि चार्जिंग',
        'admin': 'प्रशासन',
        'admin_desc': 'मालक आणि व्यवस्थापन',
        'enter_portal': 'पोर्टलमध्ये प्रवेश करा',
        'back_to_hub': 'हबवर परत जा',
        'login_residential_title': 'निवासी पोर्टल',
        'login_residential_subtitle': 'आपल्या घरी आणि सुविधांमध्ये प्रवेश करा.',
        'mobile_number': 'मोबाईल नंबर',
        'send_otp': 'ओटीपी पाठवा',
        'enter_otp': 'ओटीपी प्रविष्ट करा',
        'verify_access': 'पडताळणी करा आणि प्रवेश करा',
        'change_number': 'नंबर बदला',
        'login_commercial_title': 'व्यापारी पोर्टल',
        'login_commercial_subtitle': 'आपल्या व्यवसायाच्या जागेचे व्यवस्थापन करा.',
        'shop_id': 'दुकान आयडी / जीएसटीआयएन',
        'registered_mobile': 'नोंदणीकृत मोबाईल',
        'secure_login': 'सुरक्षित लॉगिन',
        'login_parking_title': 'स्मार्ट पार्किंग',
        'login_parking_subtitle': 'वाहन रिचार्जिंग आणि प्रवेश.',
        'vehicle_number': 'वाहन क्रमांक',
        'pass_code': 'पास कोड',
        'access_bay': 'बे ऍक्सेस करा',
        'login_admin_title': 'प्रशासन',
        'login_admin_subtitle': 'मालक आणि व्यवस्थापक प्रवेश.',
        'staff_email': 'स्टाफ ईमेल',
        'password': 'पासवर्ड',
        'authenticate': 'प्रमाणित करा',
    },
    bn: {
        'welcome': 'স্বাগতম',
        'select_portal': 'চালিয়ে যেতে আপনার পোর্টাল নির্বাচন করুন।',
        'residential': 'আবাসিক',
        'residential_desc': 'বাসিন্দা এবং হোটেল অতিথি',
        'commercial': 'বাণিজ্যিক',
        'commercial_desc': 'দোকান মালিক এবং খুচরা',
        'parking': 'পার্কিং',
        'parking_desc': 'যানবাহন প্রবেশ এবং চার্জিং',
        'admin': 'প্রশাসন',
        'admin_desc': 'মালিক এবং ব্যবস্থাপনা',
        'enter_portal': 'পোর্টালে প্রবেশ করুন',
        'back_to_hub': 'হাবে ফিরে যান',
        'login_residential_title': 'আবাসিক পোর্টাল',
        'login_residential_subtitle': 'আপনার বাড়ি এবং সুযোগ-সুবিধা অ্যাক্সেস করুন।',
        'mobile_number': 'মোবাইল নম্বর',
        'send_otp': 'ওটিপি পাঠান',
        'enter_otp': 'ওটিপি লিখুন',
        'verify_access': 'যাচাই করুন এবং প্রবেশ করুন',
        'change_number': 'নম্বর পরিবর্তন করুন',
        'login_commercial_title': 'ব্যবসায়ী পোর্টাল',
        'login_commercial_subtitle': 'আপনার ব্যবসার স্থান পরিচালনা করুন।',
        'shop_id': 'দোকান আইডি / জিএসটিআইএন',
        'registered_mobile': 'নিবন্ধিত মোবাইল',
        'secure_login': 'নিরাপদ লগইন',
        'login_parking_title': 'স্মার্ট পার্কিং',
        'login_parking_subtitle': 'যানবাহন রিচার্জিং এবং প্রবেশ।',
        'vehicle_number': 'যানবাহন নম্বর',
        'pass_code': 'পাস কোড',
        'access_bay': 'বে অ্যাক্সেস করুন',
        'login_admin_title': 'প্রশাসন',
        'login_admin_subtitle': 'মালিক এবং ম্যানেজার অ্যাক্সেস।',
        'staff_email': 'স্টাফ ইমেল',
        'password': 'পাসওয়ার্ড',
        'authenticate': 'প্রমাণীকরণ করুন',
    },
    pa: {
        'welcome': 'ਜੀ ਆਇਆਂ ਨੂੰ',
        'select_portal': 'ਜਾਰੀ ਰੱਖਣ ਲਈ ਆਪਣਾ ਪੋਰਟਲ ਚੁਣੋ।',
        'residential': 'ਰਿਹਾਇਸ਼ੀ',
        'residential_desc': 'ਰਿਹਾਇਸ਼ੀ ਅਤੇ ਹੋਟਲ ਮਹਿਮਾਨ',
        'commercial': 'ਵਪਾਰਕ',
        'commercial_desc': 'ਦੁਕਾਨ ਮਾਲਕ ਅਤੇ ਪ੍ਰਚੂਨ',
        'parking': 'ਪਾਰਕਿੰਗ',
        'parking_desc': 'ਵਾਹਨ ਪ੍ਰਵੇਸ਼ ਅਤੇ ਚਾਰਜਿੰਗ',
        'admin': 'ਪ੍ਰਸ਼ਾਸਨ',
        'admin_desc': 'ਮਾਲਕ ਅਤੇ ਪ੍ਰਬੰਧਨ',
        'enter_portal': 'ਪੋਰਟਲ ਵਿੱਚ ਦਾਖਲ ਹੋਵੋ',
        'back_to_hub': 'ਹੱਬ ਤੇ ਵਾਪਸ ਜਾਓ',
        'login_residential_title': 'ਰਿਹਾਇਸ਼ੀ ਪੋਰਟਲ',
        'login_residential_subtitle': 'ਆਪਣੇ ਘਰ ਅਤੇ ਸਹੂਲਤਾਂ ਤੱਕ ਪਹੁੰਚ ਕਰੋ।',
        'mobile_number': 'ਮੋਬਾਈਲ ਨੰਬਰ',
        'send_otp': 'ਓਟੀਪੀ ਭੇਜੋ',
        'enter_otp': 'ਓਟੀਪੀ ਦਰਜ ਕਰੋ',
        'verify_access': 'ਤਸਦੀਕ ਕਰੋ ਅਤੇ ਪਹੁੰਚ ਕਰੋ',
        'change_number': 'ਨੰਬਰ ਬਦਲੋ',
        'login_commercial_title': 'ਵਪਾਰੀ ਪੋਰਟਲ',
        'login_commercial_subtitle': 'ਆਪਣੇ ਕਾਰੋਬਾਰ ਦੀ ਥਾਂ ਦਾ ਪ੍ਰਬੰਧਨ ਕਰੋ।',
        'shop_id': 'ਦੁਕਾਨ ਆਈਡੀ / ਜੀਐਸਟੀਆਈਐਨ',
        'registered_mobile': 'ਰਜਿਸਟਰਡ ਮੋਬਾਈਲ',
        'secure_login': 'ਸੁਰੱਖਿਅਤ ਲੌਗਇਨ',
        'login_parking_title': 'ਸਮਾਰਟ ਪਾਰਕਿੰਗ',
        'login_parking_subtitle': 'ਵਾਹਨ ਰੀਚਾਰਜਿੰਗ ਅਤੇ ਪ੍ਰਵੇਸ਼।',
        'vehicle_number': 'ਵਾਹਨ ਨੰਬਰ',
        'pass_code': 'ਪਾਸ ਕੋਡ',
        'access_bay': 'ਬੇ ਤੱਕ ਪਹੁੰਚੋ',
        'login_admin_title': 'ਪ੍ਰਸ਼ਾਸਨ',
        'login_admin_subtitle': 'ਮਾਲਕ ਅਤੇ ਪ੍ਰਬੰਧਕ ਪਹੁੰਚ।',
        'staff_email': 'ਸਟਾਫ ਈਮੇਲ',
        'password': 'ਪਾਸਵਰਡ',
        'authenticate': 'ਪ੍ਰਮਾਣਿਤ ਕਰੋ',
    },
    gu: {
        'welcome': 'સ્વાગત છે',
        'select_portal': 'ચાલુ રાખવા માટે તમારું પોર્ટલ પસંદ કરો.',
        'residential': 'રહેણાંક',
        'residential_desc': 'રહેવાસીઓ અને હોટેલ મહેમાનો',
        'commercial': 'વ્યાપારી',
        'commercial_desc': 'દુકાન માલિકો અને છૂટક',
        'parking': 'પાર્કિંગ',
        'parking_desc': 'વાહન પ્રવેશ અને ચાર્જિંગ',
        'admin': 'વહીવટ',
        'admin_desc': 'માલિક અને સંચાલન',
        'enter_portal': 'પોર્ટલ માં પ્રવેશ કરો',
        'back_to_hub': 'હબ પર પાછા જાઓ',
        'login_residential_title': 'રહેણાંક પોર્ટલ',
        'login_residential_subtitle': 'તમારા ઘર અને સુવિધાઓ ઍક્સેસ કરો.',
        'mobile_number': 'મોબાઇલ નંબર',
        'send_otp': 'ઓટીપી મોકલો',
        'enter_otp': 'ઓટીપી દાખલ કરો',
        'verify_access': 'ચકાસો અને ઍક્સેસ કરો',
        'change_number': 'નંબર બદલો',
        'login_commercial_title': 'વેપારી પોર્ટલ',
        'login_commercial_subtitle': 'તમારા વ્યવસાયની જગ્યાનું સંચાલન કરો.',
        'shop_id': 'દુકાન આઈડી / જીએસટીઆઈએન',
        'registered_mobile': 'રજિસ્ટર્ડ મોબાઇલ',
        'secure_login': 'સુરક્ષિત લૉગિન',
        'login_parking_title': 'સ્માર્ટ પાર્કિંગ',
        'login_parking_subtitle': 'વાહન રિચાર્જિંગ અને પ્રવેશ.',
        'vehicle_number': 'વાહન નંબર',
        'pass_code': 'પાસ કોડ',
        'access_bay': 'બે ઍક્સેસ કરો',
        'login_admin_title': 'વહીવટ',
        'login_admin_subtitle': 'માલિક અને મેનેજર ઍક્સેસ.',
        'staff_email': 'સ્ટાફ ઇમેઇલ',
        'password': 'પાસવર્ડ',
        'authenticate': 'પ્રમાણિત કરો',
    }
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguage] = useState<Language>('en')

    // Load language from localStorage
    useEffect(() => {
        const savedLang = localStorage.getItem('sbsuite-lang') as Language
        if (savedLang && translations[savedLang]) {
            setLanguage(savedLang)
        }
    }, [])

    const handleSetLanguage = (lang: Language) => {
        setLanguage(lang)
        localStorage.setItem('sbsuite-lang', lang)
    }

    const t = (key: string) => {
        return translations[language][key] || key
    }

    return (
        <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    )
}

export const useLanguage = () => {
    const context = useContext(LanguageContext)
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider')
    }
    return context
}
