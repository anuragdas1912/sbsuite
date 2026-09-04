'use client';

import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Delete, ShieldCheck, Lock, Sparkles, Check, ChevronRight, AlertOctagon, Zap, Plus, Store, X, Camera, AlertTriangle } from 'lucide-react';

type ScreenState = 'splash' | 'pin' | 'units_deck' | 'owner_console' | 'manager_console';
type UserRole = 'owner' | 'manager';

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

export interface UnitItem {
  id: string;
  name: string;
  type: 'room' | 'shop';
  isOccupied: boolean;
  tenantName?: string;
  rentAmount: number;
  rentDueAmount: number;
  lastReading: number;
  isReadingPending: boolean;
}

const STATIC_UNITS: UnitItem[] = [
  // 14 ROOMS (Occupancy: 12/14, Due: ₹4,000, Unread Meters: 3)
  { id: 'r-101', name: 'R-101', type: 'room', isOccupied: true, tenantName: 'Sunil Verma', rentAmount: 6500, rentDueAmount: 0, lastReading: 1420, isReadingPending: false },
  { id: 'r-102', name: 'R-102', type: 'room', isOccupied: true, tenantName: 'Amit Sharma', rentAmount: 6500, rentDueAmount: 4000, lastReading: 1380, isReadingPending: true },
  { id: 'r-103', name: 'R-103', type: 'room', isOccupied: true, tenantName: 'Rajesh Patel', rentAmount: 7000, rentDueAmount: 0, lastReading: 1890, isReadingPending: false },
  { id: 'r-104', name: 'R-104', type: 'room', isOccupied: true, tenantName: 'Priya Nair', rentAmount: 6500, rentDueAmount: 0, lastReading: 1120, isReadingPending: false },
  { id: 'r-105', name: 'R-105', type: 'room', isOccupied: true, tenantName: 'Vikas Gupta', rentAmount: 6000, rentDueAmount: 0, lastReading: 980, isReadingPending: false },
  { id: 'r-106', name: 'R-106', type: 'room', isOccupied: true, tenantName: 'Deepak Yadav', rentAmount: 6500, rentDueAmount: 0, lastReading: 2150, isReadingPending: false },
  { id: 'r-107', name: 'R-107', type: 'room', isOccupied: true, tenantName: 'Sneha Kulkarni', rentAmount: 7000, rentDueAmount: 0, lastReading: 1460, isReadingPending: true },
  { id: 'r-108', name: 'R-108', type: 'room', isOccupied: false, rentAmount: 6500, rentDueAmount: 0, lastReading: 1200, isReadingPending: false },
  { id: 'r-109', name: 'R-109', type: 'room', isOccupied: true, tenantName: 'Manish Tiwari', rentAmount: 6500, rentDueAmount: 0, lastReading: 1340, isReadingPending: false },
  { id: 'r-110', name: 'R-110', type: 'room', isOccupied: true, tenantName: 'Ananya Roy', rentAmount: 7500, rentDueAmount: 0, lastReading: 1760, isReadingPending: false },
  { id: 'r-111', name: 'R-111', type: 'room', isOccupied: true, tenantName: 'Rohit Chauhan', rentAmount: 6500, rentDueAmount: 0, lastReading: 1510, isReadingPending: false },
  { id: 'r-112', name: 'R-112', type: 'room', isOccupied: false, rentAmount: 7000, rentDueAmount: 0, lastReading: 940, isReadingPending: false },
  { id: 'r-113', name: 'R-113', type: 'room', isOccupied: true, tenantName: 'Karan Malhotra', rentAmount: 7000, rentDueAmount: 0, lastReading: 1680, isReadingPending: true },
  { id: 'r-114', name: 'R-114', type: 'room', isOccupied: true, tenantName: 'Pooja Mehra', rentAmount: 7500, rentDueAmount: 0, lastReading: 1930, isReadingPending: false },

  // 8 SHOPS (Occupancy: 7/8, Due: ₹8,500, Unread Meters: 1)
  { id: 's-01', name: 'S-01', type: 'shop', isOccupied: true, tenantName: 'Balaji Medicals', rentAmount: 18000, rentDueAmount: 0, lastReading: 4210, isReadingPending: false },
  { id: 's-02', name: 'S-02', type: 'shop', isOccupied: true, tenantName: 'Shree Ganesh Grocery', rentAmount: 16500, rentDueAmount: 0, lastReading: 3890, isReadingPending: false },
  { id: 's-03', name: 'S-03', type: 'shop', isOccupied: true, tenantName: 'Modern Dry Cleaners', rentAmount: 14000, rentDueAmount: 8500, lastReading: 2890, isReadingPending: true },
  { id: 's-04', name: 'S-04', type: 'shop', isOccupied: true, tenantName: 'Metro Cyber & Print', rentAmount: 12500, rentDueAmount: 0, lastReading: 2450, isReadingPending: false },
  { id: 's-05', name: 'S-05', type: 'shop', isOccupied: false, rentAmount: 15000, rentDueAmount: 0, lastReading: 1100, isReadingPending: false },
  { id: 's-06', name: 'S-06', type: 'shop', isOccupied: true, tenantName: 'Royal Hair Salon', rentAmount: 15000, rentDueAmount: 0, lastReading: 3110, isReadingPending: false },
  { id: 's-07', name: 'S-07', type: 'shop', isOccupied: true, tenantName: 'Shanti Stationery', rentAmount: 13000, rentDueAmount: 0, lastReading: 1840, isReadingPending: false },
  { id: 's-08', name: 'S-08', type: 'shop', isOccupied: true, tenantName: 'Om Sweet & Snacks', rentAmount: 22000, rentDueAmount: 0, lastReading: 5620, isReadingPending: false },
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
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [activeTab, setActiveTab] = useState<'rooms' | 'shops'>('rooms');
  const [pin, setPin] = useState<string>('');
  const [isError, setIsError] = useState<boolean>(false);
  const [isSuccessOwner, setIsSuccessOwner] = useState<boolean>(false);
  const [isSuccessManager, setIsSuccessManager] = useState<boolean>(false);
  const [isIrisUnlocking, setIsIrisUnlocking] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Dynamic units state
  const [units, setUnits] = useState<UnitItem[]>(STATIC_UNITS);

  // Sub-Meter Reading Drawer state
  const [selectedUnit, setSelectedUnit] = useState<UnitItem | null>(null);
  const [currentReadingInput, setCurrentReadingInput] = useState<string>('');
  const [meterPhotoUrl, setMeterPhotoUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Live Math Engine Calculations
  const tariffRate = selectedUnit ? (selectedUnit.type === 'room' ? 9.0 : 11.0) : 9.0;
  const currentReadingNum = currentReadingInput.trim() !== '' ? parseInt(currentReadingInput, 10) : null;
  const isInputValid = currentReadingNum !== null && !isNaN(currentReadingNum);
  const isLowerThanPrev = isInputValid && selectedUnit ? currentReadingNum < selectedUnit.lastReading : false;
  const unitsConsumed = isInputValid && selectedUnit && !isLowerThanPrev ? currentReadingNum - selectedUnit.lastReading : 0;
  const electricityDue = unitsConsumed * tariffRate;
  const canSave = isInputValid && selectedUnit && !isLowerThanPrev;

  const handleUnitClick = (unit: UnitItem) => {
    if (!unit.isOccupied) return;
    setSelectedUnit(unit);
    setCurrentReadingInput('');
    setMeterPhotoUrl(null);
  };

  const handleCloseDrawer = () => {
    setSelectedUnit(null);
    setCurrentReadingInput('');
    setMeterPhotoUrl(null);
  };

  const handleSaveReading = () => {
    if (!canSave || !selectedUnit || currentReadingNum === null) return;
    setUnits((prev) =>
      prev.map((u) =>
        u.id === selectedUnit.id
          ? { ...u, lastReading: currentReadingNum, isReadingPending: false }
          : u
      )
    );
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([24, 30, 24]);
    }
    handleCloseDrawer();
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setMeterPhotoUrl(url);
    }
  };

  // Glanceable stats and filtered units
  const roomsCount = useMemo(() => units.filter((u) => u.type === 'room').length, [units]);
  const shopsCount = useMemo(() => units.filter((u) => u.type === 'shop').length, [units]);

  const displayedUnits = useMemo(() => {
    return units.filter((u) => (activeTab === 'rooms' ? u.type === 'room' : u.type === 'shop'));
  }, [units, activeTab]);

  const currentStats = useMemo(() => {
    const total = displayedUnits.length;
    const occupied = displayedUnits.filter((u) => u.isOccupied).length;
    const dueTotal = displayedUnits.reduce((acc, u) => acc + u.rentDueAmount, 0);
    const unreadMeters = displayedUnits.filter((u) => u.isReadingPending).length;

    return {
      occupancy: `${occupied}/${total}`,
      rentDue: dueTotal === 0 ? '₹0' : `₹${dueTotal.toLocaleString('en-IN')}`,
      unreadMeters: `${unreadMeters}`,
    };
  }, [displayedUnits]);

  // 1. 3D GYRO & TOUCH-MOVE PARALLAX
  const [tilt, setTilt] = useState<{ rx: number; ry: number }>({ rx: 0, ry: 0 });
  const touchStartYRef = useRef<number | null>(null);
  const touchStartXRef = useRef<number | null>(null);
  const touchStartTimeRef = useRef<number>(0);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    setTilt({ rx: -y * 8, ry: x * 8 });
  };

  const handlePointerLeave = () => {
    setTilt({ rx: 0, ry: 0 });
  };

  // Hardware Gyroscope Support for Mobile
  useEffect(() => {
    const handleDeviceOrientation = (event: DeviceOrientationEvent) => {
      if (event.gamma !== null && event.beta !== null) {
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

  // 3. CINEMATIC IRIS UNLOCK SEQUENCE & WRONG PIN HANDLING
  const handlePinComplete = useCallback((completedPin: string) => {
    setIsProcessing(true);

    if (completedPin === '1912') {
      // Owner PIN Match -> Units Grid Deck
      setIsSuccessOwner(true);
      setIsIrisUnlocking(true);
      setUserRole('owner');
      setStatusMessage('Access Granted // Owner');
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([18, 30, 24]);
      }
      setTimeout(() => {
        setCurrentScreen('units_deck');
        setPin('');
        setIsSuccessOwner(false);
        setIsIrisUnlocking(false);
        setStatusMessage(null);
        setIsProcessing(false);
      }, 700);
    } else if (completedPin === '1289') {
      // Manager PIN Match -> Units Grid Deck
      setIsSuccessManager(true);
      setIsIrisUnlocking(true);
      setUserRole('manager');
      setStatusMessage('Access Granted // Manager');
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([18, 30, 24]);
      }
      setTimeout(() => {
        setCurrentScreen('units_deck');
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

  const handleKeyPress = (num: string) => {
    if (isProcessing || pin.length >= 4) return;
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([16]);
    }
    const newPin = pin + num;
    setPin(newPin);

    if (newPin.length === 4) {
      handlePinComplete(newPin);
    }
  };

  const handleBackspace = () => {
    if (isProcessing || isError) return;
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
    setUserRole(null);
    setCurrentScreen('pin');
  };

  return (
    <main className="h-[100dvh] w-full bg-[#06080C] text-[#F8FAFC] flex flex-col items-center justify-center p-0 sm:p-4 overflow-hidden fixed inset-0 selection:bg-[#D4AF37]/30 selection:text-white">
      {/* Mobile-first touch viewport strictly max-w-md mx-auto h-[100dvh] sm:h-[860px] */}
      <div
        id="terminal-viewport"
        className={`w-full max-w-md h-[100dvh] sm:h-[860px] sm:max-h-[92vh] relative flex flex-col justify-start overflow-hidden bg-[#06080C] shadow-[0_30px_90px_rgba(0,0,0,0.95)] sm:rounded-[44px] sm:border sm:border-white/[0.08] transition-shadow duration-300 ${
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
              style={{
                paddingTop: 'max(16px, env(safe-area-inset-top, 16px))',
                paddingBottom: 'max(24px, env(safe-area-inset-bottom, 24px))',
              }}
              className="absolute inset-0 flex flex-col justify-between items-center px-6 cursor-pointer select-none z-20 gpu-layer"
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
              style={{
                paddingTop: 'max(16px, env(safe-area-inset-top, 16px))',
                paddingBottom: 'max(20px, env(safe-area-inset-bottom, 20px))',
              }}
              className="relative w-full h-full flex flex-col justify-between px-6 z-10 gpu-layer"
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
                      let dotStateClass = '';
                      if (isError) {
                        dotStateClass = 'error-dot';
                      } else if (isSuccessOwner) {
                        dotStateClass = 'owner-dot';
                      } else if (isSuccessManager) {
                        dotStateClass = 'manager-dot';
                      } else if (isFilled) {
                        dotStateClass = 'active-dot';
                      }

                      return (
                        <div
                          key={index}
                          className={`w-6 h-6 rounded-full bg-[#07090E] border shadow-[inset_0_3px_6px_rgba(0,0,0,0.95),inset_0_1px_2px_rgba(0,0,0,0.8),0_1px_1px_rgba(255,255,255,0.06)] flex items-center justify-center relative overflow-hidden transition-colors duration-150 ${
                            isError ? 'border-rose-500/80 shadow-[inset_0_0_8px_rgba(225,29,72,0.8)]' : 'border-white/[0.06]'
                          }`}
                        >
                          <div className={`pin-dot-indicator ${dotStateClass}`} />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* TACTILE 3D GLASS KEYS: Pure CSS GPU Active State (Zero-Latency) */}
              <div className="w-full max-w-[324px] mx-auto pb-4">
                <div className="grid grid-cols-3 gap-y-3 gap-x-4 justify-items-center">
                  {KEYPAD_KEYS.map(({ num, sub }) => (
                    <button
                      key={num}
                      type="button"
                      disabled={isProcessing}
                      onClick={() => handleKeyPress(num)}
                      className="w-20 h-20 rounded-[26px] glass-pebble flex flex-col items-center justify-center text-[#F1F5F9] cursor-pointer select-none gpu-layer touch-manipulation disabled:opacity-40"
                    >
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
                    onClick={() => handleKeyPress('0')}
                    className="w-20 h-20 rounded-[26px] glass-pebble flex flex-col items-center justify-center text-[#F1F5F9] cursor-pointer select-none gpu-layer touch-manipulation disabled:opacity-40"
                  >
                    <span className="text-2xl font-light leading-none tracking-tight relative z-10">
                      0
                    </span>
                  </button>

                  {/* Backspace Key */}
                  <button
                    type="button"
                    disabled={isProcessing || pin.length === 0}
                    onClick={handleBackspace}
                    aria-label="Delete digit"
                    className="w-20 h-20 rounded-[26px] glass-pebble flex items-center justify-center text-[#64748B] hover:text-[#EDEDED] active:text-rose-400 cursor-pointer select-none gpu-layer touch-manipulation disabled:opacity-20"
                  >
                    <Delete className="w-5 h-5 relative z-10" strokeWidth={2} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ================= SCREEN 3: UNITS GRID DECK (AUTHENTICATED) ================= */}
          {currentScreen === 'units_deck' && (
            <motion.div
              key="units-deck-screen"
              initial={{ opacity: 0, scale: 0.97, filter: 'blur(8px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0 w-full h-full flex flex-col overflow-hidden z-10 gpu-layer select-none"
            >
              {/* 1. Pinned Sticky Header (Zero Shrink) */}
              <header className="shrink-0 w-full z-20 px-5 pt-[max(12px,env(safe-area-inset-top,12px))] pb-3 border-b border-white/[0.06] bg-[#06080C]/95 backdrop-blur-xl">
                <div className="flex items-center justify-between">
                  {/* Left: Minimalist Titanium SB Monogram & Title */}
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#0D1117] border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37] font-bold text-xs shadow-[0_2px_10px_rgba(212,175,55,0.18)]">
                      SB
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h2 className="text-sm font-semibold text-[#EDEDED] tracking-tight">Shree Balaji Estate</h2>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34D399] animate-pulse" />
                      </div>
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono font-medium text-[#D4AF37]/90 tracking-wide uppercase">
                        {userRole === 'owner' ? 'Owner Telemetry' : 'Manager Shift'}
                      </span>
                    </div>
                  </div>

                  {/* Right: Sleek tactile glass lock button */}
                  <button
                    onClick={handleLockTerminal}
                    aria-label="Lock terminal"
                    className="p-2.5 rounded-xl bg-[#0D1117] border border-white/[0.08] text-[#94A3B8] hover:text-white active:scale-95 transition-all duration-100 cursor-pointer shadow-sm hover:border-[#D4AF37]/30"
                    title="Lock Terminal"
                  >
                    <Lock className="w-4 h-4" />
                  </button>
                </div>

                {/* SEGMENTED VAULT TABS (2 Chunky Glass Pills) */}
                <div className="mt-3.5 grid grid-cols-2 gap-2 p-1 rounded-2xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-md">
                  <button
                    type="button"
                    onClick={() => setActiveTab('rooms')}
                    className={`py-2 px-3 rounded-xl text-xs font-medium font-mono flex items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer ${
                      activeTab === 'rooms'
                        ? 'bg-[#0D1117] text-[#EDEDED] border border-[#D4AF37]/40 shadow-[0_2px_12px_rgba(212,175,55,0.18)]'
                        : 'text-[#94A3B8] hover:text-white border border-transparent'
                    }`}
                  >
                    <span>🛏️ Rooms</span>
                    <span className="text-[11px] opacity-75">({roomsCount})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('shops')}
                    className={`py-2 px-3 rounded-xl text-xs font-medium font-mono flex items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer ${
                      activeTab === 'shops'
                        ? 'bg-[#0D1117] text-[#EDEDED] border border-[#D4AF37]/40 shadow-[0_2px_12px_rgba(212,175,55,0.18)]'
                        : 'text-[#94A3B8] hover:text-white border border-transparent'
                    }`}
                  >
                    <span>🏪 Shops</span>
                    <span className="text-[11px] opacity-75">({shopsCount})</span>
                  </button>
                </div>

                {/* OPERATIONAL QUICK STATS RIBBON */}
                <div className="mt-3 grid grid-cols-3 gap-2 px-3 py-2 rounded-xl bg-white/[0.02] border border-white/[0.05] text-center">
                  <div className="flex flex-col items-center">
                    <span className="text-[9px] font-mono text-[#64748B] uppercase tracking-wider">Occupancy</span>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span className="text-xs font-mono font-semibold text-[#EDEDED]">{currentStats.occupancy}</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-center border-x border-white/[0.06] px-1">
                    <span className="text-[9px] font-mono text-[#64748B] uppercase tracking-wider">Rent Due</span>
                    <span className={`text-xs font-mono font-semibold mt-0.5 ${currentStats.rentDue === '₹0' ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {currentStats.rentDue}
                    </span>
                  </div>

                  <div className="flex flex-col items-center">
                    <span className="text-[9px] font-mono text-[#64748B] uppercase tracking-wider">Meters Due</span>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Zap className="w-2.5 h-2.5 text-cyan-400 fill-cyan-400" />
                      <span className="text-xs font-mono font-semibold text-cyan-400">{currentStats.unreadMeters}</span>
                    </div>
                  </div>
                </div>
              </header>

              {/* 2. Full-Height Scrollable Grid Deck */}
              <main className="flex-1 w-full min-h-0 overflow-y-auto overscroll-contain px-4 pt-3 pb-[max(24px,env(safe-area-inset-bottom,24px))] deck-scrollbar">
                <div id="units-grid-container" className="grid grid-cols-2 gap-2.5 pb-6">
                  {displayedUnits.map((unit) => {
                    if (!unit.isOccupied) {
                      // Vacant Unit Card Design
                      return (
                        <div
                          key={unit.id}
                          className="relative p-3 rounded-2xl border border-dashed border-white/20 bg-white/[0.015] hover:bg-white/[0.03] hover:border-white/30 transition-all duration-150 flex flex-col items-center justify-center text-center min-h-[126px] cursor-pointer active:scale-[0.97]"
                        >
                          <span className="text-xs font-mono font-bold text-[#94A3B8] tracking-wide mb-1">
                            {unit.name}
                          </span>
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-[#64748B]">
                            <Plus className="w-3.5 h-3.5" /> Vacant
                          </span>
                          <span className="mt-2 text-[10px] font-mono text-[#CBD5E1] bg-white/[0.05] border border-white/[0.08] px-2 py-1 rounded-lg">
                            Assign Tenant
                          </span>
                        </div>
                      );
                    }

                    // Occupied Unit Card Design (Flagship Luxury Aesthetic)
                    return (
                      <div
                        key={unit.id}
                        onClick={() => handleUnitClick(unit)}
                        className="group relative p-3 rounded-2xl bg-[#0D1117] border border-white/[0.08] hover:border-[#D4AF37]/40 active:scale-[0.97] transition-all duration-150 cursor-pointer shadow-[0_4px_16px_rgba(0,0,0,0.5)] flex flex-col justify-between min-h-[126px]"
                      >
                        {/* Top specular highlight edge */}
                        <div className="absolute inset-x-3 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.12] to-transparent pointer-events-none" />

                        <div>
                          {/* Top Row: Unit Tag + Occupied Indicator */}
                          <div className="flex items-center justify-between">
                            <span className="font-mono font-bold text-[#EDEDED] text-sm tracking-tight">
                              {unit.name}
                            </span>
                            <span className="flex items-center gap-1 text-[9px] font-mono text-emerald-400">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34D399] animate-pulse" />
                            </span>
                          </div>

                          {/* Tenant Name */}
                          <p className="text-xs font-medium text-[#D4AF37]/90 truncate mt-1 tracking-tight">
                            {unit.tenantName}
                          </p>
                        </div>

                        {/* Bottom Status Pills */}
                        <div className="mt-2.5 flex flex-col gap-1.5">
                          {/* Rent Status Pill */}
                          <div className="flex items-center justify-between">
                            {unit.rentDueAmount === 0 ? (
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                                Paid
                              </span>
                            ) : (
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-400 border border-amber-500/30 font-semibold">
                                Due: ₹{unit.rentDueAmount.toLocaleString('en-IN')}
                              </span>
                            )}
                          </div>

                          {/* Meter Reading Pill */}
                          <div className="flex items-center">
                            {unit.isReadingPending ? (
                              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-md bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-medium flex items-center gap-1 w-full justify-center">
                                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#22D3EE] animate-pulse" />
                                ⚡ Needs Reading
                              </span>
                            ) : (
                              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-md bg-white/[0.04] text-[#94A3B8] border border-white/[0.07] flex items-center gap-1 w-full justify-center">
                                <span>⚡</span> {unit.lastReading} kWh
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </main>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ================= SUB-METER READING TWIN-GAUGE DRAWER ================= */}
        <AnimatePresence>
          {selectedUnit && (
            <>
              {/* Backdrop: bg-black/70 backdrop-blur-md with tap-to-dismiss */}
              <motion.div
                key="drawer-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={handleCloseDrawer}
                className="absolute inset-0 bg-black/70 backdrop-blur-md z-40 cursor-pointer"
              />

              {/* Sheet Container: Slide-up bottom sheet */}
              <motion.div
                key="drawer-sheet"
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 28, stiffness: 320 }}
                className="absolute bottom-0 inset-x-0 bg-[#0A0D14] border-t border-white/[0.12] rounded-t-[32px] p-5 pb-[max(24px,env(safe-area-inset-bottom,24px))] shadow-[0_-20px_50px_rgba(0,0,0,0.9)] z-50 gpu-layer flex flex-col select-none max-h-[85vh] overflow-y-auto deck-scrollbar"
              >
                {/* Top handle */}
                <div className="w-10 h-1 rounded-full bg-white/20 mb-4 mx-auto shrink-0" />

                {/* Top Bar inside Sheet */}
                <div className="flex items-center justify-between pb-3.5 border-b border-white/[0.07]">
                  <div className="flex items-center gap-2.5">
                    <span className="px-2.5 py-1 rounded-xl bg-white/[0.06] border border-white/[0.1] font-mono font-bold text-sm text-[#EDEDED]">
                      {selectedUnit.name}
                    </span>
                    <div>
                      <h3 className="text-sm font-semibold text-[#EDEDED] leading-tight">
                        {selectedUnit.tenantName}
                      </h3>
                      <span className="text-[10px] font-mono text-[#94A3B8]">
                        Sub-Meter Reading // {selectedUnit.type === 'room' ? 'Room Rate ₹9/u' : 'Shop Rate ₹11/u'}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleCloseDrawer}
                    aria-label="Close drawer"
                    className="p-1.5 rounded-full bg-white/[0.05] hover:bg-white/[0.1] text-[#94A3B8] hover:text-white transition-colors cursor-pointer border border-white/[0.08]"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* THE TWIN-GAUGE READING HUD */}
                <div className="grid grid-cols-2 gap-3 mt-4">
                  {/* Left Gauge (Previous Reading - Locked) */}
                  <div className="bg-[#06080C] border border-white/[0.06] rounded-2xl p-3.5 flex flex-col justify-between">
                    <span className="text-[9px] font-mono text-[#64748B] uppercase tracking-wider font-semibold">
                      PREVIOUS (LOCKED)
                    </span>
                    <div className="mt-2 flex items-baseline gap-1">
                      <span className="text-2xl font-mono font-bold text-[#CBD5E1]">
                        {selectedUnit.lastReading}
                      </span>
                      <span className="text-xs font-mono text-[#64748B]">kWh</span>
                    </div>
                  </div>

                  {/* Right Gauge (Current Reading - Active Input) */}
                  <div
                    className={`bg-white/[0.04] border rounded-2xl p-3.5 flex flex-col justify-between transition-colors duration-150 ${
                      isLowerThanPrev
                        ? 'border-rose-500/80 shadow-[0_0_15px_rgba(244,63,94,0.25)]'
                        : 'border-[#D4AF37]/50 shadow-[0_0_15px_rgba(212,175,55,0.15)]'
                    }`}
                  >
                    <span className="text-[9px] font-mono text-[#D4AF37] uppercase tracking-wider font-semibold">
                      CURRENT READING
                    </span>
                    <div className="mt-2 flex items-baseline gap-1">
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        autoFocus
                        value={currentReadingInput}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^0-9]/g, '');
                          setCurrentReadingInput(val);
                        }}
                        placeholder={`${selectedUnit.lastReading + 10}`}
                        className="w-full bg-transparent text-2xl font-mono font-bold text-[#EDEDED] focus:outline-none placeholder:text-white/20"
                      />
                      <span className="text-xs font-mono text-[#D4AF37]/80">kWh</span>
                    </div>
                  </div>
                </div>

                {/* REAL-TIME LIVE MATH ENGINE */}
                <div className="mt-3.5">
                  {isLowerThanPrev ? (
                    <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-rose-950/40 border border-rose-500/50 text-rose-300 text-xs font-mono animate-shake">
                      <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                      <span>⚠️ Reading cannot be lower than previous</span>
                    </div>
                  ) : isInputValid && currentReadingNum !== null ? (
                    <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-cyan-950/20 border border-cyan-500/30 text-xs font-mono shadow-[0_0_15px_rgba(34,211,238,0.12)]">
                      <div className="flex items-center gap-1.5 text-cyan-300">
                        <Zap className="w-3.5 h-3.5 text-cyan-400 fill-cyan-400" />
                        <span>Δ Consumed: <strong className="text-white font-bold">{unitsConsumed}</strong> kWh</span>
                      </div>
                      <div className="text-right text-[#EDEDED]">
                        <span className="text-[#94A3B8]">× ₹{tariffRate} = </span>
                        <strong className="text-[#D4AF37] text-sm font-bold">₹{electricityDue.toLocaleString('en-IN')}</strong>
                      </div>
                    </div>
                  ) : (
                    <div className="px-3.5 py-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05] text-center text-xs font-mono text-[#64748B]">
                      Enter current meter numbers above to calculate dues
                    </div>
                  )}
                </div>

                {/* EVIDENCE CAPTURE & SAVE ACTION */}
                <div className="mt-4 flex items-center justify-between gap-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.08] text-xs font-mono text-[#CBD5E1] flex items-center justify-center gap-2 cursor-pointer transition-colors active:scale-98"
                  >
                    <Camera className="w-4 h-4 text-[#D4AF37]" />
                    <span>{meterPhotoUrl ? 'Photo Attached (Replace)' : 'Capture Meter Photo'}</span>
                  </button>

                  {meterPhotoUrl && (
                    <div className="relative group shrink-0">
                      <img
                        src={meterPhotoUrl}
                        alt="Meter proof"
                        className="w-10 h-10 rounded-xl object-cover border border-[#D4AF37]/50 shadow-md"
                      />
                      <button
                        type="button"
                        onClick={() => setMeterPhotoUrl(null)}
                        className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-rose-600 text-white flex items-center justify-center text-[10px] font-bold"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>

                {/* Action Buttons (Bottom) */}
                <div className="grid grid-cols-2 gap-3 mt-4 pt-1">
                  <button
                    type="button"
                    onClick={handleCloseDrawer}
                    className="py-3 px-4 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-[#94A3B8] hover:text-white text-xs font-mono font-semibold cursor-pointer active:scale-98 transition-all duration-100 text-center"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    disabled={!canSave}
                    onClick={handleSaveReading}
                    className={`py-3 px-4 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all duration-150 cursor-pointer shadow-lg active:scale-98 ${
                      canSave
                        ? 'bg-[#D4AF37] hover:bg-[#E5C158] text-[#06080C] border border-[#FFF4C2]/40 shadow-[0_0_20px_rgba(212,175,55,0.3)]'
                        : 'bg-white/[0.04] text-[#64748B] border border-white/[0.06] cursor-not-allowed opacity-50'
                    }`}
                  >
                    <Check className="w-4 h-4" />
                    <span>Confirm & Log</span>
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
