'use client';

import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Delete, ShieldCheck, Lock, Sparkles, Check, ChevronRight, AlertOctagon, Zap, Plus, Store, X, Camera, AlertTriangle, Wallet, MessageCircle, MessageSquare, ArrowRight, CheckCircle2, Share2, Car, Bike, Clock, Search, Building2 } from 'lucide-react';

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

export interface ParkedVehicle {
  id: string;
  vehicleNumber: string;
  type: 'bike' | 'car';
  entryTimestamp: number;
  entryTimeFormatted: string;
}

const PARKING_CAPACITY = {
  bike: 30,
  car: 10,
};

function calculateParkingFare(type: 'bike' | 'car', durationMinutes: number) {
  const baseMinutes = 120;
  if (type === 'bike') {
    const baseFare = 20;
    const hourlyRate = 10;
    if (durationMinutes <= baseMinutes) {
      return { fare: baseFare, baseHours: 2, rateDescription: 'Base: ₹20 (पहला 2 घंटा)' };
    }
    const extraMinutes = durationMinutes - baseMinutes;
    const extraHours = Math.ceil(extraMinutes / 60);
    return {
      fare: baseFare + extraHours * hourlyRate,
      baseHours: 2,
      rateDescription: `Base ₹20 (2hr) + ₹${extraHours * hourlyRate} (${extraHours} घंटा @ ₹10)`,
    };
  } else {
    const baseFare = 40;
    const hourlyRate = 20;
    if (durationMinutes <= baseMinutes) {
      return { fare: baseFare, baseHours: 2, rateDescription: 'Base: ₹40 (पहला 2 घंटा)' };
    }
    const extraMinutes = durationMinutes - baseMinutes;
    const extraHours = Math.ceil(extraMinutes / 60);
    return {
      fare: baseFare + extraHours * hourlyRate,
      baseHours: 2,
      rateDescription: `Base ₹40 (2hr) + ₹${extraHours * hourlyRate} (${extraHours} घंटा @ ₹20)`,
    };
  }
}

function formatDurationHindi(minutes: number): string {
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hrs === 0) return `${mins} मिनट`;
  if (mins === 0) return `${hrs} घंटा`;
  return `${hrs} घंटा ${mins} मिनट`;
}

const INITIAL_PARKED_VEHICLES: ParkedVehicle[] = [
  { id: 'pv-01', vehicleNumber: 'UK 06 AB 1912', type: 'car', entryTimestamp: Date.now() - 145 * 60000, entryTimeFormatted: '02:45 PM' },
  { id: 'pv-02', vehicleNumber: 'UK 06 CD 4589', type: 'car', entryTimestamp: Date.now() - 110 * 60000, entryTimeFormatted: '03:20 PM' },
  { id: 'pv-03', vehicleNumber: 'DL 01 AX 7721', type: 'car', entryTimestamp: Date.now() - 75 * 60000, entryTimeFormatted: '03:55 PM' },
  { id: 'pv-04', vehicleNumber: 'UP 25 BE 3390', type: 'car', entryTimestamp: Date.now() - 50 * 60000, entryTimeFormatted: '04:20 PM' },
  { id: 'pv-05', vehicleNumber: 'UK 04 F 9012', type: 'car', entryTimestamp: Date.now() - 35 * 60000, entryTimeFormatted: '04:35 PM' },
  { id: 'pv-06', vehicleNumber: 'HR 26 DQ 1104', type: 'car', entryTimestamp: Date.now() - 15 * 60000, entryTimeFormatted: '04:55 PM' },

  { id: 'pv-07', vehicleNumber: 'UK 06 M 1289', type: 'bike', entryTimestamp: Date.now() - 180 * 60000, entryTimeFormatted: '02:10 PM' },
  { id: 'pv-08', vehicleNumber: 'UK 06 K 8820', type: 'bike', entryTimestamp: Date.now() - 160 * 60000, entryTimeFormatted: '02:30 PM' },
  { id: 'pv-09', vehicleNumber: 'UK 06 Q 3411', type: 'bike', entryTimestamp: Date.now() - 135 * 60000, entryTimeFormatted: '02:55 PM' },
  { id: 'pv-10', vehicleNumber: 'UK 06 J 5678', type: 'bike', entryTimestamp: Date.now() - 120 * 60000, entryTimeFormatted: '03:10 PM' },
  { id: 'pv-11', vehicleNumber: 'UP 22 R 9912', type: 'bike', entryTimestamp: Date.now() - 105 * 60000, entryTimeFormatted: '03:25 PM' },
  { id: 'pv-12', vehicleNumber: 'UK 06 L 4120', type: 'bike', entryTimestamp: Date.now() - 95 * 60000, entryTimeFormatted: '03:35 PM' },
  { id: 'pv-13', vehicleNumber: 'UK 06 H 2234', type: 'bike', entryTimestamp: Date.now() - 85 * 60000, entryTimeFormatted: '03:45 PM' },
  { id: 'pv-14', vehicleNumber: 'UK 06 N 7781', type: 'bike', entryTimestamp: Date.now() - 70 * 60000, entryTimeFormatted: '04:00 PM' },
  { id: 'pv-15', vehicleNumber: 'UK 06 P 1904', type: 'bike', entryTimestamp: Date.now() - 65 * 60000, entryTimeFormatted: '04:05 PM' },
  { id: 'pv-16', vehicleNumber: 'UP 21 Z 6652', type: 'bike', entryTimestamp: Date.now() - 55 * 60000, entryTimeFormatted: '04:15 PM' },
  { id: 'pv-17', vehicleNumber: 'UK 06 G 3310', type: 'bike', entryTimestamp: Date.now() - 48 * 60000, entryTimeFormatted: '04:22 PM' },
  { id: 'pv-18', vehicleNumber: 'UK 06 S 8890', type: 'bike', entryTimestamp: Date.now() - 40 * 60000, entryTimeFormatted: '04:30 PM' },
  { id: 'pv-19', vehicleNumber: 'UK 06 T 1209', type: 'bike', entryTimestamp: Date.now() - 32 * 60000, entryTimeFormatted: '04:38 PM' },
  { id: 'pv-20', vehicleNumber: 'UK 04 D 7715', type: 'bike', entryTimestamp: Date.now() - 25 * 60000, entryTimeFormatted: '04:45 PM' },
  { id: 'pv-21', vehicleNumber: 'UK 06 W 4429', type: 'bike', entryTimestamp: Date.now() - 20 * 60000, entryTimeFormatted: '04:50 PM' },
  { id: 'pv-22', vehicleNumber: 'UK 06 B 8802', type: 'bike', entryTimestamp: Date.now() - 14 * 60000, entryTimeFormatted: '04:56 PM' },
  { id: 'pv-23', vehicleNumber: 'UK 06 E 5519', type: 'bike', entryTimestamp: Date.now() - 8 * 60000, entryTimeFormatted: '05:02 PM' },
  { id: 'pv-24', vehicleNumber: 'UK 06 X 3108', type: 'bike', entryTimestamp: Date.now() - 3 * 60000, entryTimeFormatted: '05:07 PM' },
];

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

  // Sub-Meter Reading & Dual-Wallet Drawer state
  const [selectedUnit, setSelectedUnit] = useState<UnitItem | null>(null);
  const [drawerTab, setDrawerTab] = useState<'meter' | 'payment'>('meter');
  const [currentReadingInput, setCurrentReadingInput] = useState<string>('');
  const [meterPhotoUrl, setMeterPhotoUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // ================= COMMERCIAL PARKING GATE STATE =================
  const [activeModule, setActiveModule] = useState<'units' | 'parking'>('units');
  const [parkedVehicles, setParkedVehicles] = useState<ParkedVehicle[]>(INITIAL_PARKED_VEHICLES);
  const [shiftParkingCash, setShiftParkingCash] = useState<number>(1640);
  const [entryVehicleType, setEntryVehicleType] = useState<'bike' | 'car'>('bike');
  const [vehicleNumberInput, setVehicleNumberInput] = useState<string>('');
  const [parkingSearchQuery, setParkingSearchQuery] = useState<string>('');
  const [currentTimeTick, setCurrentTimeTick] = useState<number>(Date.now());
  const [selectedVehicleForExit, setSelectedVehicleForExit] = useState<ParkedVehicle | null>(null);

  interface EntrySlipPayload {
    vehicleNumber: string;
    typeText: string;
    timeText: string;
    dateText: string;
    whatsappUrl: string;
    smsUrl: string;
    rawText: string;
  }
  const [activeEntrySlip, setActiveEntrySlip] = useState<EntrySlipPayload | null>(null);

  interface ExitReceiptPayload {
    vehicleNumber: string;
    typeText: string;
    inTime: string;
    outTime: string;
    durationText: string;
    fare: number;
    dateText: string;
    whatsappUrl: string;
    smsUrl: string;
    rawText: string;
  }
  const [activeExitReceipt, setActiveExitReceipt] = useState<ExitReceiptPayload | null>(null);

  // Periodic timer to keep parking duration counters updated live
  useEffect(() => {
    const timer = setInterval(() => setCurrentTimeTick(Date.now()), 30000);
    return () => clearInterval(timer);
  }, []);

  const bikeCount = useMemo(() => parkedVehicles.filter((v) => v.type === 'bike').length, [parkedVehicles]);
  const carCount = useMemo(() => parkedVehicles.filter((v) => v.type === 'car').length, [parkedVehicles]);
  const isBikeFull = bikeCount >= PARKING_CAPACITY.bike;
  const isCarFull = carCount >= PARKING_CAPACITY.car;
  const isCurrentCategoryFull = entryVehicleType === 'bike' ? isBikeFull : isCarFull;

  const filteredParkedVehicles = useMemo(() => {
    if (!parkingSearchQuery.trim()) return parkedVehicles;
    const q = parkingSearchQuery.trim().toUpperCase();
    return parkedVehicles.filter((v) => v.vehicleNumber.toUpperCase().includes(q));
  }, [parkedVehicles, parkingSearchQuery]);

  const handleCheckInVehicle = () => {
    const trimmed = vehicleNumberInput.trim().toUpperCase();
    if (!trimmed || trimmed.length < 3) return;
    if (entryVehicleType === 'bike' && isBikeFull) return;
    if (entryVehicleType === 'car' && isCarFull) return;

    const now = new Date();
    const timeFormatted = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    const dateText = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;
    const typeText = entryVehicleType === 'bike' ? 'बाइक' : 'कार';

    const newVehicle: ParkedVehicle = {
      id: `pv-${Date.now()}`,
      vehicleNumber: trimmed,
      type: entryVehicleType,
      entryTimestamp: now.getTime(),
      entryTimeFormatted: timeFormatted,
    };

    setParkedVehicles((prev) => [newVehicle, ...prev]);
    setVehicleNumberInput('');

    const slipText = `श्री बालाजी पार्किंग (रुद्रपुर)
प्रवेश पर्ची (Entry Slip)
वाहन: [${trimmed}] (${typeText})
समय: [${timeFormatted} | ${dateText}]
कृपया पर्ची सुरक्षित रखें।`;

    const encoded = encodeURIComponent(slipText);
    const whatsappUrl = `https://wa.me/?text=${encoded}`;
    const smsUrl = `sms:?body=${encoded}`;

    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([18, 30, 24]);
    }

    setActiveEntrySlip({
      vehicleNumber: trimmed,
      typeText,
      timeText: timeFormatted,
      dateText,
      whatsappUrl,
      smsUrl,
      rawText: slipText,
    });
  };

  const handleExitVehicle = () => {
    if (!selectedVehicleForExit) return;

    const now = new Date();
    const outTimeFormatted = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    const dateText = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;
    const typeText = selectedVehicleForExit.type === 'bike' ? 'बाइक' : 'कार';

    const durationMs = Math.max(0, now.getTime() - selectedVehicleForExit.entryTimestamp);
    const durationMinutes = Math.max(1, Math.floor(durationMs / 60000));
    const durationText = formatDurationHindi(durationMinutes);
    const { fare } = calculateParkingFare(selectedVehicleForExit.type, durationMinutes);

    setParkedVehicles((prev) => prev.filter((v) => v.id !== selectedVehicleForExit.id));
    setShiftParkingCash((prev) => prev + fare);

    const receiptText = `श्री बालाजी पार्किंग (रुद्रपुर)
निकास रसीद (Exit Receipt)
वाहन: [${selectedVehicleForExit.vehicleNumber}] (${typeText})
प्रवेश: [${selectedVehicleForExit.entryTimeFormatted}] | निकास: [${outTimeFormatted}]
कुल समय: [${durationText}]
--------------------------------
पार्किंग शुल्क: ₹${fare}
स्थिति: भुगतान सफल (नकद)
धन्यवाद। फिर पधारें।`;

    const encoded = encodeURIComponent(receiptText);
    const whatsappUrl = `https://wa.me/?text=${encoded}`;
    const smsUrl = `sms:?body=${encoded}`;

    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([18, 30, 24]);
    }

    setActiveExitReceipt({
      vehicleNumber: selectedVehicleForExit.vehicleNumber,
      typeText,
      inTime: selectedVehicleForExit.entryTimeFormatted,
      outTime: outTimeFormatted,
      durationText,
      fare,
      dateText,
      whatsappUrl,
      smsUrl,
      rawText: receiptText,
    });
    setSelectedVehicleForExit(null);
  };


  // Dual-Wallet Cash Split state
  const [rentPaidInput, setRentPaidInput] = useState<string>('');
  const [elecPaidInput, setElecPaidInput] = useState<string>('');
  interface ReceiptPayload {
    unitName: string;
    tenantName: string;
    dateStr: string;
    rentPaid: number;
    remainingRent: number;
    elecPaid: number;
    unitsConsumed: number;
    prevReading: number;
    currReading: number | null;
    totalCash: number;
    whatsappUrl: string;
    smsUrl: string;
    rawText: string;
  }
  const [receiptData, setReceiptData] = useState<ReceiptPayload | null>(null);

  // Live Math Engine Calculations
  const tariffRate = selectedUnit ? (selectedUnit.type === 'room' ? 9.0 : 11.0) : 9.0;
  const currentReadingNum = currentReadingInput.trim() !== '' ? parseInt(currentReadingInput, 10) : null;
  const isInputValid = currentReadingNum !== null && !isNaN(currentReadingNum);
  const isLowerThanPrev = isInputValid && selectedUnit ? currentReadingNum < selectedUnit.lastReading : false;
  const unitsConsumed = isInputValid && selectedUnit && !isLowerThanPrev ? currentReadingNum - selectedUnit.lastReading : 0;
  const electricityDue = unitsConsumed * tariffRate;
  const canSaveReading = isInputValid && selectedUnit && !isLowerThanPrev;

  // Rent & Arrears Calculations
  const effectiveRentDue = selectedUnit ? (selectedUnit.rentDueAmount > 0 ? selectedUnit.rentDueAmount : selectedUnit.rentAmount) : 0;
  const rentPaidNum = rentPaidInput.trim() !== '' ? parseInt(rentPaidInput, 10) || 0 : 0;
  const elecPaidNum = elecPaidInput.trim() !== '' ? parseInt(elecPaidInput, 10) || 0 : 0;
  const remainingRentDue = Math.max(0, effectiveRentDue - rentPaidNum);
  const totalCashCollected = rentPaidNum + elecPaidNum;

  const handleUnitClick = (unit: UnitItem) => {
    if (!unit.isOccupied) return;
    setSelectedUnit(unit);
    // Prioritize meter reading if pending, else payment
    setDrawerTab(unit.isReadingPending ? 'meter' : 'payment');
    setCurrentReadingInput('');
    setMeterPhotoUrl(null);
    setReceiptData(null);
    const rentDue = unit.rentDueAmount > 0 ? unit.rentDueAmount : unit.rentAmount;
    setRentPaidInput(String(rentDue));
    setElecPaidInput('0');
  };

  const handleCloseDrawer = () => {
    setSelectedUnit(null);
    setCurrentReadingInput('');
    setMeterPhotoUrl(null);
    setReceiptData(null);
    setRentPaidInput('');
    setElecPaidInput('');
    setDrawerTab('meter');
  };

  const handleSaveReadingOnly = () => {
    if (!canSaveReading || !selectedUnit || currentReadingNum === null) return;
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

  const handleProceedToPayment = () => {
    if (electricityDue > 0) {
      setElecPaidInput(String(electricityDue));
    }
    setDrawerTab('payment');
  };

  const handleRecordPayment = () => {
    if (!selectedUnit || totalCashCollected <= 0) return;

    const prevReading = selectedUnit.lastReading;
    const currentNum = canSaveReading && currentReadingNum !== null ? currentReadingNum : null;
    const hasValidReading = currentNum !== null && currentNum >= prevReading;

    // 1. Immediately update unit state
    const newLastReading = hasValidReading && currentNum !== null ? currentNum : prevReading;
    setUnits((prev) =>
      prev.map((u) => {
        if (u.id !== selectedUnit.id) return u;
        return {
          ...u,
          rentDueAmount: remainingRentDue,
          lastReading: newLastReading,
          isReadingPending: elecPaidNum > 0 || hasValidReading ? false : u.isReadingPending,
        };
      })
    );

    // 2. Prepare receipt details with correct delta
    const today = new Date();
    const dateStr = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;

    let elecLine = '';
    if (hasValidReading && currentNum !== null) {
      const unitsDiff = currentNum - prevReading;
      elecLine = `बिजली बिल जमा: ₹${elecPaidNum.toLocaleString('en-IN')} (रीडिंग: ${prevReading} से ${currentNum} | ${unitsDiff} यूनिट)`;
    } else {
      elecLine = `बिजली बिल जमा: ₹${elecPaidNum.toLocaleString('en-IN')}`;
    }

    const receiptText = `श्री बालाजी एस्टेट (ट्रांजिट कैंप, रुद्रपुर)
किराया व बिजली रसीद

यूनिट: ${selectedUnit.name} (${selectedUnit.tenantName || 'किरायेदार'})
तारीख: ${dateStr}
--------------------------------
किराया जमा: ₹${rentPaidNum.toLocaleString('en-IN')} (बकाया: ₹${remainingRentDue.toLocaleString('en-IN')})
${elecLine}
--------------------------------
कुल प्राप्त नकद: ₹${totalCashCollected.toLocaleString('en-IN')}
भुगतान स्थिति: दर्ज (सफल)

धन्यवाद।`;

    const encodedReceipt = encodeURIComponent(receiptText);
    const whatsappUrl = `https://wa.me/?text=${encodedReceipt}`;
    const smsUrl = `sms:?body=${encodedReceipt}`;

    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([18, 30, 24]);
    }

    setReceiptData({
      unitName: selectedUnit.name,
      tenantName: selectedUnit.tenantName || '',
      dateStr,
      rentPaid: rentPaidNum,
      remainingRent: remainingRentDue,
      elecPaid: elecPaidNum,
      unitsConsumed,
      prevReading: selectedUnit.lastReading,
      currReading: currentReadingNum,
      totalCash: totalCashCollected,
      whatsappUrl,
      smsUrl,
      rawText: receiptText,
    });
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
              {activeModule === 'units' ? (
                <>
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
                </>
              ) : (
                <>
                  {/* ================= COMMERCIAL PARKING GATE MODULE ================= */}
                  {/* 1. Pinned Parking Gate Header */}
                  <header className="shrink-0 w-full z-20 px-5 pt-[max(12px,env(safe-area-inset-top,12px))] pb-3 border-b border-white/[0.06] bg-[#06080C]/95 backdrop-blur-xl">
                    <div className="flex items-center justify-between">
                      {/* Left: Monogram & Title */}
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#0D1117] border border-cyan-500/40 flex items-center justify-center text-cyan-400 font-bold text-xs shadow-[0_2px_10px_rgba(6,182,212,0.2)]">
                          <Car className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h2 className="text-sm font-semibold text-[#EDEDED] tracking-tight">Shree Balaji Parking</h2>
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34D399] animate-pulse" />
                          </div>
                          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-medium text-cyan-400/90 tracking-wide uppercase">
                            Field Gate Terminal // {userRole === 'owner' ? 'Owner Telemetry' : 'Shift Active'}
                          </span>
                        </div>
                      </div>

                      {/* Right: Lock button */}
                      <button
                        onClick={handleLockTerminal}
                        aria-label="Lock terminal"
                        className="p-2.5 rounded-xl bg-[#0D1117] border border-white/[0.08] text-[#94A3B8] hover:text-white active:scale-95 transition-all duration-100 cursor-pointer shadow-sm hover:border-[#D4AF37]/30"
                        title="Lock Terminal"
                      >
                        <Lock className="w-4 h-4" />
                      </button>
                    </div>

                    {/* LIVE OCCUPANCY TELEMETRY HUD */}
                    <div className="mt-3 grid grid-cols-3 gap-1.5">
                      {/* 2-Wheeler Chip */}
                      <div className={`py-1.5 px-2 rounded-xl flex flex-col items-center justify-center border font-mono transition-colors ${
                        isBikeFull
                          ? 'bg-rose-950/60 border-rose-500/60 text-rose-300 animate-pulse'
                          : 'bg-white/[0.03] border-white/[0.08] text-[#CBD5E1]'
                      }`}>
                        <div className="flex items-center gap-1 text-[9px] text-[#94A3B8] uppercase">
                          <Bike className="w-3 h-3 text-cyan-400" />
                          <span>2-W (Bike)</span>
                        </div>
                        <span className={`text-xs font-bold mt-0.5 ${isBikeFull ? 'text-rose-400' : 'text-cyan-300'}`}>
                          {isBikeFull ? 'FULL (30)' : `${bikeCount} / 30`}
                        </span>
                      </div>

                      {/* 4-Wheeler Chip */}
                      <div className={`py-1.5 px-2 rounded-xl flex flex-col items-center justify-center border font-mono transition-colors ${
                        isCarFull
                          ? 'bg-rose-950/60 border-rose-500/60 text-rose-300 animate-pulse'
                          : 'bg-white/[0.03] border-white/[0.08] text-[#CBD5E1]'
                      }`}>
                        <div className="flex items-center gap-1 text-[9px] text-[#94A3B8] uppercase">
                          <Car className="w-3 h-3 text-amber-400" />
                          <span>4-W (Car)</span>
                        </div>
                        <span className={`text-xs font-bold mt-0.5 ${isCarFull ? 'text-rose-400' : 'text-amber-300'}`}>
                          {isCarFull ? 'FULL (10)' : `${carCount} / 10`}
                        </span>
                      </div>

                      {/* Shift Cash Counter */}
                      <div className="py-1.5 px-2 rounded-xl bg-white/[0.03] border border-white/[0.08] flex flex-col items-center justify-center font-mono text-[#CBD5E1]">
                        <span className="text-[9px] text-[#94A3B8] uppercase">Shift Cash</span>
                        <span className="text-xs font-bold text-emerald-400 mt-0.5">
                          ₹{shiftParkingCash.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  </header>

                  {/* 2. Scrollable Parking Main */}
                  <main className="flex-1 w-full min-h-0 overflow-y-auto overscroll-contain px-4 pt-3 pb-4 deck-scrollbar flex flex-col gap-3.5">
                    {/* FAST VEHICLE ENTRY FLOW (GATE-IN) */}
                    <div className="p-3.5 rounded-2xl bg-[#0A0D14] border border-white/[0.08] shadow-lg flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-[#EDEDED] uppercase tracking-wider flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#22D3EE]" />
                          फास्ट वाहन प्रवेश (Fast Entry)
                        </span>
                        <span className="text-[10px] font-mono text-[#94A3B8]">
                          {entryVehicleType === 'bike' ? '₹20 (2hr), +₹10/hr' : '₹40 (2hr), +₹20/hr'}
                        </span>
                      </div>

                      {/* Vehicle Category Selector */}
                      <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                        <button
                          type="button"
                          onClick={() => setEntryVehicleType('bike')}
                          className={`py-2 px-3 rounded-lg text-xs font-mono font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                            entryVehicleType === 'bike'
                              ? 'bg-cyan-950/60 text-cyan-200 border border-cyan-500/50 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                              : 'text-[#94A3B8] hover:text-white border border-transparent'
                          }`}
                        >
                          <Bike className="w-3.5 h-3.5" />
                          <span>🛵 2-W बाइक</span>
                          {isBikeFull && <span className="text-[9px] text-rose-400 font-bold ml-1">[FULL]</span>}
                        </button>

                        <button
                          type="button"
                          onClick={() => setEntryVehicleType('car')}
                          className={`py-2 px-3 rounded-lg text-xs font-mono font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                            entryVehicleType === 'car'
                              ? 'bg-amber-950/60 text-amber-200 border border-amber-500/50 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                              : 'text-[#94A3B8] hover:text-white border border-transparent'
                          }`}
                        >
                          <Car className="w-3.5 h-3.5" />
                          <span>🚗 4-W कार</span>
                          {isCarFull && <span className="text-[9px] text-rose-400 font-bold ml-1">[FULL]</span>}
                        </button>
                      </div>

                      {/* Input & Check-in Button */}
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={vehicleNumberInput}
                            onChange={(e) => setVehicleNumberInput(e.target.value.toUpperCase())}
                            placeholder="UK 06 AB 1234"
                            className="flex-1 bg-white/[0.04] border border-white/[0.1] focus:border-cyan-500/70 rounded-xl px-3.5 py-2.5 font-mono text-sm font-bold text-[#EDEDED] uppercase tracking-wider focus:outline-none placeholder:text-white/20"
                          />
                          <button
                            type="button"
                            disabled={isCurrentCategoryFull || vehicleNumberInput.trim().length < 3}
                            onClick={handleCheckInVehicle}
                            className={`py-2.5 px-4 rounded-xl font-mono text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-md ${
                              !isCurrentCategoryFull && vehicleNumberInput.trim().length >= 3
                                ? 'bg-emerald-500 hover:bg-emerald-400 text-[#06080C] border border-emerald-300/40 shadow-[0_0_15px_rgba(16,185,129,0.3)] cursor-pointer'
                                : 'bg-white/[0.04] text-[#64748B] border border-white/[0.06] cursor-not-allowed opacity-50'
                            }`}
                          >
                            <Plus className="w-4 h-4" />
                            <span>पर्ची बनाएं</span>
                          </button>
                        </div>

                        {isCurrentCategoryFull && (
                          <p className="text-[11px] font-mono text-rose-400 flex items-center gap-1 pt-0.5">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>{entryVehicleType === 'bike' ? '2-Wheeler (बाइक)' : '4-Wheeler (कार)'} पार्किंग फुल है! प्रवेश बंद है।</span>
                          </p>
                        )}
                      </div>
                    </div>

                    {/* SEARCH BAR */}
                    <div className="relative w-full">
                      <Search className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        value={parkingSearchQuery}
                        onChange={(e) => setParkingSearchQuery(e.target.value)}
                        placeholder="वाहन नंबर से खोजें (Search number / digits)..."
                        className="w-full bg-white/[0.03] border border-white/[0.07] focus:border-[#D4AF37]/50 rounded-xl pl-9 pr-3.5 py-2 text-xs font-mono text-[#EDEDED] focus:outline-none placeholder:text-[#64748B]"
                      />
                      {parkingSearchQuery && (
                        <button
                          type="button"
                          onClick={() => setParkingSearchQuery('')}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#94A3B8] hover:text-white"
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    {/* ACTIVE PARKED VEHICLES LIST */}
                    <div className="flex flex-col gap-2 pb-4">
                      <div className="flex items-center justify-between px-1">
                        <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-[#94A3B8]">
                          सक्रिय पार्क वाहन ({filteredParkedVehicles.length})
                        </span>
                        <span className="text-[10px] font-mono text-[#64748B]">
                          निकास के लिए टैप करें
                        </span>
                      </div>

                      {filteredParkedVehicles.length === 0 ? (
                        <div className="p-8 text-center rounded-2xl bg-white/[0.02] border border-white/[0.05]">
                          <p className="text-xs font-mono text-[#64748B]">कोई वाहन पार्क नहीं मिला</p>
                        </div>
                      ) : (
                        filteredParkedVehicles.map((v) => {
                          const durationMinutes = Math.max(1, Math.floor((currentTimeTick - v.entryTimestamp) / 60000));
                          const durationStr = formatDurationHindi(durationMinutes);
                          const { fare } = calculateParkingFare(v.type, durationMinutes);

                          return (
                            <div
                              key={v.id}
                              onClick={() => setSelectedVehicleForExit(v)}
                              className="p-3 rounded-2xl bg-[#0A0D14] border border-white/[0.08] hover:border-white/[0.18] transition-all cursor-pointer flex items-center justify-between group active:scale-98 shadow-md"
                            >
                              <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                                  v.type === 'bike'
                                    ? 'bg-cyan-950/40 border border-cyan-500/30 text-cyan-300'
                                    : 'bg-amber-950/40 border border-amber-500/30 text-amber-300'
                                }`}>
                                  {v.type === 'bike' ? <Bike className="w-5 h-5" /> : <Car className="w-5 h-5" />}
                                </div>

                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-mono font-bold text-[#EDEDED] tracking-wider">
                                      {v.vehicleNumber}
                                    </span>
                                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-md bg-white/[0.05] border border-white/[0.08] text-[#94A3B8]">
                                      {v.type === 'bike' ? 'बाइक' : 'कार'}
                                    </span>
                                  </div>
                                  <div className="text-[10px] font-mono text-[#64748B] flex items-center gap-1 mt-0.5">
                                    <Clock className="w-3 h-3 text-[#64748B]" />
                                    <span>प्रवेश: {v.entryTimeFormatted}</span>
                                    <span className="text-white/20">•</span>
                                    <span className="text-emerald-400 font-semibold">₹{fare} देय</span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex flex-col items-end gap-1">
                                <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-cyan-950/40 border border-cyan-500/30 text-cyan-300 flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#22D3EE] animate-pulse" />
                                  {durationStr}
                                </span>
                                <span className="text-[10px] font-mono text-[#D4AF37] group-hover:underline flex items-center gap-0.5">
                                  निकास / Exit ➜
                                </span>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </main>
                </>
              )}

              {/* PINNED BOTTOM NAVIGATION DOCK (ESTATE UNITS & PARKING GATE) */}
              <div className="shrink-0 w-full z-30 px-4 py-2 border-t border-white/[0.08] bg-[#06080C]/95 backdrop-blur-xl flex items-center justify-around pb-[max(10px,env(safe-area-inset-bottom,10px))]">
                <button
                  type="button"
                  onClick={() => setActiveModule('units')}
                  className={`flex items-center gap-2 py-2 px-4 rounded-xl text-xs font-mono font-medium transition-all duration-200 cursor-pointer ${
                    activeModule === 'units'
                      ? 'bg-[#0D1117] text-[#EDEDED] border border-[#D4AF37]/50 shadow-[0_2px_12px_rgba(212,175,55,0.2)]'
                      : 'text-[#94A3B8] hover:text-white border border-transparent'
                  }`}
                >
                  <Building2 className="w-4 h-4 text-[#D4AF37]" />
                  <span>Estate Units</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveModule('parking')}
                  className={`flex items-center gap-2 py-2 px-4 rounded-xl text-xs font-mono font-medium transition-all duration-200 cursor-pointer ${
                    activeModule === 'parking'
                      ? 'bg-[#0D1117] text-[#EDEDED] border border-cyan-500/50 shadow-[0_2px_12px_rgba(6,182,212,0.2)]'
                      : 'text-[#94A3B8] hover:text-white border border-transparent'
                  }`}
                >
                  <Car className="w-4 h-4 text-cyan-400" />
                  <span>Parking Gate</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[10px] font-bold">
                    {parkedVehicles.length}
                  </span>
                </button>
              </div></motion.div>
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
                <div className="w-10 h-1 rounded-full bg-white/20 mb-3 mx-auto shrink-0" />

                {/* Top Bar inside Sheet */}
                <div className="flex items-center justify-between pb-3 border-b border-white/[0.07]">
                  <div className="flex items-center gap-2.5">
                    <span className="px-2.5 py-1 rounded-xl bg-white/[0.06] border border-white/[0.1] font-mono font-bold text-sm text-[#EDEDED]">
                      {selectedUnit.name}
                    </span>
                    <div>
                      <h3 className="text-sm font-semibold text-[#EDEDED] leading-tight">
                        {selectedUnit.tenantName}
                      </h3>
                      <span className="text-[10px] font-mono text-[#94A3B8]">
                        {selectedUnit.type === 'room' ? 'Room Rate ₹9/u' : 'Shop Rate ₹11/u'} // {selectedUnit.rentDueAmount > 0 ? `Due: ₹${selectedUnit.rentDueAmount.toLocaleString('en-IN')}` : 'Paid'}
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

                {/* ================= VIEW A: OPTIONAL HINDI RECEIPT MODAL ================= */}
                {receiptData ? (
                  <div className="flex flex-col py-2">
                    {/* Success Header */}
                    <div className="flex items-center gap-2.5 pb-3 border-b border-white/[0.08]">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-[#EDEDED] flex items-center gap-2">
                          <span>भुगतान सफलतापूर्वक दर्ज!</span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 font-normal">
                            Recorded
                          </span>
                        </h3>
                        <p className="text-[11px] font-mono text-[#94A3B8]">
                          कुल नकद: ₹{receiptData.totalCash.toLocaleString('en-IN')} // {receiptData.unitName} ({receiptData.tenantName})
                        </p>
                      </div>
                    </div>

                    {/* Receipt Preview Card */}
                    <div className="mt-3.5 p-3.5 rounded-2xl bg-[#06080C] border border-white/[0.08] relative font-mono text-[11px] leading-relaxed text-[#CBD5E1] whitespace-pre-wrap select-text">
                      <div className="text-[10px] text-[#D4AF37] font-semibold mb-1.5 uppercase tracking-wider flex items-center justify-between border-b border-white/[0.06] pb-1">
                        <span>रसीद पूर्वावलोकन (Preview)</span>
                        <span className="text-[#64748B] font-normal">{receiptData.dateStr}</span>
                      </div>
                      {receiptData.rawText}
                    </div>

                    {/* Actions: Strictly Non-Blocking */}
                    <div className="mt-4 flex flex-col gap-2.5">
                      {/* Primary: Done / Skip (Instantly closes drawer with 1 tap) */}
                      <button
                        type="button"
                        onClick={handleCloseDrawer}
                        className="w-full py-3 px-4 rounded-xl bg-[#D4AF37] hover:bg-[#E5C158] text-[#06080C] font-mono font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(212,175,55,0.3)] active:scale-98 transition-all"
                      >
                        <Check className="w-4 h-4" />
                        <span>बाद में / Done (Skip)</span>
                      </button>

                      {/* Secondary & Tertiary Action Row: WhatsApp & SMS */}
                      <div className="grid grid-cols-2 gap-2.5">
                        <a
                          href={receiptData.whatsappUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => {
                            if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate([16]);
                          }}
                          className="py-2.5 px-3 rounded-xl bg-emerald-950/50 hover:bg-emerald-900/60 border border-emerald-500/40 text-emerald-300 font-mono font-semibold text-[11px] flex items-center justify-center gap-1.5 cursor-pointer active:scale-98 transition-all text-center"
                        >
                          <MessageCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span>🟢 WhatsApp रसीद</span>
                        </a>

                        <a
                          href={receiptData.smsUrl}
                          onClick={() => {
                            if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate([16]);
                          }}
                          className="py-2.5 px-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 text-slate-200 font-mono font-semibold text-[11px] flex items-center justify-center gap-1.5 cursor-pointer active:scale-98 transition-all text-center"
                        >
                          <MessageSquare className="w-4 h-4 text-cyan-300 shrink-0" />
                          <span>💬 SMS रसीद</span>
                        </a>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Segmented Mode Switcher: [ ⚡ Sub-Meter ] and [ 💰 Collect Payment ] */}
                    <div className="grid grid-cols-2 p-1 bg-black/50 border border-white/[0.08] rounded-xl mt-3.5">
                      <button
                        type="button"
                        onClick={() => setDrawerTab('meter')}
                        className={`py-2 px-3 rounded-lg text-xs font-mono font-medium flex items-center justify-center gap-1.5 transition-all duration-150 cursor-pointer ${
                          drawerTab === 'meter'
                            ? 'bg-white/[0.08] text-[#FFF4C2] border border-[#D4AF37]/40 shadow-sm'
                            : 'text-[#94A3B8] hover:text-white'
                        }`}
                      >
                        <Zap className={`w-3.5 h-3.5 ${drawerTab === 'meter' ? 'text-[#D4AF37]' : 'text-[#64748B]'}`} />
                        <span>⚡ Sub-Meter</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setDrawerTab('payment')}
                        className={`py-2 px-3 rounded-lg text-xs font-mono font-medium flex items-center justify-center gap-1.5 transition-all duration-150 cursor-pointer ${
                          drawerTab === 'payment'
                            ? 'bg-white/[0.08] text-[#FFF4C2] border border-[#D4AF37]/40 shadow-sm'
                            : 'text-[#94A3B8] hover:text-white'
                        }`}
                      >
                        <Wallet className={`w-3.5 h-3.5 ${drawerTab === 'payment' ? 'text-[#D4AF37]' : 'text-[#64748B]'}`} />
                        <span>💰 Collect Payment</span>
                      </button>
                    </div>

                    {/* ================= TAB 1: SUB-METER READING ================= */}
                    {drawerTab === 'meter' && (
                      <div className="flex flex-col">
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

                        {/* EVIDENCE CAPTURE */}
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
                            disabled={!canSaveReading}
                            onClick={handleSaveReadingOnly}
                            className="py-3 px-4 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-[#CBD5E1] text-xs font-mono font-semibold cursor-pointer active:scale-98 transition-all duration-100 text-center disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            Save Meter Only
                          </button>

                          <button
                            type="button"
                            onClick={handleProceedToPayment}
                            className="py-3 px-4 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all duration-150 cursor-pointer shadow-lg active:scale-98 bg-[#D4AF37] hover:bg-[#E5C158] text-[#06080C] border border-[#FFF4C2]/40 shadow-[0_0_20px_rgba(212,175,55,0.3)]"
                          >
                            <span>Collect Payment</span>
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* ================= TAB 2: DUAL-WALLET CASH SPLIT ================= */}
                    {drawerTab === 'payment' && (
                      <div className="flex flex-col gap-3 mt-3.5">
                        {/* 1. Rent Box (Golden Vault Box) */}
                        <div className="p-3.5 rounded-2xl bg-[#06080C] border border-[#D4AF37]/40 shadow-[0_4px_16px_rgba(0,0,0,0.4)] flex flex-col gap-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-[#D4AF37] shadow-[0_0_6px_#D4AF37]" />
                              <span className="text-[11px] font-mono font-bold tracking-wider text-[#FFF4C2]">
                                किराया (RENT)
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="text-[10px] font-mono text-[#94A3B8]">कुल बकाया: </span>
                              <span className="text-xs font-mono font-bold text-[#E2E8F0]">₹{effectiveRentDue.toLocaleString('en-IN')}</span>
                            </div>
                          </div>

                          {/* Rent Input Field */}
                          <div className="bg-white/[0.04] border border-white/[0.08] focus-within:border-[#D4AF37]/60 rounded-xl px-3 py-2 flex items-center justify-between transition-colors">
                            <span className="text-sm font-mono text-[#D4AF37] font-bold">₹</span>
                            <input
                              type="text"
                              inputMode="numeric"
                              pattern="[0-9]*"
                              value={rentPaidInput}
                              onChange={(e) => {
                                const val = e.target.value.replace(/[^0-9]/g, '');
                                setRentPaidInput(val);
                              }}
                              placeholder="0"
                              className="w-full bg-transparent text-lg font-mono font-bold text-[#EDEDED] text-right focus:outline-none placeholder:text-white/20"
                            />
                          </div>

                          {/* Dynamic Arrears Math */}
                          <div className="flex items-center justify-between text-[10px] font-mono pt-0.5">
                            {remainingRentDue > 0 ? (
                              <div className="flex items-center gap-1 text-amber-300">
                                <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" />
                                <span>बकाया आगे जुड़ेगा: ₹{remainingRentDue.toLocaleString('en-IN')}</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1 text-emerald-400">
                                <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                                <span>पूरा भुगतान (Zero Arrears)</span>
                              </div>
                            )}
                            <button
                              type="button"
                              onClick={() => setRentPaidInput(String(effectiveRentDue))}
                              className="text-[#94A3B8] hover:text-[#D4AF37] transition-colors underline cursor-pointer"
                            >
                              पूरा भरें
                            </button>
                          </div>
                        </div>

                        {/* 2. Electricity Box (Cyan Utility Box) */}
                        <div className="p-3.5 rounded-2xl bg-[#06080C] border border-cyan-500/40 shadow-[0_4px_16px_rgba(0,0,0,0.4)] flex flex-col gap-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <Zap className="w-3.5 h-3.5 text-cyan-400 fill-cyan-400" />
                              <span className="text-[11px] font-mono font-bold tracking-wider text-cyan-300">
                                बिजली बिल (ELECTRICITY BILL)
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="text-[10px] font-mono text-[#94A3B8]">
                                {electricityDue > 0 ? `गणना: ` : `दर: `}
                              </span>
                              <span className="text-xs font-mono font-bold text-cyan-200">
                                {electricityDue > 0 ? `₹${electricityDue.toLocaleString('en-IN')}` : `₹${tariffRate}/u`}
                              </span>
                            </div>
                          </div>

                          {/* Reading range notice if calculated */}
                          {unitsConsumed > 0 && currentReadingNum !== null && (
                            <div className="px-2.5 py-1 rounded-lg bg-cyan-950/30 border border-cyan-500/20 text-[10px] font-mono text-cyan-300 flex items-center justify-between">
                              <span>रीडिंग: {selectedUnit.lastReading} → {currentReadingNum}</span>
                              <span>{unitsConsumed} यूनिट @ ₹{tariffRate}</span>
                            </div>
                          )}

                          {/* Electricity Input Field */}
                          <div className="bg-white/[0.04] border border-white/[0.08] focus-within:border-cyan-500/60 rounded-xl px-3 py-2 flex items-center justify-between transition-colors">
                            <span className="text-sm font-mono text-cyan-400 font-bold">₹</span>
                            <input
                              type="text"
                              inputMode="numeric"
                              pattern="[0-9]*"
                              value={elecPaidInput}
                              onChange={(e) => {
                                const val = e.target.value.replace(/[^0-9]/g, '');
                                setElecPaidInput(val);
                              }}
                              placeholder="0"
                              className="w-full bg-transparent text-lg font-mono font-bold text-[#EDEDED] text-right focus:outline-none placeholder:text-white/20"
                            />
                          </div>

                          <div className="flex items-center justify-between text-[10px] font-mono pt-0.5">
                            <span className="text-[#64748B]">उपयोग अनुसार राशि दर्ज करें</span>
                            {electricityDue > 0 && (
                              <button
                                type="button"
                                onClick={() => setElecPaidInput(String(electricityDue))}
                                className="text-cyan-400 hover:text-cyan-300 transition-colors underline cursor-pointer"
                              >
                                बिल राशि भरें
                              </button>
                            )}
                          </div>
                        </div>

                        {/* 3. Total Handover Summary Bar */}
                        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#D4AF37]/10 via-[#06080C] to-cyan-950/30 border border-white/[0.12] shadow-inner flex flex-col gap-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-mono uppercase tracking-wider text-[#CBD5E1] font-semibold">
                              कुल नकद प्राप्त:
                            </span>
                            <span className="text-xl font-mono font-bold text-[#FFF4C2]">
                              ₹{totalCashCollected.toLocaleString('en-IN')}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-[10px] font-mono text-[#94A3B8] border-t border-white/[0.06] pt-1.5">
                            <span>किराया: ₹{rentPaidNum.toLocaleString('en-IN')}</span>
                            <span className="text-white/30">+</span>
                            <span>बिजली बिल: ₹{elecPaidNum.toLocaleString('en-IN')}</span>
                          </div>
                        </div>

                        {/* Action Buttons: Cancel vs Record Payment */}
                        <div className="grid grid-cols-2 gap-3 pt-1">
                          <button
                            type="button"
                            onClick={handleCloseDrawer}
                            className="py-3 px-4 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-[#94A3B8] hover:text-white text-xs font-mono font-semibold cursor-pointer active:scale-98 transition-all duration-100 text-center"
                          >
                            रद्द करें (Cancel)
                          </button>

                          <button
                            type="button"
                            disabled={totalCashCollected <= 0}
                            onClick={handleRecordPayment}
                            className={`py-3 px-4 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all duration-150 cursor-pointer shadow-lg active:scale-98 ${
                              totalCashCollected > 0
                                ? 'bg-[#D4AF37] hover:bg-[#E5C158] text-[#06080C] border border-[#FFF4C2]/40 shadow-[0_0_20px_rgba(212,175,55,0.3)]'
                                : 'bg-white/[0.04] text-[#64748B] border border-white/[0.06] cursor-not-allowed opacity-50'
                            }`}
                          >
                            <Check className="w-4 h-4" />
                            <span>भुगतान दर्ज करें</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* ================= COMMERCIAL PARKING EXIT SETTLEMENT DRAWER ================= */}
        <AnimatePresence>
          {selectedVehicleForExit && (
            <>
              <motion.div
                key="parking-exit-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => setSelectedVehicleForExit(null)}
                className="absolute inset-0 bg-black/70 backdrop-blur-md z-40 cursor-pointer"
              />

              <motion.div
                key="parking-exit-sheet"
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 28, stiffness: 320 }}
                className="absolute bottom-0 inset-x-0 bg-[#0A0D14] border-t border-white/[0.12] rounded-t-[32px] p-5 pb-[max(24px,env(safe-area-inset-bottom,24px))] shadow-[0_-20px_50px_rgba(0,0,0,0.9)] z-50 gpu-layer flex flex-col select-none max-h-[85vh] overflow-y-auto deck-scrollbar"
              >
                {/* Top handle */}
                <div className="w-10 h-1 rounded-full bg-white/20 mb-3 mx-auto shrink-0" />

                {/* Top Bar inside Sheet */}
                <div className="flex items-center justify-between pb-3 border-b border-white/[0.07]">
                  <div className="flex items-center gap-2.5">
                    <span className="px-2.5 py-1 rounded-xl bg-white/[0.06] border border-white/[0.1] font-mono font-bold text-sm text-[#EDEDED]">
                      {selectedVehicleForExit.vehicleNumber}
                    </span>
                    <span className="text-xs font-mono text-[#94A3B8]">
                      {selectedVehicleForExit.type === 'bike' ? '🛵 2-Wheeler (बाइक)' : '🚗 4-Wheeler (कार)'}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedVehicleForExit(null)}
                    aria-label="Close drawer"
                    className="p-1.5 rounded-full bg-white/[0.05] hover:bg-white/[0.1] text-[#94A3B8] hover:text-white transition-colors cursor-pointer border border-white/[0.08]"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Exit Fare HUD & Summary */}
                {(() => {
                  const now = new Date();
                  const durationMinutes = Math.max(1, Math.floor((now.getTime() - selectedVehicleForExit.entryTimestamp) / 60000));
                  const durationStr = formatDurationHindi(durationMinutes);
                  const { fare, rateDescription } = calculateParkingFare(selectedVehicleForExit.type, durationMinutes);
                  const outTimeFormatted = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

                  return (
                    <div className="flex flex-col gap-3.5 pt-3">
                      <div className="grid grid-cols-2 gap-2.5">
                        <div className="p-3 rounded-xl bg-[#06080C] border border-white/[0.06] flex flex-col">
                          <span className="text-[10px] font-mono text-[#64748B] uppercase">प्रवेश समय (In)</span>
                          <span className="text-sm font-mono font-bold text-[#EDEDED] mt-0.5">{selectedVehicleForExit.entryTimeFormatted}</span>
                        </div>

                        <div className="p-3 rounded-xl bg-[#06080C] border border-white/[0.06] flex flex-col">
                          <span className="text-[10px] font-mono text-[#64748B] uppercase">निकास समय (Out)</span>
                          <span className="text-sm font-mono font-bold text-cyan-300 mt-0.5">{outTimeFormatted}</span>
                        </div>
                      </div>

                      {/* Duration & Tariff description */}
                      <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-between text-xs font-mono">
                        <span className="text-[#94A3B8]">कुल अवधि (Duration):</span>
                        <span className="text-[#EDEDED] font-bold">{durationStr}</span>
                      </div>

                      <div className="px-3 py-2 rounded-xl bg-white/[0.02] border border-white/[0.04] text-[10px] font-mono text-[#94A3B8] text-center">
                        {rateDescription}
                      </div>

                      {/* Total Fare Card */}
                      <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-[#06080C] to-emerald-950/30 border border-emerald-500/40 shadow-inner flex items-center justify-between">
                        <div>
                          <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-300 font-semibold block">
                            कुल देय पार्किंग शुल्क
                          </span>
                          <span className="text-[10px] font-mono text-[#94A3B8]">नकद भुगतान (Cash)</span>
                        </div>
                        <span className="text-2xl font-mono font-bold text-emerald-400">
                          ₹{fare}
                        </span>
                      </div>

                      {/* Action Buttons */}
                      <div className="grid grid-cols-2 gap-3 pt-1">
                        <button
                          type="button"
                          onClick={() => setSelectedVehicleForExit(null)}
                          className="py-3 px-4 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-[#94A3B8] hover:text-white text-xs font-mono font-semibold cursor-pointer active:scale-98 transition-all duration-100 text-center"
                        >
                          रद्द करें (Cancel)
                        </button>

                        <button
                          type="button"
                          onClick={handleExitVehicle}
                          className="py-3 px-4 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all duration-150 cursor-pointer shadow-lg active:scale-98 bg-emerald-500 hover:bg-emerald-400 text-[#06080C] border border-emerald-300/40 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                        >
                          <Check className="w-4 h-4" />
                          <span>नकद प्राप्त व निकास</span>
                        </button>
                      </div>
                    </div>
                  );
                })()}
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* ================= ENTRY SLIP MODAL (NON-BLOCKING) ================= */}
        <AnimatePresence>
          {activeEntrySlip && (
            <>
              <motion.div
                key="entry-slip-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setActiveEntrySlip(null)}
                className="absolute inset-0 bg-black/75 backdrop-blur-md z-50 cursor-pointer"
              />
              <motion.div
                key="entry-slip-modal"
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ duration: 0.2 }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-sm bg-[#0A0D14] border border-emerald-500/40 rounded-3xl p-5 shadow-[0_20px_50px_rgba(0,0,0,0.9)] z-50 flex flex-col gap-3 font-mono"
              >
                <div className="flex items-center gap-2.5 pb-2 border-b border-white/[0.08]">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-[#EDEDED]">प्रवेश पर्ची तैयार</h3>
                    <span className="text-[10px] text-[#94A3B8]">Entry Slip Generated</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#06080C] border border-white/[0.08] text-[11px] leading-relaxed text-[#CBD5E1] whitespace-pre-wrap select-text">
                  {activeEntrySlip.rawText}
                </div>

                {/* Strictly non-blocking actions */}
                <div className="flex flex-col gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setActiveEntrySlip(null)}
                    className="w-full py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-[#06080C] font-mono font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(16,185,129,0.3)] active:scale-98 transition-all"
                  >
                    <Check className="w-4 h-4" />
                    <span>बाद में / Done (Skip)</span>
                  </button>

                  <div className="grid grid-cols-2 gap-2">
                    <a
                      href={activeEntrySlip.whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2 px-3 rounded-xl bg-emerald-950/50 hover:bg-emerald-900/60 border border-emerald-500/40 text-emerald-300 font-mono font-semibold text-[11px] flex items-center justify-center gap-1.5 cursor-pointer active:scale-98 transition-all text-center"
                    >
                      <span>🟢 WhatsApp</span>
                    </a>
                    <a
                      href={activeEntrySlip.smsUrl}
                      className="py-2 px-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 text-slate-200 font-mono font-semibold text-[11px] flex items-center justify-center gap-1.5 cursor-pointer active:scale-98 transition-all text-center"
                    >
                      <span>💬 SMS पर्ची</span>
                    </a>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* ================= EXIT RECEIPT MODAL (NON-BLOCKING) ================= */}
        <AnimatePresence>
          {activeExitReceipt && (
            <>
              <motion.div
                key="exit-receipt-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setActiveExitReceipt(null)}
                className="absolute inset-0 bg-black/75 backdrop-blur-md z-50 cursor-pointer"
              />
              <motion.div
                key="exit-receipt-modal"
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ duration: 0.2 }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-sm bg-[#0A0D14] border border-cyan-500/40 rounded-3xl p-5 shadow-[0_20px_50px_rgba(0,0,0,0.9)] z-50 flex flex-col gap-3 font-mono"
              >
                <div className="flex items-center gap-2.5 pb-2 border-b border-white/[0.08]">
                  <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-[#EDEDED]">निकास रसीद (Exit Receipt)</h3>
                    <span className="text-[10px] text-emerald-400 font-bold">शुल्क प्राप्त: ₹{activeExitReceipt.fare}</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#06080C] border border-white/[0.08] text-[11px] leading-relaxed text-[#CBD5E1] whitespace-pre-wrap select-text">
                  {activeExitReceipt.rawText}
                </div>

                {/* Strictly non-blocking actions */}
                <div className="flex flex-col gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setActiveExitReceipt(null)}
                    className="w-full py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-[#06080C] font-mono font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.3)] active:scale-98 transition-all"
                  >
                    <Check className="w-4 h-4" />
                    <span>संपन्न / Done (Skip)</span>
                  </button>

                  <div className="grid grid-cols-2 gap-2">
                    <a
                      href={activeExitReceipt.whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2 px-3 rounded-xl bg-emerald-950/50 hover:bg-emerald-900/60 border border-emerald-500/40 text-emerald-300 font-mono font-semibold text-[11px] flex items-center justify-center gap-1.5 cursor-pointer active:scale-98 transition-all text-center"
                    >
                      <span>🟢 WhatsApp</span>
                    </a>
                    <a
                      href={activeExitReceipt.smsUrl}
                      className="py-2 px-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 text-slate-200 font-mono font-semibold text-[11px] flex items-center justify-center gap-1.5 cursor-pointer active:scale-98 transition-all text-center"
                    >
                      <span>💬 SMS रसीद</span>
                    </a>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
