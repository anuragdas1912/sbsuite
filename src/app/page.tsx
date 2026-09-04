'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Delete, ShieldCheck, Lock, Sparkles, Check, ChevronRight, AlertOctagon } from 'lucide-react';

type ScreenState = 'splash' | 'pin' | 'owner_console' | 'manager_console';

interface KeypadKey {
  num: string;
  sub: string;
}

const KEYPAD_KEYS: KeypadKey[] = [
  { num: '1', sub: '' },
  { num: '2', sub: 'ABC' },
  { num: '3', sub: 'DEF' },
  { num: '4', sub: 'GHI' },
  { num: '5', sub: 'JKL' },
  { num: '6', sub: 'MNO' },
  { num: '7', sub: 'PQRS' },
  { num: '8', sub: 'TUV' },
  { num: '9', sub: 'WXYZ' },
];

/**
 * Volumetric Floating Squircle Monolith (144x144, w-36 h-36):
 * Ultra-dark obsidian glass (#0A0D14) with razor-sharp champagne gold chamfered
 * outer bevel, dual-stop specular reflection, and liquid metallic "SB" typography.
 */
function VolumetricMonolith({ className = 'w-36 h-36' }: { className?: string }) {
  return (
    <div className="relative flex items-center justify-center">
      {/* Organic slow ambient luminescence behind monogram */}
      <motion.div
        animate={{
          opacity: [0.35, 0.65, 0.35],
          scale: [0.95, 1.08, 0.95],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute w-36 h-36 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(212, 175, 55, 0.3) 0%, rgba(212, 175, 55, 0.08) 45%, transparent 70%)',
          filter: 'blur(20px)',
        }}
      />

      <svg
        viewBox="0 0 144 144"
        className={`${className} relative z-10`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Razor-sharp Champagne Gold Chamfer Bevel */}
          <linearGradient id="goldChamferBevel" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFF9DF" stopOpacity="0.95" />
            <stop offset="26%" stopColor="#D4AF37" stopOpacity="0.85" />
            <stop offset="52%" stopColor="#6E530F" stopOpacity="0.3" />
            <stop offset="78%" stopColor="#F5D77F" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#FFF9DF" stopOpacity="0.95" />
          </linearGradient>

          {/* High-Contrast Liquid Metallic Champagne Typography */}
          <linearGradient id="liquidGold" x1="10%" y1="0%" x2="90%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.98" />
            <stop offset="22%" stopColor="#FFF4C2" />
            <stop offset="55%" stopColor="#E5C158" />
            <stop offset="85%" stopColor="#B88E22" />
            <stop offset="100%" stopColor="#7E5D0C" />
          </linearGradient>

          {/* Specular Diagonal Sheen */}
          <linearGradient id="glassSheen" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="white" stopOpacity="0.16" />
            <stop offset="40%" stopColor="white" stopOpacity="0.04" />
            <stop offset="70%" stopColor="transparent" stopOpacity="0" />
          </linearGradient>

          {/* Shimmer Caustic Light Sweep */}
          <linearGradient id="causticSweep144" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="white" stopOpacity="0" />
            <stop offset="45%" stopColor="#FFF9E0" stopOpacity="0.18" />
            <stop offset="50%" stopColor="white" stopOpacity="0.36" />
            <stop offset="55%" stopColor="#FFF9E0" stopOpacity="0.18" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </linearGradient>

          <clipPath id="monolithClip">
            <rect x="1.5" y="1.5" width="141" height="141" rx="35" ry="35" />
          </clipPath>
        </defs>

        {/* Deep Obsidian Volumetric Body */}
        <rect
          x="1.5"
          y="1.5"
          width="141"
          height="141"
          rx="35"
          ry="35"
          fill="#0A0D14"
          stroke="url(#goldChamferBevel)"
          strokeWidth="1.2"
        />

        {/* Specular Top-Left Glass Rim Highlight */}
        <path
          d="M 37 2.5 H 107 C 126 2.5 141.5 18 141.5 37"
          fill="none"
          stroke="rgba(255, 255, 255, 0.24)"
          strokeWidth="1"
        />

        {/* Inner Dark Glass Sheen */}
        <rect
          x="3"
          y="3"
          width="138"
          height="138"
          rx="33"
          ry="33"
          fill="url(#glassSheen)"
          stroke="rgba(255, 255, 255, 0.04)"
          strokeWidth="1"
        />

        {/* Caustic Light Sweep Across Glass Face */}
        <g clipPath="url(#monolithClip)">
          <rect
            className="caustic-sweep"
            x="-160"
            y="-30"
            width="100"
            height="190"
            fill="url(#causticSweep144)"
            transform="skewX(-25)"
          />
        </g>

        {/* Liquid Metallic "SB" Monogram (Vector Paths, 144x144 canvas) */}
        <g>
          {/* Letter 'S' */}
          <path
            d="M 66 47 H 45 C 40.029 47 36 51.029 36 56 V 64 C 36 68.971 40.029 73 45 73 H 57 C 61.971 73 66 77.029 66 82 V 89 C 66 93.971 61.971 98 57 98 H 36"
            fill="none"
            stroke="url(#liquidGold)"
            strokeWidth="6.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Letter 'B' */}
          <path
            d="M 78 47 V 98"
            stroke="url(#liquidGold)"
            strokeWidth="6.5"
            strokeLinecap="round"
          />
          <path
            d="M 78 47 H 91 C 97.627 47 103 52.373 103 59 C 103 65.627 97.627 71 91 71 H 78"
            fill="none"
            stroke="url(#liquidGold)"
            strokeWidth="6.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M 78 71 H 93 C 99.627 71 105 76.82 105 84.5 C 105 92.18 99.627 98 93 98 H 78"
            fill="none"
            stroke="url(#liquidGold)"
            strokeWidth="6.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      </svg>
    </div>
  );
}

export default function Home() {
  const [currentScreen, setCurrentScreen] = useState<ScreenState>('splash');
  const [pin, setPin] = useState<string>('');
  const [isError, setIsError] = useState<boolean>(false);
  const [isSuccessOwner, setIsSuccessOwner] = useState<boolean>(false);
  const [isSuccessManager, setIsSuccessManager] = useState<boolean>(false);
  const [isIrisUnlocking, setIsIrisUnlocking] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // 1. 3D GYRO & TOUCH-MOVE PARALLAX
  const [tilt, setTilt] = useState<{ rx: number; ry: number }>({ rx: 0, ry: 0 });
  const touchStartYRef = useRef<number | null>(null);
  const touchStartXRef = useRef<number | null>(null);
  const touchStartTimeRef = useRef<number>(0);

  // Keypad touch ripple blooms
  const [activeBlooms, setActiveBlooms] = useState<{ [key: string]: { x: number; y: number } }>({});

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2; // -1 to 1
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2; // -1 to 1
    setTilt({ rx: -y * 8, ry: x * 8 });
  };

  const handlePointerLeave = () => {
    setTilt({ rx: 0, ry: 0 });
  };

  // Hardware Gyroscope Support for Mobile
  useEffect(() => {
    const handleDeviceOrientation = (event: DeviceOrientationEvent) => {
      if (event.gamma !== null && event.beta !== null) {
        // Clamp gamma (-45 to 45 deg) and beta (-45 to 45 deg)
        const x = Math.max(-1, Math.min(1, event.gamma / 30));
        const y = Math.max(-1, Math.min(1, (event.beta - 45) / 30));
        setTilt({ rx: -y * 8, ry: x * 8 });
      }
    };

    if (typeof window !== 'undefined' && window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', handleDeviceOrientation, { passive: true });
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('deviceorientation', handleDeviceOrientation);
      }
    };
  }, []);

  // 2. DUAL INTERACTION: TAP OR SWIPE-UP TO ENTER
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    touchStartYRef.current = e.touches[0].clientY;
    touchStartXRef.current = e.touches[0].clientX;
    touchStartTimeRef.current = Date.now();
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartYRef.current === null || touchStartXRef.current === null) return;
    const deltaY = touchStartYRef.current - e.changedTouches[0].clientY;
    const deltaX = Math.abs(touchStartXRef.current - e.changedTouches[0].clientX);
    const duration = Date.now() - touchStartTimeRef.current;

    // Swipe up (deltaY > 50px) OR clean tap (short duration, small delta)
    if (deltaY > 50 || (duration < 350 && Math.abs(deltaY) < 15 && deltaX < 15)) {
      handleSplashDismiss();
    }
    touchStartYRef.current = null;
    touchStartXRef.current = null;
  };

  const handleSplashDismiss = () => {
    if (currentScreen === 'splash') {
      setCurrentScreen('pin');
    }
  };

  // 3. TACTILE KEYPAD BLOOM
  const triggerKeyBloom = (key: string, e: React.PointerEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setActiveBlooms((prev) => ({ ...prev, [key]: { x, y } }));

    setTimeout(() => {
      setActiveBlooms((prev) => {
        const copy = { ...prev };
        delete copy[key];
        return copy;
      });
    }, 280);
  };

  // 4. CINEMATIC IRIS UNLOCK SEQUENCE & WRONG PIN HANDLING
  const handlePinComplete = useCallback((completedPin: string) => {
    setIsProcessing(true);

    if (completedPin === '1912') {
      // Owner PIN Match
      setIsSuccessOwner(true);
      setIsIrisUnlocking(true);
      setStatusMessage('Access Granted // Owner');
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([18, 30, 24]);
      }
      setTimeout(() => {
        setCurrentScreen('owner_console');
        setPin('');
        setIsSuccessOwner(false);
        setIsIrisUnlocking(false);
        setStatusMessage(null);
        setIsProcessing(false);
      }, 700);
    } else if (completedPin === '1289') {
      // Manager PIN Match
      setIsSuccessManager(true);
      setIsIrisUnlocking(true);
      setStatusMessage('Access Granted // Manager');
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([18, 30, 24]);
      }
      setTimeout(() => {
        setCurrentScreen('manager_console');
        setPin('');
        setIsSuccessManager(false);
        setIsIrisUnlocking(false);
        setStatusMessage(null);
        setIsProcessing(false);
      }, 700);
    } else {
      // Incorrect PIN: Stiff violent shake, crimson pulse, warning strobe
      setIsError(true);
      setStatusMessage('ACCESS DENIED // INVALID PIN');
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([50, 40, 50, 40, 70]);
      }
      setTimeout(() => {
        setPin('');
        setIsError(false);
        setStatusMessage(null);
        setIsProcessing(false);
      }, 650);
    }
  }, []);

  const handleKeyPress = (num: string, e: React.PointerEvent<HTMLButtonElement>) => {
    if (isProcessing || pin.length >= 4) return;
    triggerKeyBloom(num, e);
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([16]);
    }
    const newPin = pin + num;
    setPin(newPin);

    if (newPin.length === 4) {
      handlePinComplete(newPin);
    }
  };

  const handleBackspace = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (isProcessing || isError) return;
    triggerKeyBloom('del', e);
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([14]);
    }
    setPin((prev) => prev.slice(0, -1));
  };

  const handleLockTerminal = () => {
    setPin('');
    setIsError(false);
    setIsSuccessOwner(false);
    setIsSuccessManager(false);
    setIsIrisUnlocking(false);
    setStatusMessage(null);
    setIsProcessing(false);
    setCurrentScreen('pin');
  };

  return (
    <main className="min-h-screen w-full bg-[#06080C] text-[#F8FAFC] flex flex-col items-center justify-center p-0 sm:p-4 overflow-hidden relative selection:bg-[#D4AF37]/30 selection:text-white">
      {/* Mobile-first touch viewport strictly max-w-md mx-auto min-h-screen */}
      <div
        className={`w-full max-w-md min-h-screen sm:min-h-[820px] sm:h-[844px] relative flex flex-col justify-between overflow-hidden bg-[#06080C] shadow-[0_30px_90px_rgba(0,0,0,0.95)] sm:rounded-[44px] sm:border sm:border-white/[0.08] transition-shadow duration-300 ${
          isError ? 'animate-warning-strobe border-rose-500/50' : ''
        }`}
      >
        
        {/* Top Gold Laser Sweep on Iris Unlock */}
        {isIrisUnlocking && (
          <div className="absolute top-0 left-0 right-0 h-[2px] z-50 overflow-hidden pointer-events-none">
            <div className="h-full w-48 bg-gradient-to-r from-transparent via-[#FFF4C2] to-transparent shadow-[0_0_12px_#D4AF37] animate-laser-sweep" />
          </div>
        )}

        {/* Subtle Atmospheric Champagne Aura */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          <div
            className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[360px] h-[360px] rounded-full gpu-layer"
            style={{
              background: 'radial-gradient(circle, rgba(212, 175, 55, 0.05) 0%, rgba(212, 175, 55, 0.015) 45%, transparent 70%)',
              filter: 'blur(60px)',
            }}
          />
          {/* Razor-thin 1px Titanium Rim Line at top */}
          <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.12] to-transparent" />
        </div>

        <AnimatePresence mode="wait">
          {/* ================= SCREEN 1: TOUCH / SWIPE-UP TO ENTER WELCOME SPLASH ================= */}
          {currentScreen === 'splash' && (
            <motion.div
              key="splash"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -40, scale: 0.9, filter: 'blur(12px)' }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              onClick={handleSplashDismiss}
              onPointerMove={handlePointerMove}
              onPointerLeave={handlePointerLeave}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              className="absolute inset-0 flex flex-col justify-between items-center px-6 py-12 cursor-pointer select-none z-20 gpu-layer"
            >
              {/* Top Cockpit Status Line */}
              <div className="w-full flex items-center justify-between opacity-80 pt-2 pointer-events-none">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] shadow-[0_0_6px_rgba(212,175,55,0.8)]" />
                  <span className="text-[10px] font-mono tracking-widest text-[#94A3B8] uppercase">
                    SBSUITE.IN // PRECISION OS
                  </span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] text-[10px] font-medium text-[#E2E8F0]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] shadow-[0_0_6px_#D4AF37]" />
                  STANDBY
                </div>
              </div>

              {/* Center Hero Visual: Monolith with 3D Gyro Tilt Parallax */}
              <div className="flex flex-col items-center justify-center text-center -mt-4 pointer-events-none">
                <div
                  className="relative mb-7 shadow-[0_25px_60px_rgba(0,0,0,0.85)] rounded-[36px]"
                  style={{
                    perspective: '1000px',
                    transform: `perspective(1000px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg) translate3d(0,0,0)`,
                    transition: tilt.rx === 0 && tilt.ry === 0 ? 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)' : 'transform 0.08s ease-out',
                    willChange: 'transform',
                  }}
                >
                  <VolumetricMonolith className="w-36 h-36" />
                </div>

                {/* Platinum Estate Title */}
                <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#EDEDED] leading-tight">
                  Shree Balaji Estate
                </h1>

                {/* Subtitle Badge with Champagne Gold Accent */}
                <div className="mt-3.5 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] shadow-[0_4px_16px_rgba(0,0,0,0.4)]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] shadow-[0_0_6px_#D4AF37]" />
                  <span className="text-[11px] font-mono font-medium tracking-widest text-[#94A3B8]">
                    TERMINAL GATEWAY // 2026
                  </span>
                </div>
              </div>

              {/* Bottom Call-to-Action: Tap or Swipe-Up to Enter */}
              <div className="w-full flex flex-col items-center pb-2 pointer-events-none">
                <div className="relative overflow-hidden inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-white/[0.04] backdrop-blur-2xl border border-white/[0.12] shadow-[0_8px_32px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.15)] text-xs font-mono font-semibold tracking-wider text-[#F1F5F9]">
                  {/* Horizontal light-shimmer */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.14] to-transparent -translate-x-full animate-shimmer pointer-events-none" />
                  
                  <span className="w-2 h-2 rounded-full bg-[#D4AF37] shadow-[0_0_8px_#D4AF37] animate-pulse" />
                  <span>TAP OR SWIPE UP TO ENTER</span>
                </div>
                <span className="text-[10px] font-mono text-[#64748B] tracking-widest mt-2 uppercase">
                  &uarr; SWIPE TO INITIALIZE
                </span>
              </div>
            </motion.div>
          )}

          {/* ================= SCREEN 2: VOLUMETRIC GLASS PEBBLE PIN GATEWAY ================= */}
          {currentScreen === 'pin' && (
            <motion.div
              key="pin-gateway"
              initial={{ opacity: 0, scale: 0.97, y: 30 }}
              animate={
                isIrisUnlocking
                  ? { opacity: 0, scale: 1.05, filter: 'blur(8px)', transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] } }
                  : { opacity: 1, scale: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } }
              }
              exit={{ opacity: 0, scale: 1.05, filter: 'blur(8px)' }}
              className="relative w-full h-full flex flex-col justify-between px-6 py-6 z-10 gpu-layer"
            >
              {/* Clean Balanced Header without Back Button */}
              <div className="w-full flex items-center justify-between pt-2 pb-1">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] shadow-[0_4px_16px_rgba(0,0,0,0.4)]">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] shadow-[0_0_6px_rgba(212,175,55,0.8)]" />
                  <span className="text-[11px] font-mono font-medium uppercase tracking-wider text-[#CBD5E1]">
                    Shree Balaji Estate
                  </span>
                </div>

                {/* Sleek Green Security Indicator Dot */}
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] shadow-[0_4px_16px_rgba(0,0,0,0.4)]">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#10B981] animate-pulse" />
                  <span className="text-[10px] font-mono font-medium text-[#94A3B8]">GATEWAY SECURED</span>
                </div>
              </div>

              {/* Title & The 4 PIN Wells */}
              <div className="flex flex-col items-center text-center my-auto py-2">
                <div
                  className={`w-11 h-11 rounded-2xl bg-[#0D1117] border shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_4px_16px_rgba(0,0,0,0.4)] flex items-center justify-center mb-3 transition-colors duration-200 ${
                    isError ? 'border-rose-500/60 bg-rose-950/20' : 'border-white/[0.08]'
                  }`}
                >
                  {isError ? (
                    <AlertOctagon className="w-4 h-4 text-rose-400 animate-pulse" />
                  ) : (
                    <Lock className="w-4 h-4 text-[#D4AF37]" />
                  )}
                </div>

                <h2 className="text-2xl sm:text-[26px] font-semibold tracking-tight text-[#EDEDED]">
                  Enter Security PIN
                </h2>
                <p className="text-xs sm:text-sm font-normal text-[#64748B] mt-1 max-w-[260px]">
                  Enter 4-digit terminal access code
                </p>

                {/* Status Micro-Badge */}
                <div className="h-7 mt-3 flex items-center justify-center">
                  <AnimatePresence mode="wait">
                    {statusMessage ? (
                      <motion.div
                        key="status-badge"
                        initial={{ opacity: 0, scale: 0.94, y: 2 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium backdrop-blur-xl border shadow-sm ${
                          isError
                            ? 'bg-rose-950/60 border-rose-500/60 text-rose-300 shadow-[0_0_15px_rgba(225,29,72,0.4)]'
                            : isSuccessOwner
                            ? 'bg-[#D4AF37]/15 border-[#D4AF37]/30 text-[#FFF4C2]'
                            : 'bg-slate-800/40 border-slate-700/50 text-slate-200'
                        }`}
                      >
                        {isError ? (
                          <span>{statusMessage}</span>
                        ) : (
                          <>
                            <Check className="w-3.5 h-3.5 text-[#D4AF37]" />
                            <span>{statusMessage}</span>
                          </>
                        )}
                      </motion.div>
                    ) : (
                      <span className="text-[11px] font-mono text-[#475569] tracking-wider uppercase">
                        Authorized Personnel Only
                      </span>
                    )}
                  </AnimatePresence>
                </div>

                {/* THE 4 PIN WELLS: Sunken Concave Glass Capsules with Shockwave Halo Ring */}
                <div className="relative mt-5">
                  {/* Halo shockwave ring around wells on valid unlock */}
                  {isIrisUnlocking && (
                    <div className="absolute inset-[-12px] pointer-events-none flex items-center justify-center">
                      <div className="w-full h-12 rounded-full border-2 border-[#FFF4C2] animate-shockwave shadow-[0_0_20px_#D4AF37]" />
                    </div>
                  )}

                  <div
                    className={`flex items-center justify-center gap-5 ${
                      isError ? 'animate-shake' : ''
                    }`}
                  >
                    {[0, 1, 2, 3].map((index) => {
                      const isFilled = pin.length > index;
                      return (
                        <div
                          key={index}
                          className={`w-6 h-6 rounded-full bg-[#07090E] border shadow-[inset_0_3px_6px_rgba(0,0,0,0.95),inset_0_1px_2px_rgba(0,0,0,0.8),0_1px_1px_rgba(255,255,255,0.06)] flex items-center justify-center relative overflow-hidden transition-colors duration-150 ${
                            isError ? 'border-rose-500/80 shadow-[inset_0_0_8px_rgba(225,29,72,0.8)]' : 'border-white/[0.06]'
                          }`}
                        >
                          <AnimatePresence>
                            {isFilled && (
                              <motion.div
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0, opacity: 0 }}
                                transition={{ type: 'spring', stiffness: 500, damping: 24 }}
                                className={`w-3.5 h-3.5 rounded-full transition-all duration-150 gpu-layer ${
                                  isError
                                    ? 'bg-gradient-to-b from-[#FDA4AF] to-[#E11D48] shadow-[0_0_14px_rgba(225,29,72,0.9)]'
                                    : isSuccessOwner
                                    ? 'bg-gradient-to-b from-[#FFF4C2] via-[#E5C158] to-[#D4AF37] shadow-[0_0_18px_rgba(212,175,55,1)]'
                                    : isSuccessManager
                                    ? 'bg-gradient-to-b from-white via-[#E2E8F0] to-[#94A3B8] shadow-[0_0_16px_rgba(226,232,240,0.9)]'
                                    : 'bg-gradient-to-b from-[#FFF4C2] via-[#E5C158] to-[#D4AF37] shadow-[0_0_14px_rgba(212,175,55,0.75),inset_0_1px_1px_#FFF]'
                                }`}
                              />
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* TACTILE 3D GLASS KEYS: Skeuomorphic Frosted Glass Pebbles with Touch Bloom */}
              <div className="w-full max-w-[324px] mx-auto pb-4">
                <div className="grid grid-cols-3 gap-y-3 gap-x-4 justify-items-center">
                  {KEYPAD_KEYS.map(({ num, sub }) => (
                    <button
                      key={num}
                      type="button"
                      disabled={isProcessing}
                      onPointerDown={(e) => handleKeyPress(num, e)}
                      className="w-20 h-20 rounded-[26px] glass-pebble flex flex-col items-center justify-center text-[#F1F5F9] cursor-pointer select-none gpu-layer touch-manipulation disabled:opacity-40"
                    >
                      {/* Dynamic Soft Radial Bloom on Exact Touch Origin */}
                      {activeBlooms[num] && (
                        <span
                          className="absolute pointer-events-none rounded-full"
                          style={{
                            left: `${activeBlooms[num].x}px`,
                            top: `${activeBlooms[num].y}px`,
                            transform: 'translate(-50%, -50%)',
                            width: '85px',
                            height: '85px',
                            background: 'radial-gradient(circle, rgba(255, 244, 194, 0.45) 0%, rgba(212, 175, 55, 0.2) 40%, transparent 75%)',
                            animation: 'fade-bloom 0.3s ease-out forwards',
                          }}
                        />
                      )}
                      <span className="text-2xl font-light leading-none tracking-tight relative z-10">
                        {num}
                      </span>
                      {sub && (
                        <span className="text-[10px] font-mono text-[#64748B] tracking-widest mt-1 leading-none uppercase relative z-10">
                          {sub}
                        </span>
                      )}
                    </button>
                  ))}

                  {/* Empty Spacer */}
                  <div className="w-20 h-20" />

                  {/* 0 Key */}
                  <button
                    type="button"
                    disabled={isProcessing}
                    onPointerDown={(e) => handleKeyPress('0', e)}
                    className="w-20 h-20 rounded-[26px] glass-pebble flex flex-col items-center justify-center text-[#F1F5F9] cursor-pointer select-none gpu-layer touch-manipulation disabled:opacity-40"
                  >
                    {activeBlooms['0'] && (
                      <span
                        className="absolute pointer-events-none rounded-full"
                        style={{
                          left: `${activeBlooms['0'].x}px`,
                          top: `${activeBlooms['0'].y}px`,
                          transform: 'translate(-50%, -50%)',
                          width: '85px',
                          height: '85px',
                          background: 'radial-gradient(circle, rgba(255, 244, 194, 0.45) 0%, rgba(212, 175, 55, 0.2) 40%, transparent 75%)',
                        }}
                      />
                    )}
                    <span className="text-2xl font-light leading-none tracking-tight relative z-10">
                      0
                    </span>
                  </button>

                  {/* Backspace Key */}
                  <button
                    type="button"
                    disabled={isProcessing || pin.length === 0}
                    onPointerDown={handleBackspace}
                    aria-label="Delete digit"
                    className="w-20 h-20 rounded-[26px] glass-pebble flex items-center justify-center text-[#64748B] hover:text-[#EDEDED] active:text-rose-400 cursor-pointer select-none gpu-layer touch-manipulation disabled:opacity-20"
                  >
                    {activeBlooms['del'] && (
                      <span
                        className="absolute pointer-events-none rounded-full"
                        style={{
                          left: `${activeBlooms['del'].x}px`,
                          top: `${activeBlooms['del'].y}px`,
                          transform: 'translate(-50%, -50%)',
                          width: '85px',
                          height: '85px',
                          background: 'radial-gradient(circle, rgba(255, 244, 194, 0.35) 0%, transparent 70%)',
                        }}
                      />
                    )}
                    <Delete className="w-5 h-5 relative z-10" strokeWidth={2} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ================= SCREEN 3: OWNER CONSOLE READY ================= */}
          {currentScreen === 'owner_console' && (
            <motion.div
              key="owner-screen"
              initial={{ opacity: 0, scale: 0.95, filter: 'blur(8px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full h-full min-h-screen flex flex-col justify-between p-6 z-10 gpu-layer"
            >
              {/* Top Cockpit Header */}
              <div className="relative -mx-6 -mt-6 p-6 overflow-hidden bg-white/[0.02] backdrop-blur-2xl border-b border-white/[0.08] shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#0D1117] border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37] font-bold text-sm shadow-[0_2px_12px_rgba(212,175,55,0.2)]">
                      SB
                    </div>
                    <div>
                      <h2 className="text-sm font-semibold text-[#EDEDED] tracking-wide">Shree Balaji Estate</h2>
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono font-medium text-[#D4AF37] bg-[#D4AF37]/10 border border-[#D4AF37]/25 px-2 py-0.5 rounded-full">
                        <Sparkles className="w-2.5 h-2.5 text-[#D4AF37]" />
                        OWNER CONSOLE
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleLockTerminal}
                    className="p-2.5 rounded-xl bg-[#0D1117] border border-white/[0.08] text-[#94A3B8] hover:text-white active:scale-95 transition-transform duration-75 cursor-pointer shadow-sm"
                    title="Lock Terminal"
                  >
                    <Lock className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Center Cockpit Stage */}
              <div className="my-auto flex flex-col items-center text-center px-4">
                <div className="w-20 h-20 rounded-[28px] bg-[#0D1117] border border-[#D4AF37]/30 shadow-[0_0_35px_rgba(212,175,55,0.18)] flex items-center justify-center mb-5">
                  <VolumetricMonolith className="w-14 h-14" />
                </div>

                <span className="px-3 py-1 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] text-xs font-mono font-medium uppercase tracking-wider mb-2.5">
                  Welcome, Owner
                </span>

                <h3 className="text-2xl font-semibold text-[#EDEDED] tracking-tight">
                  [ OWNER CONSOLE READY ]
                </h3>
                <p className="text-xs text-[#64748B] mt-2 max-w-xs leading-relaxed">
                  Authentication verified. Master telemetry and property administration primed.
                </p>

                {/* Smoked Dark Glass Card with 1px Titanium Edges */}
                <div className="w-full mt-6 p-5 rounded-2xl bg-white/[0.02] backdrop-blur-2xl border border-white/[0.08] shadow-[0_12px_40px_rgba(0,0,0,0.6)] text-left">
                  <div className="flex items-center justify-between text-xs pb-3 border-b border-white/[0.06] font-mono font-medium text-[#94A3B8]">
                    <span>SYSTEM STATUS</span>
                    <span className="text-[#D4AF37] flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] shadow-[0_0_6px_#D4AF37]" />
                      ACTIVE // STEP 1
                    </span>
                  </div>
                  <div className="mt-3 text-xs font-mono text-[#64748B] space-y-1.5">
                    <p>&bull; 3D Gyro Parallax Core Verified</p>
                    <p>&bull; Cinematic Iris Sequence Engaged</p>
                    <p>&bull; Ready for Units, Parking & Ledger Engine</p>
                  </div>
                </div>
              </div>

              {/* Bottom Quick Action */}
              <div className="w-full pt-4">
                <button
                  onClick={handleLockTerminal}
                  className="w-full py-3.5 px-4 rounded-xl bg-[#D4AF37] hover:bg-[#E5C158] text-[#06080C] font-semibold text-sm shadow-[0_0_25px_rgba(212,175,55,0.3)] active:scale-98 transition-all duration-75 flex items-center justify-center gap-2 cursor-pointer border border-[#FFF4C2]/40"
                >
                  <Lock className="w-4 h-4 text-[#06080C]" />
                  <span>Lock & Switch User</span>
                </button>
              </div>
            </motion.div>
          )}

          {/* ================= SCREEN 4: MANAGER TERMINAL READY ================= */}
          {currentScreen === 'manager_console' && (
            <motion.div
              key="manager-screen"
              initial={{ opacity: 0, scale: 0.95, filter: 'blur(8px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full h-full min-h-screen flex flex-col justify-between p-6 z-10 gpu-layer"
            >
              {/* Top Cockpit Header */}
              <div className="relative -mx-6 -mt-6 p-6 overflow-hidden bg-white/[0.02] backdrop-blur-2xl border-b border-white/[0.08] shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#0D1117] border border-white/[0.12] flex items-center justify-center text-[#E2E8F0] font-bold text-sm shadow-[0_2px_12px_rgba(255,255,255,0.08)]">
                      SB
                    </div>
                    <div>
                      <h2 className="text-sm font-semibold text-[#EDEDED] tracking-wide">Shree Balaji Estate</h2>
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono font-medium text-[#CBD5E1] bg-white/[0.06] border border-white/[0.1] px-2 py-0.5 rounded-full">
                        <ChevronRight className="w-2.5 h-2.5 text-[#CBD5E1]" />
                        MANAGER SHIFT
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleLockTerminal}
                    className="p-2.5 rounded-xl bg-[#0D1117] border border-white/[0.08] text-[#94A3B8] hover:text-white active:scale-95 transition-transform duration-75 cursor-pointer shadow-sm"
                    title="Lock Terminal"
                  >
                    <Lock className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Center Cockpit Stage */}
              <div className="my-auto flex flex-col items-center text-center px-4">
                <div className="w-20 h-20 rounded-[28px] bg-[#0D1117] border border-white/[0.1] shadow-[0_0_35px_rgba(255,255,255,0.06)] flex items-center justify-center mb-5">
                  <VolumetricMonolith className="w-14 h-14" />
                </div>

                <span className="px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-[#E2E8F0] text-xs font-mono font-medium uppercase tracking-wider mb-2.5">
                  Shift Started: Manager
                </span>

                <h3 className="text-2xl font-semibold text-[#EDEDED] tracking-tight">
                  [ MANAGER TERMINAL READY ]
                </h3>
                <p className="text-xs text-[#64748B] mt-2 max-w-xs leading-relaxed">
                  Shift active. Operational terminal primed for parking and tenant management.
                </p>

                {/* Smoked Dark Glass Card with 1px Titanium Edges */}
                <div className="w-full mt-6 p-5 rounded-2xl bg-white/[0.02] backdrop-blur-2xl border border-white/[0.08] shadow-[0_12px_40px_rgba(0,0,0,0.6)] text-left">
                  <div className="flex items-center justify-between text-xs pb-3 border-b border-white/[0.06] font-mono font-medium text-[#94A3B8]">
                    <span>TERMINAL MODE</span>
                    <span className="text-[#CBD5E1] flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#CBD5E1] shadow-[0_0_6px_#CBD5E1]" />
                      MANAGER SHIFT // STEP 1
                    </span>
                  </div>
                  <div className="mt-3 text-xs font-mono text-[#64748B] space-y-1.5">
                    <p>&bull; 3D Gyro Parallax Core Verified</p>
                    <p>&bull; Cinematic Iris Sequence Engaged</p>
                    <p>&bull; Ready for Parking Gate & Meter Logging</p>
                  </div>
                </div>
              </div>

              {/* Bottom Quick Action */}
              <div className="w-full pt-4">
                <button
                  onClick={handleLockTerminal}
                  className="w-full py-3.5 px-4 rounded-xl bg-white/[0.08] hover:bg-white/[0.12] text-[#EDEDED] font-semibold text-sm shadow-[0_4px_20px_rgba(0,0,0,0.4)] active:scale-98 transition-all duration-75 flex items-center justify-center gap-2 cursor-pointer border border-white/[0.15]"
                >
                  <Lock className="w-4 h-4 text-[#EDEDED]" />
                  <span>Lock & Switch User</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
