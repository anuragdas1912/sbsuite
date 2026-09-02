'use client';

import React, { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { Role } from '@/types';
import OwnerDashboard from '@/components/owner/Dashboard';
import FieldDashboard from '@/components/manager/FieldDashboard';
import { 
  Building2, 
  ShieldCheck, 
  Smartphone, 
  Lock, 
  Key, 
  ArrowRight, 
  LogOut, 
  RefreshCw, 
  Wifi, 
  WifiOff, 
  CheckCircle2,
  Calendar
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function Home() {
  const { 
    isLoading, 
    isOnline, 
    selectedMonth, 
    setSelectedMonth, 
    fetchInitialData 
  } = useAppStore();

  const [currentRole, setCurrentRole] = useState<Role | null>(null);
  const [ownerPin, setOwnerPin] = useState('');
  const [pinError, setPinError] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);

  // Month list for quick billing cycle switcher
  const months = [
    'Sep 2026', 'Aug 2026', 'Jul 2026', 'Jun 2026', 'May 2026', 'Apr 2026'
  ];

  useEffect(() => {
    fetchInitialData();

    // Check saved session role
    const saved = localStorage.getItem('sbsuite_active_role') as Role | null;
    if (saved === 'owner' || saved === 'manager') {
      setCurrentRole(saved);
    }
  }, [fetchInitialData]);

  const handleSelectRole = (role: Role) => {
    if (role === 'owner') {
      setShowPinModal(true);
    } else {
      setCurrentRole('manager');
      localStorage.setItem('sbsuite_active_role', 'manager');
      confetti({ particleCount: 20, spread: 40, origin: { y: 0.8 } });
    }
  };

  const handleOwnerPinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Default Owner PIN 2528 or Qazmlp@2528
    if (ownerPin === '2528' || ownerPin === 'Qazmlp@2528' || ownerPin === 'admin') {
      setCurrentRole('owner');
      localStorage.setItem('sbsuite_active_role', 'owner');
      setShowPinModal(false);
      setOwnerPin('');
      setPinError(false);
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.6 } });
    } else {
      setPinError(true);
    }
  };

  const handleLogout = () => {
    setCurrentRole(null);
    localStorage.removeItem('sbsuite_active_role');
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#060608] text-[#F4F4F5] animated-grid">
      
      {/* Top Header */}
      <header className="sticky top-0 z-40 w-full bg-[#08090C]/90 backdrop-blur-md border-b border-[#1B1C22] px-4 sm:px-8 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg overflow-hidden border border-[#C5A880]/30 shadow-md shrink-0 bg-[#0E0F12] flex items-center justify-center">
              <img src="/logo.png" alt="Shree Balaji Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-serif font-bold text-sm sm:text-base tracking-widest text-slate-100 uppercase">
                  SB <span className="text-[#C5A880] italic font-light lowercase">suite OS</span>
                </span>
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[#C5A880]/15 text-[#DFD3C3] border border-[#C5A880]/30 uppercase font-bold">
                  v2.0
                </span>
              </div>
              <p className="text-[8px] sm:text-[9px] font-mono tracking-[0.2em] text-slate-500 uppercase">
                SHREE BALAJI PROPERTIES
              </p>
            </div>
          </div>

          {/* Right Controls (Month Selector, Network Status, Role / Logout) */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Month Cycle Selector */}
            <div className="flex items-center gap-1.5 bg-[#0E0F12] border border-[#1B1C22] px-2.5 py-1.5 rounded-lg text-xs">
              <Calendar className="w-3.5 h-3.5 text-[#C5A880]" />
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-transparent text-slate-300 font-semibold focus:outline-none cursor-pointer text-xs"
              >
                {months.map((m) => (
                  <option key={m} value={m} className="bg-[#0E0F12] text-white">
                    {m}
                  </option>
                ))}
              </select>
            </div>

            {/* Online / Offline Sync Indicator */}
            <div className={`hidden sm:flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
              isOnline ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
            }`}>
              {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
              <span>{isOnline ? 'Supabase Live' : 'Offline Mode'}</span>
            </div>

            {/* Role Badge & Switcher */}
            {currentRole ? (
              <div className="flex items-center gap-1.5">
                <span className="hidden sm:inline-block px-2.5 py-1 rounded-lg bg-[#14151B] border border-[#22242D] text-xs font-bold text-[#C5A880] uppercase tracking-wider">
                  {currentRole === 'owner' ? '👑 Owner' : '📱 Ritin (Manager)'}
                </span>
                <button
                  onClick={handleLogout}
                  className="p-1.5 rounded-lg bg-[#14151B] hover:bg-rose-900/20 border border-[#22242D] text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                  title="Switch Role / Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : null}

          </div>

        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        
        {/* Loading State */}
        {isLoading ? (
          <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
            <RefreshCw className="w-8 h-8 text-[#C5A880] animate-spin" />
            <p className="font-serif text-sm text-slate-400">Loading Shree Balaji OS Terminal...</p>
          </div>
        ) : !currentRole ? (
          
          /* ROLE SELECTION GATEWAY */
          <div className="max-w-xl mx-auto my-auto py-12 px-2 text-center space-y-8 animate-in fade-in zoom-in duration-200">
            
            <div className="space-y-2">
              <div className="w-16 h-16 mx-auto rounded-2xl p-2 bg-[#0E0F12] border border-[#C5A880]/30 shadow-2xl flex items-center justify-center">
                <img src="/logo.png" alt="Shree Balaji Logo" className="w-full h-full object-contain" />
              </div>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-wide mt-3">
                Select Operating Terminal
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
                Asset & Tenancy Terminal for 14 Rooms, 8 Shops, and Parking Complex.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Field Manager (Ritin) Card */}
              <button
                onClick={() => handleSelectRole('manager')}
                className="group relative bg-[#0E0F12] hover:bg-[#12141A] border border-[#1B1C22] hover:border-[#C5A880]/50 p-6 rounded-2xl text-left transition-all duration-200 shadow-xl cursor-pointer flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <h3 className="font-serif text-base font-bold text-white group-hover:text-[#DFD3C3] transition-colors">
                    Field Mode (Ritin)
                  </h3>
                  <p className="text-xs text-slate-400 font-light leading-relaxed">
                    Mobile-optimized single-hand entry for meter reading camera photos, rent collections, and daily parking.
                  </p>
                </div>

                <div className="flex items-center justify-between text-xs font-bold text-emerald-400 uppercase tracking-wider pt-2 border-t border-[#17181F]">
                  <span>Launch Field Mode</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

              {/* Executive Owner Card */}
              <button
                onClick={() => handleSelectRole('owner')}
                className="group relative bg-[#0E0F12] hover:bg-[#12141A] border border-[#1B1C22] hover:border-[#C5A880]/50 p-6 rounded-2xl text-left transition-all duration-200 shadow-xl cursor-pointer flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-[#C5A880]/15 border border-[#C5A880]/30 text-[#C5A880] flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <h3 className="font-serif text-base font-bold text-white group-hover:text-[#DFD3C3] transition-colors">
                    Executive Owner
                  </h3>
                  <p className="text-xs text-slate-400 font-light leading-relaxed">
                    Full executive telemetry, Master Tariff editing, live Ritin cash reconciliation, and 1-click settlement audit.
                  </p>
                </div>

                <div className="flex items-center justify-between text-xs font-bold text-[#C5A880] uppercase tracking-wider pt-2 border-t border-[#17181F]">
                  <span>Enter Command Terminal</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

            </div>

          </div>

        ) : currentRole === 'owner' ? (
          <OwnerDashboard />
        ) : (
          <FieldDashboard />
        )}

      </main>

      {/* Owner PIN Security Modal */}
      {showPinModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#0E0F12] border border-[#22242D] rounded-2xl p-6 shadow-2xl text-center relative animate-in fade-in zoom-in duration-150">
            <div className="w-12 h-12 rounded-full bg-[#C5A880]/15 border border-[#C5A880]/30 text-[#C5A880] mx-auto flex items-center justify-center mb-3">
              <Lock className="w-6 h-6" />
            </div>

            <h3 className="font-serif text-lg font-bold text-white">Owner PIN Security</h3>
            <p className="text-xs text-slate-400 mt-1">Enter PIN or Password to access Executive Command.</p>

            <form onSubmit={handleOwnerPinSubmit} className="mt-5 space-y-4">
              <div className="space-y-1">
                <input
                  type="password"
                  required
                  placeholder="Enter PIN (e.g. 2528)"
                  value={ownerPin}
                  onChange={(e) => {
                    setOwnerPin(e.target.value);
                    setPinError(false);
                  }}
                  className="w-full text-center tracking-widest text-lg font-mono p-3 rounded-xl bg-[#060608] border border-[#1B1C22] text-white focus:outline-none focus:border-[#C5A880]"
                  autoFocus
                />
                {pinError && (
                  <p className="text-xs text-rose-400 mt-1">Incorrect PIN. Try PIN: 2528</p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => { setShowPinModal(false); setOwnerPin(''); }}
                  className="flex-1 py-2.5 rounded-xl bg-[#14151B] text-slate-400 hover:text-white text-xs font-bold uppercase transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#C5A880] hover:bg-[#DFD3C3] text-[#060608] text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-lg"
                >
                  Unlock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="w-full border-t border-[#17181F] py-4 px-4 sm:px-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© {new Date().getFullYear()} Shree Balaji Properties. All rights reserved.</p>
          <p className="font-mono text-[10px] text-[#C5A880]">sbsuite.in • SB Suite OS</p>
        </div>
      </footer>

    </div>
  );
}
