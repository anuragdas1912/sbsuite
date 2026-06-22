'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowRight, 
  Building2, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff,
  Globe
} from 'lucide-react';
import { db, supabase } from './db';

type Role = 'residential' | 'commercial' | 'parking' | 'owner' | 'manager';
type Lang = 'en' | 'hi';

export default function LandingPage() {
  const router = useRouter();
  const [lang, setLang] = useState<Lang>('en');
  const [selectedRole, setSelectedRole] = useState<Role>('residential');
  const [prevRole, setPrevRole] = useState<Role>('residential');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isFormAnimating, setIsFormAnimating] = useState(false);

  // Smooth form transition on role change
  useEffect(() => {
    if (selectedRole !== prevRole) {
      setIsFormAnimating(true);
      const timer = setTimeout(() => {
        setPrevRole(selectedRole);
        setIsFormAnimating(false);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [selectedRole, prevRole]);

  // Persistent Secure Session Auto-Login
  useEffect(() => {
    const savedRole = localStorage.getItem('sb_current_role');
    if (savedRole && ['owner', 'manager', 'residential', 'commercial', 'parking'].includes(savedRole)) {
      router.push(`/${savedRole}`);
    }
  }, [router]);

  const t = {
    en: {
      tagline: 'SHREE BALAJI PROPERTIES',
      welcome: 'Welcome to SB Suite',
      desc: 'Access your property dashboard securely.',
      rememberMe: 'Remember this device',
      signInBtn: 'Sign In Securely',
      emailLabel: 'Email or Username',
      passwordLabel: 'Password',
      forgotLink: 'Forgot Password?',
      staffEntrance: 'Staff Portal',
      ownerBtn: 'Owner',
      managerBtn: 'Manager',
      emailPlaceholder: 'Enter your email or username',
      passwordPlaceholder: 'Enter your password'
    },
    hi: {
      tagline: 'श्री बालाजी प्रॉपर्टीज',
      welcome: 'एस.बी. सुइट में आपका स्वागत है',
      desc: 'अपने प्रॉपर्टी डैशबोर्ड को सुरक्षित रूप से एक्सेस करें।',
      rememberMe: 'इस डिवाइस को याद रखें',
      signInBtn: 'सुरक्षित प्रवेश करें',
      emailLabel: 'ईमेल या यूजरनाम',
      passwordLabel: 'पासवर्ड',
      forgotLink: 'पासवर्ड भूल गए?',
      staffEntrance: 'स्टाफ पोर्टल',
      ownerBtn: 'मालिक',
      managerBtn: 'प्रबंधक',
      emailPlaceholder: 'अपना ईमेल या यूजरनाम दर्ज करें',
      passwordPlaceholder: 'अपना पासवर्ड दर्ज करें'
    }
  }[lang];

  // Configured shorter, concise tab labels specifically to prevent mobile overflow
  const roleConfig = {
    residential: {
      title: lang === 'en' ? 'Resident' : 'निवासी',
      subtitle: lang === 'en' ? 'Residential Tenant' : 'आवासीय किरायेदार',
    },
    commercial: {
      title: lang === 'en' ? 'Shop' : 'दुकान',
      subtitle: lang === 'en' ? 'Commercial Tenant' : 'व्यावसायिक किरायेदार',
    },
    parking: {
      title: lang === 'en' ? 'Parking' : 'पार्किंग',
      subtitle: lang === 'en' ? 'Parking User' : 'पार्किंग उपयोगकर्ता',
    },
    manager: {
      title: lang === 'en' ? 'Manager' : 'प्रबंधक',
      subtitle: lang === 'en' ? 'System Manager' : 'प्रबंधक',
    },
    owner: {
      title: lang === 'en' ? 'Owner' : 'मालिक',
      subtitle: lang === 'en' ? 'Property Owner' : 'प्रॉपर्टी मालिक',
    },
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const normalizedEmail = email.toLowerCase().trim();
    const normalizedPassword = password;
    
    try {
      // 1 & 2. Owner and Manager Login via Supabase Auth
      if (selectedRole === 'owner' || selectedRole === 'manager') {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password
        });

        if (error || !data.user) {
          alert(`Login failed: ${error?.message || 'Unknown error'}`);
          setLoading(false);
          return;
        }

        localStorage.setItem('sb_current_role', selectedRole);
        if (selectedRole === 'manager') {
          localStorage.setItem('sb_current_manager_id', data.user.id);
        }
        setLoading(false);
        router.push(`/${selectedRole}`);
        return;
      }
      
      // 3. Check Tenant Login
      const tenants = await db.getTenants();
      const roleTenants = tenants.filter(t => t.role === selectedRole);
      
      // Tenants log in using their exact phone number or exact ID and correct password
      const matchedTenant = roleTenants.find(t => 
        (t.phone === normalizedEmail || t.id.toLowerCase() === normalizedEmail) &&
        (t.password === normalizedPassword)
      );
      
      if (matchedTenant) {
        localStorage.setItem('sb_current_tenant_id', matchedTenant.id);
        localStorage.setItem('sb_current_role', selectedRole);
        router.push(`/${selectedRole}`);
      } else {
        alert(lang === 'en' ? 'Invalid credentials.' : 'अमान्य क्रेडेंशियल।');
      }
    } catch (err) {
      console.error(err);
      alert('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between overflow-x-hidden bg-[#060608] text-[#F4F4F5] px-4 sm:px-6 animated-grid">
      
      {/* Background Ambient Glows */}
      <div className="absolute top-[20%] left-[25%] w-[250px] sm:w-[450px] h-[250px] sm:h-[450px] rounded-full bg-gold/5 blur-[80px] sm:blur-[120px] pointer-events-none animate-float-1"></div>
      <div className="absolute bottom-[20%] right-[25%] w-[250px] sm:w-[450px] h-[250px] sm:h-[450px] rounded-full bg-blue-500/5 blur-[80px] sm:blur-[120px] pointer-events-none animate-float-2"></div>

      {/* Top Header */}
      <header className="w-full max-w-md mx-auto pt-6 flex justify-between items-center z-20 animate-luxury-card px-1">
        <div className="flex items-center gap-2.5">
          {/* Logo symbol */}
          <div className="relative flex items-center justify-center w-10 h-10 select-none">
            <img src="/logo.png" alt="Shree Balaji Estate Logo" className="w-full h-full object-contain rounded" />
          </div>
          <div className="flex flex-col">
            <span className="font-serif text-base tracking-widest font-bold text-slate-200 uppercase leading-none">
              SB <span className="text-gold italic font-light lowercase">suite</span>
            </span>
            <span className="text-[7px] tracking-[0.25em] font-medium text-slate-500 uppercase mt-0.5 font-mono">
              {t.tagline}
            </span>
          </div>
        </div>

        {/* Language Switcher */}
        <button
          onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
          className="px-2.5 py-1 rounded bg-luxury-gray border border-[#1B1B21] text-[10px] font-semibold text-gold hover:border-gold/45 transition-colors cursor-pointer flex items-center gap-1.5"
        >
          <Globe className="w-3 h-3" />
          <span>{lang === 'en' ? 'हिंदी' : 'EN'}</span>
        </button>
      </header>

      {/* Centered Login Card */}
      <main className="w-full max-w-md mx-auto flex-1 flex flex-col items-center justify-center py-6 z-10 animate-luxury-card delay-75 px-1">
        
        {/* Core Login Card Box */}
        <div className="w-full bg-[#0E0F12] border border-[#1B1C21] p-5 sm:p-8 rounded-xl shadow-2xl relative">
          
          {/* Elegant Top Line */}
          <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-gold/30 to-transparent"></div>

          {/* Clean Portal Selector Tabs */}
          <div className="mb-6 border-b border-[#1B1C21] pb-3 flex justify-between gap-2 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500">
            {(['residential', 'commercial', 'parking'] as const).map((role) => {
              const info = roleConfig[role];
              const isActive = selectedRole === role;
              return (
                <button
                  key={role}
                  type="button"
                  onClick={() => setSelectedRole(role)}
                  className={`flex-1 py-1.5 rounded text-center transition-all duration-200 cursor-pointer select-none text-[9px] sm:text-[11px] ${
                    isActive 
                      ? 'text-gold border border-gold/15 bg-gold/5 shadow-[0_0_10px_rgba(197,168,128,0.1)]' 
                      : 'hover:text-slate-200 hover:bg-slate-900/40 border border-transparent'
                  }`}
                >
                  {info.title}
                </button>
              );
            })}
          </div>

          {/* Form Content Wrapper */}
          <div className={`transition-opacity duration-150 ${isFormAnimating ? 'opacity-0' : 'opacity-100'}`}>
            
            {/* Header info */}
            <div className="mb-6 text-center sm:text-left">
              <h2 className="font-serif text-lg sm:text-xl font-light text-slate-200">
                {roleConfig[prevRole].subtitle}
              </h2>
              <p className="text-[11px] text-slate-500 mt-1 font-light">
                {t.desc}
              </p>
            </div>

            {/* Inputs Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              
              {/* Email Input */}
              <div className="space-y-1.5">
                <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">
                  {t.emailLabel}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-600">
                    <Mail className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="text"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t.emailPlaceholder}
                    className="w-full pl-9 pr-3 py-2.5 rounded bg-[#060608] border border-[#1B1C21] text-slate-200 text-xs placeholder:text-slate-700 focus:outline-none focus:border-gold/50 transition-colors"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">
                    {t.passwordLabel}
                  </label>
                  <a 
                    href="#forgot"
                    onClick={(e) => { e.preventDefault(); alert(lang === 'en' ? 'Reset link sent.' : 'पासवर्ड लिंक भेज दिया गया है।'); }}
                    className="text-[9px] text-[#C5A880] hover:text-[#DFD3C3] font-semibold tracking-wider transition-colors uppercase"
                  >
                    {t.forgotLink}
                  </a>
                </div>
                
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-600">
                    <Lock className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t.passwordPlaceholder}
                    className="w-full pl-9 pr-9 py-2.5 rounded bg-[#060608] border border-[#1B1C21] text-slate-200 text-xs placeholder:text-slate-700 focus:outline-none focus:border-gold/50 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-600 hover:text-gold transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center gap-2 pt-1 select-none">
                <input
                  type="checkbox"
                  id="remember"
                  className="w-3.5 h-3.5 rounded border-[#1B1C21] bg-transparent text-gold focus:ring-0 accent-gold cursor-pointer"
                />
                <label htmlFor="remember" className="text-[11px] text-slate-500 hover:text-slate-400 transition-colors font-light cursor-pointer">
                  {t.rememberMe}
                </label>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#C5A880] hover:bg-[#DFD3C3] disabled:opacity-45 text-[#060608] text-[10px] font-bold uppercase tracking-[0.2em] py-3.5 rounded transition-colors duration-200 mt-2 flex items-center justify-center gap-2 cursor-pointer shadow-lg"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-[#060608] border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    {t.signInBtn}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>

            </form>
          </div>
        </div>

      </main>

      {/* Footer / Administrative Logins */}
      <footer className="w-full max-w-md mx-auto py-6 border-t border-[#242427]/40 z-20 flex flex-col items-center gap-4 animate-luxury-card delay-150 px-1">
        
        {/* Flat minimal staff buttons */}
        <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.15em] text-slate-500">
          <span>{t.staffEntrance}:</span>
          <button
            onClick={() => setSelectedRole('manager')}
            className={`transition-colors duration-200 font-bold cursor-pointer ${
              selectedRole === 'manager' ? 'text-gold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {t.managerBtn}
          </button>
          <span className="text-slate-800">|</span>
          <button
            onClick={() => setSelectedRole('owner')}
            className={`transition-colors duration-200 font-bold cursor-pointer ${
              selectedRole === 'owner' ? 'text-gold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {t.ownerBtn}
          </button>
        </div>

        {/* Copyright info */}
        <div className="flex flex-col items-center gap-1 text-[11px] text-slate-500 font-light text-center">
          <p>
            &copy; {new Date().getFullYear()} Shree Balaji Properties. All rights reserved.
          </p>
          <a 
            href="https://www.sbsuite.in" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-[#C5A880] hover:text-[#DFD3C3] font-semibold tracking-[0.2em] transition-colors uppercase text-[9px] flex items-center gap-1.5 mt-0.5"
          >
            <Building2 className="w-3.5 h-3.5 text-slate-600" />
            www.sbsuite.in
          </a>
        </div>
      </footer>

    </div>
  );
}
