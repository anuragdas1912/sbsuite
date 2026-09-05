'use client';

import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Delete,
  ShieldCheck,
  Lock,
  Sparkles,
  Check,
  ChevronRight,
  AlertOctagon,
  Zap,
  Plus,
  Store,
  X,
  Camera,
  AlertTriangle,
  Wallet,
  MessageCircle,
  MessageSquare,
  ArrowRight,
  CheckCircle2,
  Share2,
  Car,
  Bike,
  Clock,
  Search,
  Building2,
  Truck,
  Settings,
  Sliders
} from 'lucide-react';

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

export type VehicleCategory = 'car_small' | 'car_large' | 'heavy' | 'tuktuk';

export interface CategoryPricing {
  fee: number;
  owner: number;
  ritin: number;
  label: string;
  subLabel: string;
}

export interface MonthlySubscriber {
  id: string;
  vehicleNumber: string;
  ownerName: string;
  phone?: string;
  category: VehicleCategory;
  slot: string;
  passStatus: 'active' | 'due';
  validTillDate: string;
  isParkedInside: boolean;
  lastPaidDate: string;
  hasEvFacility?: boolean;
  lastEvReading?: number;
  evDueAmount?: number;
}

const DEFAULT_CATEGORY_PRICING: Record<VehicleCategory, CategoryPricing> = {
  car_small: { fee: 500, owner: 400, ritin: 100, label: 'Car: Small', subLabel: 'हैचबैक / कॉम्पैक्ट' },
  car_large: { fee: 700, owner: 500, ritin: 200, label: 'Car: Large', subLabel: 'SUV / बड़ी गाड़ियां' },
  heavy:     { fee: 800, owner: 600, ritin: 200, label: 'Pickup / Loader', subLabel: 'पिकअप / लोडर' },
  tuktuk:    { fee: 500, owner: 400, ritin: 100, label: 'E-Rickshaw', subLabel: 'टुक-टुक (+EV मीटर)' }
};

const INITIAL_SUBSCRIBERS: MonthlySubscriber[] = [
  // Car Small (₹500: ₹400 / ₹100)
  { id: 'sub-1', vehicleNumber: 'UK 06 AB 1912', ownerName: 'राजेश कुमार', phone: '98371-20411', category: 'car_small', slot: 'P-01', passStatus: 'active', validTillDate: '30/09/2026', isParkedInside: true, lastPaidDate: '01/09/2026' },
  { id: 'sub-2', vehicleNumber: 'UK 06 CD 4589', ownerName: 'अमित सिब्बल', phone: '94120-88320', category: 'car_small', slot: 'P-02', passStatus: 'active', validTillDate: '28/09/2026', isParkedInside: true, lastPaidDate: '29/08/2026' },
  { id: 'sub-3', vehicleNumber: 'UP 25 BE 3390', ownerName: 'विक्रम सिंह राणा', phone: '97190-44120', category: 'car_small', slot: 'P-03', passStatus: 'active', validTillDate: '22/09/2026', isParkedInside: false, lastPaidDate: '23/08/2026' },

  // Car Large / SUV (₹700: ₹500 / ₹200)
  { id: 'sub-4', vehicleNumber: 'DL 01 AX 7721', ownerName: 'डॉ. पी. के. शर्मा', phone: '98102-34901', category: 'car_large', slot: 'P-08', passStatus: 'active', validTillDate: '04/10/2026', isParkedInside: true, lastPaidDate: '05/09/2026' },
  { id: 'sub-5', vehicleNumber: 'HR 26 DQ 1104', ownerName: 'संजय ग्रोवर', phone: '98114-55092', category: 'car_large', slot: 'P-09', passStatus: 'active', validTillDate: '15/09/2026', isParkedInside: true, lastPaidDate: '16/08/2026' },
  { id: 'sub-6', vehicleNumber: 'UK 04 F 9012', ownerName: 'दीपक बिष्ट', phone: '99270-11234', category: 'car_large', slot: 'P-10', passStatus: 'due', validTillDate: '02/09/2026', isParkedInside: true, lastPaidDate: '03/08/2026' },

  // Pickup / Loader / Heavy (₹800: ₹600 / ₹200)
  { id: 'sub-7', vehicleNumber: 'UK 06 L 8820', ownerName: 'महेन्द्र सिंह लोडर', phone: '95570-33412', category: 'heavy', slot: 'Open Yard-A', passStatus: 'active', validTillDate: '27/09/2026', isParkedInside: true, lastPaidDate: '28/08/2026' },
  { id: 'sub-8', vehicleNumber: 'UP 22 M 2244', ownerName: 'अनिल रस्तोगी', phone: '96340-99812', category: 'heavy', slot: 'Open Yard-B', passStatus: 'active', validTillDate: '26/09/2026', isParkedInside: true, lastPaidDate: '27/08/2026' },

  // E-Rickshaw / Tuk-Tuk (₹500: ₹400 / ₹100) + Optional EV Charging Sub-Meter
  { id: 'sub-9', vehicleNumber: 'UK 06 ER 4420', ownerName: 'रमेश पाल', phone: '97580-22109', category: 'tuktuk', slot: 'EV-Bay 1', passStatus: 'active', validTillDate: '25/09/2026', isParkedInside: true, lastPaidDate: '26/08/2026', hasEvFacility: true, lastEvReading: 420, evDueAmount: 0 },
  { id: 'sub-10', vehicleNumber: 'UK 06 ER 7710', ownerName: 'सलीम अख्तर', phone: '98971-88410', category: 'tuktuk', slot: 'EV-Bay 2', passStatus: 'active', validTillDate: '30/09/2026', isParkedInside: true, lastPaidDate: '01/09/2026', hasEvFacility: true, lastEvReading: 580, evDueAmount: 180 },
  { id: 'sub-11', vehicleNumber: 'UK 06 ER 1109', ownerName: 'राजू कश्यप', phone: '94121-66782', category: 'tuktuk', slot: 'EV-Bay 3', passStatus: 'due', validTillDate: '03/09/2026', isParkedInside: true, lastPaidDate: '04/08/2026', hasEvFacility: true, lastEvReading: 310, evDueAmount: 0 },
  { id: 'sub-12', vehicleNumber: 'UK 06 ER 9904', ownerName: 'सुरेश मौर्या', phone: '97198-44510', category: 'tuktuk', slot: 'T-04', passStatus: 'active', validTillDate: '02/10/2026', isParkedInside: false, lastPaidDate: '03/09/2026', hasEvFacility: false }
];

const STATIC_UNITS: UnitItem[] = [
  // 14 ROOMS
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

  // 8 SHOPS
  { id: 's-01', name: 'S-01', type: 'shop', isOccupied: true, tenantName: 'Balaji Medicals', rentAmount: 18000, rentDueAmount: 0, lastReading: 4210, isReadingPending: false },
  { id: 's-02', name: 'S-02', type: 'shop', isOccupied: true, tenantName: 'Shree Ganesh Grocery', rentAmount: 16500, rentDueAmount: 0, lastReading: 3890, isReadingPending: false },
  { id: 's-03', name: 'S-03', type: 'shop', isOccupied: true, tenantName: 'Modern Dry Cleaners', rentAmount: 14000, rentDueAmount: 8500, lastReading: 2890, isReadingPending: true },
  { id: 's-04', name: 'S-04', type: 'shop', isOccupied: true, tenantName: 'Metro Cyber & Print', rentAmount: 12500, rentDueAmount: 0, lastReading: 2450, isReadingPending: false },
  { id: 's-05', name: 'S-05', type: 'shop', isOccupied: false, rentAmount: 15000, rentDueAmount: 0, lastReading: 1100, isReadingPending: false },
  { id: 's-06', name: 'S-06', type: 'shop', isOccupied: true, tenantName: 'Royal Hair Salon', rentAmount: 15000, rentDueAmount: 0, lastReading: 3110, isReadingPending: false },
  { id: 's-07', name: 'S-07', type: 'shop', isOccupied: true, tenantName: 'Shanti Stationery', rentAmount: 13000, rentDueAmount: 0, lastReading: 1840, isReadingPending: false },
  { id: 's-08', name: 'S-08', type: 'shop', isOccupied: true, tenantName: 'Om Sweet & Snacks', rentAmount: 22000, rentDueAmount: 0, lastReading: 5620, isReadingPending: false }
];

function VolumetricMonolith({ className = 'w-36 h-36' }: { className?: string }) {
  return (
    <div className="relative flex items-center justify-center">
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
          <linearGradient id="goldChamferBevel" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFF9DF" stopOpacity="0.95" />
            <stop offset="26%" stopColor="#D4AF37" stopOpacity="0.85" />
            <stop offset="52%" stopColor="#6E530F" stopOpacity="0.3" />
            <stop offset="78%" stopColor="#F5D77F" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#FFF9DF" stopOpacity="0.95" />
          </linearGradient>
          <linearGradient id="liquidGold" x1="10%" y1="0%" x2="90%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="30%" stopColor="#FFF3C4" />
            <stop offset="60%" stopColor="#D4AF37" />
            <stop offset="100%" stopColor="#997316" />
          </linearGradient>
          <linearGradient id="glassSheen" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#161B26" stopOpacity="0.9" />
            <stop offset="45%" stopColor="#0E121B" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#06080C" stopOpacity="0.95" />
          </linearGradient>
          <linearGradient id="causticSweep144" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(255,255,255,0)" />
            <stop offset="50%" stopColor="rgba(255,245,215,0.18)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </linearGradient>
          <clipPath id="monolithClip">
            <rect x="2" y="2" width="140" height="140" rx="34" ry="34" />
          </clipPath>
        </defs>
        <rect x="1.5" y="1.5" width="141" height="141" rx="35" ry="35" fill="#0A0D14" stroke="url(#goldChamferBevel)" strokeWidth="1.2" />
        <path d="M 37 2.5 H 107 C 126 2.5 141.5 18 141.5 37" fill="none" stroke="rgba(255, 255, 255, 0.24)" strokeWidth="1" />
        <rect x="3" y="3" width="138" height="138" rx="33" ry="33" fill="url(#glassSheen)" stroke="rgba(255, 255, 255, 0.04)" strokeWidth="1" />
        <g clipPath="url(#monolithClip)">
          <rect className="caustic-sweep" x="-160" y="-30" width="100" height="190" fill="url(#causticSweep144)" transform="skewX(-25)" />
        </g>
        <g>
          <path d="M 66 47 H 45 C 40.029 47 36 51.029 36 56 V 64 C 36 68.971 40.029 73 45 73 H 57 C 61.971 73 66 77.029 66 82 V 89 C 66 93.971 61.971 98 57 98 H 36" fill="none" stroke="url(#liquidGold)" strokeWidth="6.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M 78 47 V 98" stroke="url(#liquidGold)" strokeWidth="6.5" strokeLinecap="round" />
          <path d="M 78 47 H 91 C 97.627 47 103 52.373 103 59 C 103 65.627 97.627 71 91 71 H 78" fill="none" stroke="url(#liquidGold)" strokeWidth="6.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M 78 71 H 93 C 99.627 71 105 76.82 105 84.5 C 105 92.18 99.627 98 93 98 H 78" fill="none" stroke="url(#liquidGold)" strokeWidth="6.5" strokeLinecap="round" strokeLinejoin="round" />
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

  // Sub-Meter Reading & Dual-Wallet Drawer state (Rooms & Shops)
  const [selectedUnit, setSelectedUnit] = useState<UnitItem | null>(null);
  const [drawerTab, setDrawerTab] = useState<'meter' | 'payment'>('meter');
  const [currentReadingInput, setCurrentReadingInput] = useState<string>('');
  const [meterPhotoUrl, setMeterPhotoUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ================= COMMERCIAL PARKING MONTHLY PASS STATE =================
  const [activeModule, setActiveModule] = useState<'units' | 'parking'>('units');
  const [subscribers, setSubscribers] = useState<MonthlySubscriber[]>(INITIAL_SUBSCRIBERS);
  const [pricing, setPricing] = useState<Record<VehicleCategory, CategoryPricing>>(DEFAULT_CATEGORY_PRICING);

  // Electricity Tariffs (Owner overridable)
  const [tariffs, setTariffs] = useState({
    room: 9.0,
    shop: 11.0,
    tuktuk: 9.0
  });

  // Financial Split Ledger
  const [totalParkingCollected, setTotalParkingCollected] = useState<number>(26500);
  const [ownerParkingShare, setOwnerParkingShare] = useState<number>(20800);
  const [ritinParkingCut, setRitinParkingCut] = useState<number>(5700);

  // New Pass Issuance Form
  const [newCategory, setNewCategory] = useState<VehicleCategory>('car_small');
  const [newVehicleNumber, setNewVehicleNumber] = useState<string>('');
  const [newOwnerName, setNewOwnerName] = useState<string>('');
  const [newPhone, setNewPhone] = useState<string>('');
  const [newSlot, setNewSlot] = useState<string>('');
  const [newHasEvFacility, setNewHasEvFacility] = useState<boolean>(false);
  const [newInitialEvReading, setNewInitialEvReading] = useState<string>('');

  const [parkingSearchQuery, setParkingSearchQuery] = useState<string>('');
  const [selectedSubForRenewal, setSelectedSubForRenewal] = useState<MonthlySubscriber | null>(null);
  const [renewalSlot, setRenewalSlot] = useState<string>('');
  const [renewalPassPaid, setRenewalPassPaid] = useState<string>('');
  const [renewalEvCurrReading, setRenewalEvCurrReading] = useState<string>('');
  const [renewalEvPaid, setRenewalEvPaid] = useState<string>('');

  // Owner Master Override Modal state (PIN: 1912 ONLY)
  const [isMasterOverrideOpen, setIsMasterOverrideOpen] = useState<boolean>(false);
  const [overrideSelectedUnitId, setOverrideSelectedUnitId] = useState<string>(STATIC_UNITS[0].id);
  const [overrideUnitRent, setOverrideUnitRent] = useState<string>(String(STATIC_UNITS[0].rentAmount));
  const [overrideUnitDue, setOverrideUnitDue] = useState<string>(String(STATIC_UNITS[0].rentDueAmount));

  const [overrideSelectedSubId, setOverrideSelectedSubId] = useState<string>(INITIAL_SUBSCRIBERS[0].id);
  const [overrideSubSlot, setOverrideSubSlot] = useState<string>(INITIAL_SUBSCRIBERS[0].slot);
  const [overrideSubEvDue, setOverrideSubEvDue] = useState<string>(String(INITIAL_SUBSCRIBERS[0].evDueAmount || 0));

  interface MonthlyReceiptPayload {
    vehicleNumber: string;
    ownerName: string;
    categoryText: string;
    slot: string;
    dateText: string;
    validityText: string;
    amount: number;
    ownerNet: number;
    ritinCut: number;
    evLines?: string;
    whatsappUrl: string;
    smsUrl: string;
    rawText: string;
  }
  const [activeMonthlyReceipt, setActiveMonthlyReceipt] = useState<MonthlyReceiptPayload | null>(null);

  // Category Telemetry Counts (Active parked inside)
  const countSmall = useMemo(() => subscribers.filter((s) => s.category === 'car_small' && s.isParkedInside).length, [subscribers]);
  const countLarge = useMemo(() => subscribers.filter((s) => s.category === 'car_large' && s.isParkedInside).length, [subscribers]);
  const countHeavy = useMemo(() => subscribers.filter((s) => s.category === 'heavy' && s.isParkedInside).length, [subscribers]);
  const countTukTuk = useMemo(() => subscribers.filter((s) => s.category === 'tuktuk' && s.isParkedInside).length, [subscribers]);
  const totalInside = useMemo(() => subscribers.filter((s) => s.isParkedInside).length, [subscribers]);

  const activePassCount = useMemo(() => subscribers.filter((s) => s.passStatus === 'active').length, [subscribers]);
  const duePassCount = useMemo(() => subscribers.filter((s) => s.passStatus === 'due').length, [subscribers]);

  const filteredSubscribers = useMemo(() => {
    if (!parkingSearchQuery.trim()) return subscribers;
    const q = parkingSearchQuery.trim().toUpperCase();
    return subscribers.filter((s) =>
      s.vehicleNumber.toUpperCase().includes(q) ||
      s.ownerName.toUpperCase().includes(q) ||
      (s.slot && s.slot.toUpperCase().includes(q)) ||
      (s.phone && s.phone.includes(q))
    );
  }, [subscribers, parkingSearchQuery]);

  // 1-Tap Field Presence Toggle (अंदर vs बाहर)
  const handleTogglePresence = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([14]);
    }
    setSubscribers((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isParkedInside: !s.isParkedInside } : s))
    );
  };

  // Issue New Monthly Pass (Flexible Category Pricing)
  const handleIssueNewPass = () => {
    const trimmedPlate = newVehicleNumber.trim().toUpperCase();
    const trimmedName = newOwnerName.trim();
    if (!trimmedPlate || trimmedPlate.length < 3 || !trimmedName) return;

    const currentCatPrice = pricing[newCategory];
    const today = new Date();
    const expiry = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
    const dateText = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;
    const expiryText = `${String(expiry.getDate()).padStart(2, '0')}/${String(expiry.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;

    const hasEv = newCategory === 'tuktuk' && newHasEvFacility;
    const initialReading = hasEv ? parseInt(newInitialEvReading || '0', 10) || 0 : 0;
    const slotAssigned = newSlot.trim() || 'General';

    const newSub: MonthlySubscriber = {
      id: `sub-${Date.now()}`,
      vehicleNumber: trimmedPlate,
      ownerName: trimmedName,
      phone: newPhone.trim() || '',
      category: newCategory,
      slot: slotAssigned,
      passStatus: 'active',
      validTillDate: expiryText,
      isParkedInside: true,
      lastPaidDate: dateText,
      hasEvFacility: hasEv,
      lastEvReading: initialReading,
      evDueAmount: 0
    };

    setSubscribers((prev) => [newSub, ...prev]);
    setTotalParkingCollected((prev) => prev + currentCatPrice.fee);
    setOwnerParkingShare((prev) => prev + currentCatPrice.owner);
    setRitinParkingCut((prev) => prev + currentCatPrice.ritin);

    setNewVehicleNumber('');
    setNewOwnerName('');
    setNewPhone('');
    setNewSlot('');
    setNewHasEvFacility(false);
    setNewInitialEvReading('');

    const receiptText = `श्री बालाजी पार्किंग (ट्रांजिट कैंप, रुद्रपुर)
मासिक पार्किंग रसीद (Monthly Pass)

वाहन नंबर: [${trimmedPlate}] (${currentCatPrice.label})
स्लॉट: [${slotAssigned}]
धारक: [${trimmedName}]
तारीख: [${dateText}]
--------------------------------
मासिक शुल्क: ₹${currentCatPrice.fee} (नकद प्राप्त)
वैधता: [${dateText} से ${expiryText}]
स्थिति: सक्रिय पास (Active)${hasEv ? `
ई-रिक्शा सब-मीटर: चालू (प्रारंभिक ${initialReading} kWh)` : ''}
--------------------------------
मालिक हिस्सा: ₹${currentCatPrice.owner} | रितिन कमीशन: ₹${currentCatPrice.ritin}
धन्यवाद। श्री बालाजी पार्किंग।`;

    const encoded = encodeURIComponent(receiptText);
    const whatsappUrl = `https://wa.me/?text=${encoded}`;
    const smsUrl = `sms:?body=${encoded}`;

    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([18, 30, 24]);
    }

    setActiveMonthlyReceipt({
      vehicleNumber: trimmedPlate,
      ownerName: trimmedName,
      categoryText: currentCatPrice.label,
      slot: slotAssigned,
      dateText,
      validityText: `${dateText} से ${expiryText}`,
      amount: currentCatPrice.fee,
      ownerNet: currentCatPrice.owner,
      ritinCut: currentCatPrice.ritin,
      whatsappUrl,
      smsUrl,
      rawText: receiptText,
    });
  };

  // Open Renewal Drawer
  const handleOpenRenewalDrawer = (sub: MonthlySubscriber) => {
    setSelectedSubForRenewal(sub);
    setRenewalSlot(sub.slot || 'Open Yard');
    const catPrice = pricing[sub.category] || pricing.car_small;
    setRenewalPassPaid(String(catPrice.fee));
    setRenewalEvCurrReading('');
    setRenewalEvPaid('0');
  };

  // Renewal & EV Settlement Confirm
  const handleRenewPass = () => {
    if (!selectedSubForRenewal) return;
    const sub = selectedSubForRenewal;
    const catPrice = pricing[sub.category] || pricing.car_small;

    const newSlot = renewalSlot.trim() || sub.slot;
    const passPaid = parseInt(renewalPassPaid || '0', 10);
    const evPaid = sub.hasEvFacility ? parseInt(renewalEvPaid || '0', 10) : 0;
    const totalPaid = passPaid + evPaid;

    if (totalPaid <= 0) {
      alert('कृपया प्राप्त राशि दर्ज करें');
      return;
    }

    const today = new Date();
    const expiry = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
    const dateText = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;
    const expiryText = `${String(expiry.getDate()).padStart(2, '0')}/${String(expiry.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;

    let evLines = '';
    let newEvReading = sub.lastEvReading || 0;
    let newEvArrears = sub.evDueAmount || 0;

    if (sub.hasEvFacility) {
      const prev = sub.lastEvReading || 0;
      const curr = parseInt(renewalEvCurrReading.trim() || '0', 10);
      let consumed = 0;
      let currBill = 0;
      if (!isNaN(curr) && curr >= prev) {
        consumed = curr - prev;
        currBill = consumed * tariffs.tuktuk;
        newEvReading = curr;
      }
      const totalEvDue = currBill + (sub.evDueAmount || 0);
      newEvArrears = Math.max(0, totalEvDue - evPaid);

      evLines = `ई-रिक्शा सब-मीटर रीडिंग: ${prev} -> ${newEvReading} (${consumed} यूनिट @ ₹${tariffs.tuktuk})\nई-रिक्शा चार्जिंग बिजली बिल: कुल ₹${totalEvDue}\nचार्जिंग जमा राशि: ₹${evPaid} (बकाया शेष: ₹${newEvArrears})\n`;
    }

    setSubscribers((prev) =>
      prev.map((s) => {
        if (s.id !== sub.id) return s;
        return {
          ...s,
          slot: newSlot,
          passStatus: passPaid > 0 ? 'active' : s.passStatus,
          validTillDate: passPaid > 0 ? expiryText : s.validTillDate,
          lastPaidDate: passPaid > 0 ? dateText : s.lastPaidDate,
          lastEvReading: newEvReading,
          evDueAmount: newEvArrears,
        };
      })
    );

    const isEvOnly = passPaid === 0 && evPaid > 0 && sub.hasEvFacility;
    const isCombined = passPaid > 0 && evPaid > 0;

    let splitOwnerNet = 0;
    let splitRitinCut = 0;
    let receiptText = '';

    if (isEvOnly) {
      splitOwnerNet = evPaid;
      splitRitinCut = 0;
      receiptText = `श्री बालाजी पार्किंग (ई-रिक्शा चार्जिंग रसीद)\n(ट्रांजिट कैंप, रुद्रपुर)\n\nवाहन नंबर: [${sub.vehicleNumber}] (${catPrice.label})\nस्लॉट: [${newSlot}]\nधारक: [${sub.ownerName}]\nतारीख: [${dateText}]\n--------------------------------\n${evLines}--------------------------------\nकुल नकद प्राप्त: ₹${totalPaid} (बिजली बिल)\nमालिक हिस्सा (बिजली फंड): ₹${evPaid} | रितिन कमीशन: ₹0\n--------------------------------\nधन्यवाद। श्री बालाजी पार्किंग।`;
    } else if (isCombined) {
      splitOwnerNet = catPrice.owner + evPaid;
      splitRitinCut = catPrice.ritin;
      receiptText = `श्री बालाजी पार्किंग (ट्रांजिट कैंप, रुद्रपुर)\nमासिक पास एवं ई-रिक्शा चार्जिंग रसीद\n\nवाहन नंबर: [${sub.vehicleNumber}] (${catPrice.label})\nस्लॉट: [${newSlot}]\nधारक: [${sub.ownerName}]\nतारीख: [${dateText}]\n--------------------------------\nमासिक पार्किंग पास: ₹${passPaid} (वैध: ${dateText} से ${expiryText})\n${evLines}--------------------------------\nकुल नकद प्राप्त: ₹${totalPaid}\nमालिक हिस्सा: ₹${splitOwnerNet} | रितिन कमीशन: ₹${splitRitinCut}\n--------------------------------\nधन्यवाद। श्री बालाजी पार्किंग।`;
    } else {
      splitOwnerNet = catPrice.owner;
      splitRitinCut = catPrice.ritin;
      receiptText = `श्री बालाजी पार्किंग (ट्रांजिट कैंप, रुद्रपुर)\nमासिक पार्किंग पास रसीद\n\nवाहन नंबर: [${sub.vehicleNumber}] (${catPrice.label})\nस्लॉट: [${newSlot}]\nधारक: [${sub.ownerName}]\nतारीख: [${dateText}]\n--------------------------------\nमासिक पार्किंग पास: ₹${passPaid} (वैध: ${dateText} से ${expiryText})\n--------------------------------\nकुल नकद प्राप्त: ₹${totalPaid}\nमालिक हिस्सा: ₹${splitOwnerNet} | रितिन कमीशन: ₹${splitRitinCut}\n--------------------------------\nधन्यवाद। श्री बालाजी पार्किंग।`;
    }

    setTotalParkingCollected((prev) => prev + totalPaid);
    setOwnerParkingShare((prev) => prev + splitOwnerNet);
    setRitinParkingCut((prev) => prev + splitRitinCut);

    const encoded = encodeURIComponent(receiptText);
    const whatsappUrl = `https://wa.me/?text=${encoded}`;
    const smsUrl = `sms:?body=${encoded}`;

    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([18, 30, 24]);
    }

    setActiveMonthlyReceipt({
      vehicleNumber: sub.vehicleNumber,
      ownerName: sub.ownerName,
      categoryText: catPrice.label,
      slot: newSlot,
      dateText,
      validityText: passPaid > 0 ? `${dateText} से ${expiryText}` : sub.validTillDate,
      amount: totalPaid,
      ownerNet: splitOwnerNet,
      ritinCut: splitRitinCut,
      evLines,
      whatsappUrl,
      smsUrl,
      rawText: receiptText,
    });

    setSelectedSubForRenewal(null);
  };

  // Master Override Handlers (PIN: 1912 ONLY)
  const handleOpenMasterOverride = () => {
    if (userRole !== 'owner') return;
    setIsMasterOverrideOpen(true);
  };

  const handleApplyMasterOverrides = () => {
    // 1. Update Unit
    setUnits((prev) =>
      prev.map((u) =>
        u.id === overrideSelectedUnitId
          ? {
              ...u,
              rentAmount: parseInt(overrideUnitRent, 10) || u.rentAmount,
              rentDueAmount: parseInt(overrideUnitDue, 10) || 0,
            }
          : u
      )
    );

    // 2. Update Subscriber
    setSubscribers((prev) =>
      prev.map((s) =>
        s.id === overrideSelectedSubId
          ? {
              ...s,
              slot: overrideSubSlot.trim() || s.slot,
              evDueAmount: parseInt(overrideSubEvDue, 10) || 0,
            }
          : s
      )
    );

    setIsMasterOverrideOpen(false);
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([24, 30, 24]);
    }
  };

  // Dual-Wallet Cash Split state (Rooms & Shops)
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
  const tariffRate = selectedUnit ? (selectedUnit.type === 'room' ? tariffs.room : tariffs.shop) : tariffs.room;
  const currentReadingNum = currentReadingInput.trim() !== '' ? parseInt(currentReadingInput, 10) : null;
  const isInputValid = currentReadingNum !== null && !isNaN(currentReadingNum);
  const isLowerThanPrev = isInputValid && selectedUnit ? currentReadingNum < selectedUnit.lastReading : false;
  const unitsConsumed = isInputValid && selectedUnit && !isLowerThanPrev ? currentReadingNum - selectedUnit.lastReading : 0;
  const electricityDue = unitsConsumed * tariffRate;
  const canSaveReading = isInputValid && selectedUnit && !isLowerThanPrev;

  // Rent & Arrears Calculations
  const effectiveRentDue = selectedUnit ? ((selectedUnit.rentDueAmount !== undefined && selectedUnit.rentDueAmount !== null) ? selectedUnit.rentDueAmount : selectedUnit.rentAmount) : 0;
  const rentPaidNum = rentPaidInput.trim() !== '' ? parseInt(rentPaidInput, 10) || 0 : 0;
  const elecPaidNum = elecPaidInput.trim() !== '' ? parseInt(elecPaidInput, 10) || 0 : 0;
  const remainingRentDue = Math.max(0, effectiveRentDue - rentPaidNum);
  const totalCashCollected = rentPaidNum + elecPaidNum;

  const handleUnitClick = (unit: UnitItem) => {
    if (!unit.isOccupied) return;
    setSelectedUnit(unit);
    setDrawerTab(unit.isReadingPending ? 'meter' : 'payment');
    setCurrentReadingInput('');
    setMeterPhotoUrl(null);
    setReceiptData(null);
    const rentDue = (unit.rentDueAmount !== undefined && unit.rentDueAmount !== null) ? unit.rentDueAmount : unit.rentAmount;
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

  const handleRecordPayment = () => {
    if (!selectedUnit || totalCashCollected <= 0) return;

    const prevReading = selectedUnit.lastReading;
    const currentNum = canSaveReading && currentReadingNum !== null ? currentReadingNum : null;
    const hasValidReading = currentNum !== null && currentNum >= prevReading;

    const newLastReading = hasValidReading && currentNum !== null ? currentNum : prevReading;
    setUnits((prev) =>
      prev.map((u) => {
        if (u.id === selectedUnit.id) {
          return {
            ...u,
            rentDueAmount: remainingRentDue,
            lastReading: newLastReading,
            isReadingPending: hasValidReading ? false : (elecPaidNum > 0 ? false : u.isReadingPending),
          };
        }
        return u;
      })
    );

    const today = new Date();
    const dateStr = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;
    let elecLine = '';
    if (hasValidReading && currentNum !== null) {
      const consumed = currentNum - prevReading;
      elecLine = `बिजली बिल जमा: ₹${elecPaidNum.toLocaleString('en-IN')} (रीडिंग: ${prevReading} -> ${currentNum}, ${consumed} यूनिट)
`;
    } else if (elecPaidNum > 0) {
      elecLine = `बिजली बिल जमा: ₹${elecPaidNum.toLocaleString('en-IN')}
`;
    }

    const receiptText = `श्री बालाजी एस्टेट (ट्रांजिट कैंप, रुद्रपुर)
डिजिटल किराया एवं बिजली रसीद

यूनिट: [${selectedUnit.name}] (${selectedUnit.type === 'room' ? 'कमरा' : 'दुकान'})
किराएदार: [${selectedUnit.tenantName}]
तारीख: [${dateStr}]
--------------------------------
किराया जमा: ₹${rentPaidNum.toLocaleString('en-IN')} (शेष बकाया: ₹${remainingRentDue.toLocaleString('en-IN')})
${elecLine}--------------------------------
कुल नकद प्राप्त: ₹${totalCashCollected.toLocaleString('en-IN')}
धन्यवाद। श्री बालाजी एस्टेट।`;

    const encoded = encodeURIComponent(receiptText);
    const whatsappUrl = `https://wa.me/?text=${encoded}`;
    const smsUrl = `sms:?body=${encoded}`;

    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([18, 30, 24]);
    }

    setReceiptData({
      unitName: selectedUnit.name,
      tenantName: selectedUnit.tenantName || 'Tenant',
      dateStr,
      rentPaid: rentPaidNum,
      remainingRent: remainingRentDue,
      elecPaid: elecPaidNum,
      unitsConsumed,
      prevReading,
      currReading: currentNum,
      totalCash: totalCashCollected,
      whatsappUrl,
      smsUrl,
      rawText: receiptText,
    });
  };

  // Operational stats calculations
  const filteredUnits = useMemo(() => {
    return units.filter((u) => u.type === (activeTab === 'rooms' ? 'room' : 'shop'));
  }, [units, activeTab]);

  const totalFiltered = filteredUnits.length;
  const occupiedCount = useMemo(() => filteredUnits.filter((u) => u.isOccupied).length, [filteredUnits]);
  const totalRentDue = useMemo(() => {
    return filteredUnits.reduce((sum, u) => sum + ((u.rentDueAmount !== undefined && u.rentDueAmount !== null) ? u.rentDueAmount : (u.isOccupied ? u.rentAmount : 0)), 0);
  }, [filteredUnits]);
  const pendingMetersCount = useMemo(() => {
    return filteredUnits.filter((u) => u.isOccupied && u.isReadingPending).length;
  }, [filteredUnits]);

  // Touch parallax for splash screen
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    setTilt({ x: -y * 8, y: x * 8 });
  };
  const handlePointerLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  // Device orientation parallax
  useEffect(() => {
    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.gamma !== null && e.beta !== null) {
        const x = Math.max(-1, Math.min(1, e.gamma / 30));
        const y = Math.max(-1, Math.min(1, (e.beta - 45) / 30));
        setTilt({ x: -y * 8, y: x * 8 });
      }
    };
    if (typeof window !== 'undefined' && window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', handleOrientation, { passive: true });
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('deviceorientation', handleOrientation);
      }
    };
  }, []);

  const handleStartPinEntry = () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([16]);
    }
    setCurrentScreen('pin');
    setPin('');
    setIsError(false);
    setStatusMessage('Authorized Personnel Only');
  };

  const handleLockTerminal = () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([16]);
    }
    handleCloseDrawer();
    setSelectedSubForRenewal(null);
    setActiveMonthlyReceipt(null);
    setIsMasterOverrideOpen(false);
    setCurrentScreen('pin');
    setPin('');
    setUserRole(null);
    setIsError(false);
    setIsSuccessOwner(false);
    setIsSuccessManager(false);
    setIsProcessing(false);
    setStatusMessage('Authorized Personnel Only');
  };

  const handleKeyPress = useCallback(
    (key: string) => {
      if (isProcessing || pin.length >= 4) return;
      const newPin = pin + key;
      setPin(newPin);
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([12]);
      }

      if (newPin.length === 4) {
        setIsProcessing(true);
        if (newPin === '1912') {
          setIsSuccessOwner(true);
          setIsIrisUnlocking(true);
          setUserRole('owner');
          setStatusMessage('👑 OWNER ACCESS GRANTED');
          if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate([24, 40, 48]);
          }
          setTimeout(() => {
            setCurrentScreen('units_deck');
            setIsProcessing(false);
            setIsIrisUnlocking(false);
          }, 650);
        } else if (newPin === '1289') {
          setIsSuccessManager(true);
          setIsIrisUnlocking(true);
          setUserRole('manager');
          setStatusMessage('👤 MANAGER ACCESS (RITIN)');
          if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate([24, 40, 48]);
          }
          setTimeout(() => {
            setCurrentScreen('units_deck');
            setIsProcessing(false);
            setIsIrisUnlocking(false);
          }, 650);
        } else {
          setIsError(true);
          setStatusMessage('ACCESS DENIED // INVALID PIN');
          if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate([40, 60, 40, 60]);
          }
          setTimeout(() => {
            setPin('');
            setIsError(false);
            setIsProcessing(false);
            setStatusMessage('Authorized Personnel Only');
          }, 650);
        }
      }
    },
    [pin, isProcessing]
  );

  const handleDelete = useCallback(() => {
    if (isProcessing || pin.length === 0) return;
    setPin((prev) => prev.slice(0, -1));
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([8]);
    }
  }, [isProcessing, pin]);

  return (
    <main className="h-[100dvh] w-full flex flex-col items-center justify-center p-0 sm:p-4 bg-[#06080C] overflow-hidden fixed">
      <div
        id="terminal-viewport"
        className="w-full max-w-md h-[100dvh] sm:h-[860px] sm:max-h-[92vh] relative flex flex-col justify-start overflow-hidden bg-[#06080C] shadow-[0_30px_90px_rgba(0,0,0,0.95)] sm:rounded-[44px] sm:border sm:border-white/[0.08] transition-all duration-300"
      >
        {/* Top Gold Laser Sweep on Iris Unlock */}
        <AnimatePresence>
          {isIrisUnlocking && (
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: '250%' }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
              className="absolute top-0 left-0 right-0 h-[2px] z-50 overflow-hidden pointer-events-none"
            >
              <div className="h-full w-48 bg-gradient-to-r from-transparent via-[#FFF4C2] to-transparent shadow-[0_0_12px_#D4AF37]" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Subtle Atmospheric Champagne Aura */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          <div
            className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[360px] h-[360px] rounded-full gpu-layer"
            style={{
              background: 'radial-gradient(circle, rgba(212, 175, 55, 0.05) 0%, rgba(212, 175, 55, 0.015) 45%, transparent 70%)',
              filter: 'blur(60px)',
            }}
          />
          <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.12] to-transparent" />
        </div>

        {/* ================= SCREEN 1: SPLASH SCREEN ================= */}
        <AnimatePresence mode="wait">
          {currentScreen === 'splash' && (
            <motion.div
              key="splash"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -24, scale: 0.96 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              onPointerMove={handlePointerMove}
              onPointerLeave={handlePointerLeave}
              onClick={handleStartPinEntry}
              className="screen-fade absolute inset-0 flex flex-col justify-between items-center px-6 cursor-pointer select-none z-20 gpu-layer"
              style={{
                paddingTop: 'max(16px, env(safe-area-inset-top, 16px))',
                paddingBottom: 'max(24px, env(safe-area-inset-bottom, 24px))',
              }}
            >
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

              <div className="flex flex-col items-center justify-center text-center -mt-4 pointer-events-none">
                <motion.div
                  animate={{
                    rotateX: tilt.x,
                    rotateY: tilt.y,
                  }}
                  transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                  className="relative mb-7 shadow-[0_25px_60px_rgba(0,0,0,0.85)] rounded-[36px]"
                >
                  <VolumetricMonolith />
                </motion.div>

                <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#EDEDED] leading-tight">
                  Shree Balaji Estate
                </h1>
                <div className="mt-3.5 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] shadow-[0_4px_16px_rgba(0,0,0,0.4)]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] shadow-[0_0_6px_#D4AF37]" />
                  <span className="text-[11px] font-mono font-medium tracking-widest text-[#94A3B8]">
                    TERMINAL GATEWAY // 2026
                  </span>
                </div>
              </div>

              <div className="w-full flex flex-col items-center pb-2 pointer-events-none">
                <div className="relative overflow-hidden inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-white/[0.04] backdrop-blur-2xl border border-white/[0.12] shadow-[0_8px_32px_rgba(0,0,0,0.6)] text-xs font-mono font-semibold tracking-wider text-[#F1F5F9]">
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
        </AnimatePresence>

        {/* ================= SCREEN 2: PIN GATEWAY ================= */}
        <AnimatePresence mode="wait">
          {currentScreen === 'pin' && (
            <motion.div
              key="pin"
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
                x: isError ? [-14, 14, -10, 10, -5, 5, 0] : 0,
              }}
              exit={{ opacity: 0, y: -20, scale: 0.97 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="screen-fade relative w-full h-full flex flex-col justify-between px-6 z-10 gpu-layer"
              style={{
                paddingTop: 'max(16px, env(safe-area-inset-top, 16px))',
                paddingBottom: 'max(20px, env(safe-area-inset-bottom, 20px))',
              }}
            >
              <div className="w-full flex items-center justify-between pt-2 pb-1">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] shadow-[0_4px_16px_rgba(0,0,0,0.4)]">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] shadow-[0_0_6px_rgba(212,175,55,0.8)]" />
                  <span className="text-[11px] font-mono font-medium uppercase tracking-wider text-[#CBD5E1]">
                    Shree Balaji Estate
                  </span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] shadow-[0_4px_16px_rgba(0,0,0,0.4)]">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#10B981] animate-pulse" />
                  <span className="text-[10px] font-mono font-medium text-[#94A3B8]">GATEWAY SECURED</span>
                </div>
              </div>

              <div className="flex flex-col items-center text-center my-auto py-2">
                <div
                  className={`w-11 h-11 rounded-2xl bg-[#0D1117] border shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_4px_16px_rgba(0,0,0,0.4)] flex items-center justify-center mb-3 transition-colors duration-200 ${
                    isSuccessOwner
                      ? 'border-[#D4AF37] text-[#D4AF37]'
                      : isSuccessManager
                      ? 'border-cyan-400 text-cyan-400'
                      : isError
                      ? 'border-rose-500 text-rose-500'
                      : 'border-white/[0.08] text-[#D4AF37]'
                  }`}
                >
                  {isSuccessOwner || isSuccessManager ? (
                    <ShieldCheck className="w-5 h-5" />
                  ) : isError ? (
                    <AlertOctagon className="w-5 h-5" />
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

                <div
                  className={`h-7 mt-3 flex items-center justify-center text-[11px] font-mono tracking-wider uppercase ${
                    isSuccessOwner
                      ? 'text-[#D4AF37] font-bold'
                      : isSuccessManager
                      ? 'text-cyan-400 font-bold'
                      : isError
                      ? 'text-rose-500 font-bold'
                      : 'text-[#475569]'
                  }`}
                >
                  {statusMessage || 'Authorized Personnel Only'}
                </div>

                <div className="relative mt-2">
                  <div className="flex items-center gap-4">
                    {[0, 1, 2, 3].map((index) => {
                      const isFilled = index < pin.length;
                      return (
                        <div
                          key={index}
                          className={`w-4 h-4 rounded-full transition-all duration-200 flex items-center justify-center ${
                            isFilled
                              ? 'bg-[#D4AF37] border border-[#FFF4C2] shadow-[0_0_12px_#D4AF37,inset_0_1px_1px_rgba(255,255,255,0.8)] scale-110'
                              : 'bg-[#07090E] border border-white/[0.12] shadow-[inset_0_2px_4px_rgba(0,0,0,0.95)] scale-100'
                          }`}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Keypad */}
              <div className="w-full pb-2 select-none">
                <div className="grid grid-cols-3 gap-y-3.5 gap-x-4 max-w-[280px] mx-auto place-items-center">
                  {KEYPAD_KEYS.map((key) => (
                    <button
                      key={key.num}
                      type="button"
                      onClick={() => handleKeyPress(key.num)}
                      className="w-20 h-20 rounded-[26px] glass-pebble flex flex-col items-center justify-center text-[#F1F5F9] cursor-pointer select-none gpu-layer touch-manipulation"
                    >
                      <span className="text-2xl font-light leading-none tracking-tight relative z-10">{key.num}</span>
                      {key.sub ? (
                        <span className="text-[10px] font-mono text-[#64748B] tracking-widest mt-1 leading-none uppercase relative z-10">
                          {key.sub}
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono text-transparent tracking-widest mt-1 leading-none">&nbsp;</span>
                      )}
                    </button>
                  ))}

                  <div className="w-20 h-20 flex items-center justify-center" />

                  <button
                    type="button"
                    onClick={() => handleKeyPress('0')}
                    className="w-20 h-20 rounded-[26px] glass-pebble flex flex-col items-center justify-center text-[#F1F5F9] cursor-pointer select-none gpu-layer touch-manipulation"
                  >
                    <span className="text-2xl font-light leading-none tracking-tight relative z-10">0</span>
                    <span className="text-[10px] font-mono text-[#64748B] tracking-widest mt-1 leading-none uppercase relative z-10">+</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDelete}
                    className="w-20 h-20 rounded-[26px] glass-pebble flex items-center justify-center text-[#94A3B8] active:text-[#F1F5F9] cursor-pointer select-none gpu-layer touch-manipulation"
                    aria-label="Delete"
                  >
                    <Delete className="w-6 h-6 relative z-10" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ================= SCREEN 3: UNITS DECK & COMMERCIAL PARKING ================= */}
        <AnimatePresence mode="wait">
          {currentScreen === 'units_deck' && (
            <motion.div
              key="units_deck"
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.97 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="screen-fade absolute inset-0 w-full h-full flex flex-col overflow-hidden z-10 gpu-layer select-none"
            >
              {activeModule === 'units' ? (
                <>
                  {/* Pinned Sticky Header */}
                  <header className="shrink-0 w-full z-20 px-5 pt-[max(12px,env(safe-area-inset-top,12px))] pb-3 border-b border-white/[0.06] bg-[#06080C]/95 backdrop-blur-xl">
                    <div className="flex items-center justify-between">
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
                            {userRole === 'owner' ? '👑 Owner Telemetry' : '👤 Manager Shift (Ritin)'}
                          </span>
                        </div>
                      </div>

                      {/* Right Controls: Master Override (Owner Only) & Lock */}
                      <div className="flex items-center gap-2">
                        {userRole === 'owner' && (
                          <button
                            type="button"
                            onClick={handleOpenMasterOverride}
                            className="px-2.5 py-1.5 rounded-xl bg-[#D4AF37]/15 hover:bg-[#D4AF37]/25 border border-[#D4AF37]/50 text-[#D4AF37] font-mono font-bold text-[11px] flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all shadow-[0_0_12px_rgba(212,175,55,0.2)]"
                          >
                            <Sliders className="w-3.5 h-3.5" />
                            <span>⚙️ Control</span>
                          </button>
                        )}

                        <button
                          onClick={handleLockTerminal}
                          aria-label="Lock terminal"
                          className="p-2.5 rounded-xl bg-[#0D1117] border border-white/[0.08] text-[#94A3B8] hover:text-white active:scale-95 transition-all duration-100 cursor-pointer shadow-sm hover:border-[#D4AF37]/30"
                          title="Lock Terminal"
                        >
                          <Lock className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Segmented Vault Tabs */}
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
                        <span className="text-[11px] opacity-75">(14)</span>
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
                        <span className="text-[11px] opacity-75">(8)</span>
                      </button>
                    </div>

                    {/* Quick Stats Ribbon */}
                    <div className="mt-3 grid grid-cols-3 gap-2 px-3 py-2 rounded-xl bg-white/[0.02] border border-white/[0.05] text-center">
                      <div className="flex flex-col items-center">
                        <span className="text-[9px] font-mono text-[#64748B] uppercase tracking-wider">Occupancy</span>
                        <div className="flex items-center gap-1 mt-0.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          <span className="text-xs font-mono font-semibold text-[#EDEDED]">{occupiedCount}/{totalFiltered}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-center border-x border-white/[0.06] px-1">
                        <span className="text-[9px] font-mono text-[#64748B] uppercase tracking-wider">Rent Due</span>
                        <span className="text-xs font-mono font-semibold mt-0.5 text-amber-400">₹{totalRentDue.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="text-[9px] font-mono text-[#64748B] uppercase tracking-wider">Meters Due</span>
                        <div className="flex items-center gap-1 mt-0.5">
                          <Zap className="w-2.5 h-2.5 text-cyan-400 fill-cyan-400" />
                          <span className="text-xs font-mono font-semibold text-cyan-400">{pendingMetersCount}</span>
                        </div>
                      </div>
                    </div>
                  </header>

                  {/* Units Grid */}
                  <main className="flex-1 w-full min-h-0 overflow-y-auto overscroll-contain px-4 pt-3 pb-[max(24px,env(safe-area-inset-bottom,24px))] deck-scrollbar">
                    <div className="grid grid-cols-2 gap-2.5 pb-6">
                      {filteredUnits.map((unit) => {
                        if (!unit.isOccupied) {
                          return (
                            <div key={unit.id} className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.04] opacity-50 flex flex-col justify-between min-h-[115px]">
                              <div className="flex items-center justify-between">
                                <span className="font-mono font-bold text-sm text-[#94A3B8]">{unit.name}</span>
                                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/[0.04] text-[#64748B]">रिक्त</span>
                              </div>
                              <div className="mt-4 flex items-baseline justify-between text-xs font-mono">
                                <span className="text-[#64748B]">किराया:</span>
                                <span className="text-[#94A3B8]">₹{unit.rentAmount.toLocaleString('en-IN')}</span>
                              </div>
                            </div>
                          );
                        }

                        const isMeterPending = unit.isReadingPending;
                        const dueAmount = (unit.rentDueAmount !== undefined && unit.rentDueAmount !== null) ? unit.rentDueAmount : unit.rentAmount;

                        return (
                          <div
                            key={unit.id}
                            onClick={() => handleUnitClick(unit)}
                            className="p-3.5 rounded-2xl bg-[#0A0D14] border hover:border-[#D4AF37]/50 border-white/[0.08] shadow-md flex flex-col justify-between min-h-[115px] cursor-pointer active:scale-98 transition-all duration-150"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-mono font-bold text-sm text-[#EDEDED] flex items-center gap-1.5">
                                {unit.name}
                                {isMeterPending && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />}
                              </span>
                              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-950/40 border border-emerald-500/30 text-emerald-400">
                                किराएदार
                              </span>
                            </div>
                            <span className="text-xs text-[#CBD5E1] truncate mt-1">{unit.tenantName}</span>
                            <div className="mt-2.5 pt-2 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono">
                              <span className="text-amber-400 font-bold">₹{dueAmount.toLocaleString('en-IN')}</span>
                              {isMeterPending ? (
                                <span className="text-[9px] text-cyan-300 bg-cyan-950/40 px-1.5 py-0.5 rounded border border-cyan-500/30">⚡ रीडिंग बाकी</span>
                              ) : (
                                <span className="text-[9px] text-[#64748B]">{unit.lastReading} kWh</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </main>
                </>
              ) : (
                <>
                  {/* ================= COMMERCIAL PARKING MODULE ================= */}
                  <header className="shrink-0 w-full z-20 px-5 pt-[max(12px,env(safe-area-inset-top,12px))] pb-3 border-b border-white/[0.06] bg-[#06080C]/95 backdrop-blur-xl">
                    <div className="flex items-center justify-between">
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
                            Transit Camp // Monthly Fleet
                          </span>
                        </div>
                      </div>

                      {/* Right Controls: Master Override & Lock */}
                      <div className="flex items-center gap-2">
                        {userRole === 'owner' && (
                          <button
                            type="button"
                            onClick={handleOpenMasterOverride}
                            className="px-2.5 py-1.5 rounded-xl bg-[#D4AF37]/15 hover:bg-[#D4AF37]/25 border border-[#D4AF37]/50 text-[#D4AF37] font-mono font-bold text-[11px] flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all shadow-[0_0_12px_rgba(212,175,55,0.2)]"
                          >
                            <Sliders className="w-3.5 h-3.5" />
                            <span>⚙️ Control</span>
                          </button>
                        )}

                        <button
                          onClick={handleLockTerminal}
                          aria-label="Lock terminal"
                          className="p-2.5 rounded-xl bg-[#0D1117] border border-white/[0.08] text-[#94A3B8] hover:text-white active:scale-95 transition-all duration-100 cursor-pointer shadow-sm hover:border-[#D4AF37]/30"
                          title="Lock Terminal"
                        >
                          <Lock className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* 4 Category Telemetry Strip */}
                    <div className="mt-3 grid grid-cols-4 gap-1.5">
                      <div className="py-1.5 px-1 rounded-xl flex flex-col items-center justify-center border font-mono bg-white/[0.03] border-white/[0.06] text-[#CBD5E1]">
                        <span className="text-[8.5px] text-[#94A3B8] uppercase truncate">🚗 Small</span>
                        <span className="text-xs font-bold text-sky-400 mt-0.5">{countSmall} Active</span>
                      </div>
                      <div className="py-1.5 px-1 rounded-xl flex flex-col items-center justify-center border font-mono bg-white/[0.03] border-white/[0.06] text-[#CBD5E1]">
                        <span className="text-[8.5px] text-[#94A3B8] uppercase truncate">🚙 SUV</span>
                        <span className="text-xs font-bold text-amber-300 mt-0.5">{countLarge} Active</span>
                      </div>
                      <div className="py-1.5 px-1 rounded-xl flex flex-col items-center justify-center border font-mono bg-white/[0.03] border-white/[0.06] text-[#CBD5E1]">
                        <span className="text-[8.5px] text-[#94A3B8] uppercase truncate">🛻 Heavy</span>
                        <span className="text-xs font-bold text-purple-300 mt-0.5">{countHeavy} Active</span>
                      </div>
                      <div className="py-1.5 px-1 rounded-xl flex flex-col items-center justify-center border font-mono bg-white/[0.03] border-white/[0.06] text-[#CBD5E1]">
                        <span className="text-[8.5px] text-[#94A3B8] uppercase truncate">🛺 TukTuk</span>
                        <span className="text-xs font-bold text-emerald-400 mt-0.5">{countTukTuk} Active</span>
                      </div>
                    </div>

                    {/* Shift Cash Bar */}
                    <div className="mt-2.5 p-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37]/10 via-[#0A0D14] to-cyan-950/20 border border-[#D4AF37]/30 flex items-center justify-between font-mono text-xs">
                      <div className="flex flex-col">
                        <span className="text-[9px] text-[#94A3B8] uppercase">कुल शिफ्ट संग्रह</span>
                        <span className="text-sm font-bold text-[#EDEDED] mt-0.5">₹{totalParkingCollected.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex items-center gap-3 text-right">
                        <div className="flex flex-col">
                          <span className="text-[9px] text-[#D4AF37] uppercase">मालिक नेट</span>
                          <span className="text-xs font-bold text-[#FFF4C2]">₹{ownerParkingShare.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex flex-col border-l border-white/[0.1] pl-3">
                          <span className="text-[9px] text-cyan-400 uppercase">रितिन कमीशन</span>
                          <span className="text-xs font-bold text-cyan-300">₹{ritinParkingCut.toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                    </div>
                  </header>

                  {/* Scrollable Parking Main */}
                  <main className="flex-1 w-full min-h-0 overflow-y-auto overscroll-contain px-4 pt-3 pb-4 deck-scrollbar flex flex-col gap-3.5">
                    {/* Fast Monthly Pass Issuance Card */}
                    <div className="p-3.5 rounded-2xl bg-[#0A0D14] border border-white/[0.08] shadow-lg flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-[#EDEDED] uppercase tracking-wider flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#22D3EE]" />
                          मासिक पास जारी करें (New Monthly Pass)
                        </span>
                        <span className="text-[10px] font-mono text-[#D4AF37] bg-[#D4AF37]/10 border border-[#D4AF37]/30 px-2 py-0.5 rounded-md">
                          ₹{pricing[newCategory].fee} / माह
                        </span>
                      </div>

                      {/* 4 Category Selector Pills */}
                      <div className="grid grid-cols-2 gap-2">
                        {(['car_small', 'car_large', 'heavy', 'tuktuk'] as VehicleCategory[]).map((cat) => {
                          const p = pricing[cat];
                          const isSelected = newCategory === cat;
                          return (
                            <button
                              key={cat}
                              type="button"
                              onClick={() => setNewCategory(cat)}
                              className={`p-2 rounded-xl text-left border font-mono transition-all cursor-pointer ${
                                isSelected
                                  ? 'bg-[#0D1117] border-[#D4AF37]/40 shadow-[0_0_10px_rgba(212,175,55,0.15)] text-[#EDEDED]'
                                  : 'bg-white/[0.02] border-white/[0.06] text-[#94A3B8] hover:text-white'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold">{p.label}</span>
                                <span className="text-[10px] text-[#D4AF37]">₹{p.fee}</span>
                              </div>
                              <span className="text-[9px] text-[#94A3B8]">{p.subLabel}</span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Tuk-Tuk Dedicated EV Charger Sub-Meter Toggle */}
                      {newCategory === 'tuktuk' && (
                        <div className="p-2.5 rounded-xl bg-cyan-950/20 border border-cyan-500/30 flex flex-col gap-2">
                          <label className="flex items-center justify-between cursor-pointer">
                            <span className="text-[11px] font-mono font-semibold text-cyan-300 flex items-center gap-1.5">
                              <Zap className="w-3.5 h-3.5 text-cyan-400" />
                              ⚡ EV चार्जर सब-मीटर सुविधा जोड़ें
                            </span>
                            <input
                              type="checkbox"
                              checked={newHasEvFacility}
                              onChange={(e) => setNewHasEvFacility(e.target.checked)}
                              className="w-4 h-4 rounded border-cyan-500/50 text-cyan-500 focus:ring-0 bg-[#06080C] cursor-pointer"
                            />
                          </label>

                          {newHasEvFacility && (
                            <div className="flex items-center gap-2 pt-1 border-t border-cyan-500/20">
                              <span className="text-[10px] font-mono text-[#94A3B8] whitespace-nowrap">प्रारंभिक मीटर रीडिंग (kWh):</span>
                              <input
                                type="number"
                                value={newInitialEvReading}
                                onChange={(e) => setNewInitialEvReading(e.target.value)}
                                placeholder="e.g. 420"
                                className="flex-1 py-1 px-2.5 rounded-lg bg-[#06080C] border border-cyan-500/30 text-xs font-mono font-bold text-cyan-300 placeholder-[#64748B] focus:outline-none focus:border-cyan-400"
                              />
                            </div>
                          )}
                        </div>
                      )}

                      {/* Manual Slot Assignment & Vehicle Plate */}
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-mono text-[#94A3B8] uppercase mb-1">📍 स्लॉट / स्थान (Editable)</label>
                          <input
                            type="text"
                            value={newSlot}
                            onChange={(e) => setNewSlot(e.target.value)}
                            placeholder="e.g. P-04 / Open Yard"
                            className="w-full py-2 px-3 rounded-xl bg-[#06080C] border border-white/[0.08] text-xs font-mono font-bold text-amber-300 placeholder-[#64748B] focus:outline-none focus:border-[#D4AF37]"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-mono text-[#94A3B8] uppercase mb-1">गाड़ी नंबर (Plate)</label>
                          <input
                            type="text"
                            value={newVehicleNumber}
                            onChange={(e) => setNewVehicleNumber(e.target.value.toUpperCase())}
                            placeholder="UK 06 AB 1234"
                            className="w-full py-2 px-3 rounded-xl bg-[#06080C] border border-white/[0.08] text-xs font-mono font-bold uppercase text-[#EDEDED] placeholder-[#64748B] focus:outline-none focus:border-[#D4AF37]"
                          />
                        </div>
                      </div>

                      {/* Driver & Phone */}
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={newOwnerName}
                          onChange={(e) => setNewOwnerName(e.target.value)}
                          placeholder="मालिक / ड्राइवर का नाम"
                          className="w-full py-2 px-3 rounded-xl bg-[#06080C] border border-white/[0.08] text-xs font-mono text-[#EDEDED] placeholder-[#64748B] focus:outline-none focus:border-[#D4AF37]"
                        />
                        <input
                          type="tel"
                          value={newPhone}
                          onChange={(e) => setNewPhone(e.target.value)}
                          placeholder="मोबाइल नंबर (WhatsApp)"
                          className="w-full py-2 px-3 rounded-xl bg-[#06080C] border border-white/[0.08] text-xs font-mono text-[#EDEDED] placeholder-[#64748B] focus:outline-none focus:border-[#D4AF37]"
                        />
                      </div>

                      <button
                        type="button"
                        disabled={newVehicleNumber.trim().length < 3 || !newOwnerName.trim()}
                        onClick={handleIssueNewPass}
                        className={`w-full py-3 px-4 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(212,175,55,0.3)] ${
                          newVehicleNumber.trim().length >= 3 && newOwnerName.trim()
                            ? 'bg-[#D4AF37] hover:bg-[#E5C158] text-[#06080C] cursor-pointer active:scale-98'
                            : 'bg-white/[0.04] text-[#64748B] border border-white/[0.06] cursor-not-allowed opacity-50'
                        }`}
                      >
                        <Plus className="w-4 h-4" />
                        <span>₹{pricing[newCategory].fee} नकद प्राप्त & पास जारी करें</span>
                      </button>
                    </div>

                    {/* Search Bar */}
                    <div className="relative">
                      <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-2.5 pointer-events-none" />
                      <input
                        type="text"
                        value={parkingSearchQuery}
                        onChange={(e) => setParkingSearchQuery(e.target.value)}
                        placeholder="नंबर, नाम या स्लॉट खोजें..."
                        className="w-full py-2 pl-9 pr-3 rounded-xl bg-[#0A0D14] border border-white/[0.08] text-xs font-mono text-[#EDEDED] placeholder-[#64748B] focus:outline-none focus:border-[#D4AF37]"
                      />
                    </div>

                    {/* Active Subscribers Deck List */}
                    <div className="flex items-center justify-between px-1">
                      <span className="text-xs font-mono font-semibold text-[#EDEDED]">
                        पंजीकृत मासिक ग्राहक ({filteredSubscribers.length})
                      </span>
                      <span className="text-[10px] font-mono text-[#94A3B8]">
                        टैप करें: नवीनीकरण / EV मीटर
                      </span>
                    </div>

                    <div className="flex flex-col gap-2 pb-6">
                      {filteredSubscribers.map((sub) => {
                        const p = pricing[sub.category] || pricing.car_small;
                        const isDue = sub.passStatus === 'due';
                        const hasEv = sub.hasEvFacility;

                        return (
                          <div
                            key={sub.id}
                            onClick={() => handleOpenRenewalDrawer(sub)}
                            className="p-3.5 rounded-2xl bg-[#0A0D14] border border-white/[0.08] hover:border-[#D4AF37]/40 flex flex-col gap-2.5 cursor-pointer active:scale-98 transition-all"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 rounded-lg bg-white/[0.06] border border-white/[0.1] font-mono font-bold text-xs text-[#EDEDED]">
                                  {sub.vehicleNumber}
                                </span>
                                <span className="text-[10px] font-mono text-[#94A3B8]">
                                  {p.label}
                                </span>
                              </div>

                              {/* Field Presence Toggle */}
                              <button
                                type="button"
                                onClick={(e) => handleTogglePresence(sub.id, e)}
                                className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                                  sub.isParkedInside
                                    ? 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-400'
                                    : 'bg-white/[0.03] border border-white/[0.08] text-[#64748B]'
                                }`}
                              >
                                <span className={`w-1.5 h-1.5 rounded-full ${sub.isParkedInside ? 'bg-emerald-400 animate-pulse' : 'bg-[#64748B]'}`} />
                                <span>{sub.isParkedInside ? 'अंदर (Inside)' : 'बाहर (Outside)'}</span>
                              </button>
                            </div>

                            <div className="flex items-center justify-between text-xs font-mono">
                              <span className="text-[#CBD5E1] font-medium">{sub.ownerName}</span>
                              <span className="text-amber-300 font-bold bg-amber-950/30 px-2 py-0.5 rounded border border-amber-500/30">
                                📍 {sub.slot || 'Open Yard'}
                              </span>
                            </div>

                            <div className="pt-2 border-t border-white/[0.05] flex items-center justify-between text-[10px] font-mono">
                              <span className={isDue ? 'text-rose-400 font-bold' : 'text-emerald-400'}>
                                {isDue ? '⚠️ पास देय (Due)' : `सक्रिय (वैध: ${sub.validTillDate})`}
                              </span>

                              {hasEv ? (
                                <span className="text-cyan-300 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-500/30 flex items-center gap-1">
                                  ⚡ EV: {sub.lastEvReading} kWh {sub.evDueAmount && sub.evDueAmount > 0 ? `| बकाया ₹${sub.evDueAmount}` : ''}
                                </span>
                              ) : (
                                <span className="text-[#64748B]">मासिक: ₹{p.fee}</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </main>
                </>
              )}

              {/* Bottom Dock Navigation */}
              <nav className="shrink-0 w-full z-30 px-5 pt-2 pb-[max(12px,env(safe-area-inset-bottom,12px))] border-t border-white/[0.08] bg-[#06080C]/95 backdrop-blur-xl">
                <div className="grid grid-cols-2 gap-3 max-w-[340px] mx-auto">
                  <button
                    type="button"
                    onClick={() => setActiveModule('units')}
                    className={`py-2.5 px-3 rounded-2xl font-mono text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                      activeModule === 'units'
                        ? 'bg-[#0D1117] text-[#EDEDED] border border-[#D4AF37]/40 shadow-[0_2px_15px_rgba(212,175,55,0.2)]'
                        : 'text-[#94A3B8] hover:text-white border border-transparent'
                    }`}
                  >
                    <Building2 className="w-4 h-4 text-[#D4AF37]" />
                    <span>एस्टेट यूनिट्स (22)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveModule('parking')}
                    className={`py-2.5 px-3 rounded-2xl font-mono text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                      activeModule === 'parking'
                        ? 'bg-[#0D1117] text-[#EDEDED] border border-cyan-500/40 shadow-[0_2px_15px_rgba(6,182,212,0.2)]'
                        : 'text-[#94A3B8] hover:text-white border border-transparent'
                    }`}
                  >
                    <Car className="w-4 h-4 text-cyan-400" />
                    <span>पार्किंग गेट</span>
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                      {totalInside}
                    </span>
                  </button>
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ================= SUB-METER READING & CASH SPLIT DRAWER (ROOMS/SHOPS) ================= */}
        <AnimatePresence>
          {selectedUnit && (
            <>
              <motion.div
                key="drawer-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={handleCloseDrawer}
                className="absolute inset-0 bg-black/70 backdrop-blur-md z-40 cursor-pointer"
              />

              <motion.div
                key="drawer-sheet"
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 28, stiffness: 320 }}
                className="absolute bottom-0 inset-x-0 bg-[#0A0D14] border-t border-white/[0.12] rounded-t-[32px] p-5 pb-[max(24px,env(safe-area-inset-bottom,24px))] shadow-[0_-20px_50px_rgba(0,0,0,0.9)] z-50 gpu-layer flex flex-col select-none max-h-[85vh] overflow-y-auto deck-scrollbar"
              >
                <div className="w-10 h-1 rounded-full bg-white/20 mb-3 mx-auto shrink-0" />

                <div className="flex items-center justify-between pb-3 border-b border-white/[0.07]">
                  <div className="flex items-center gap-2.5">
                    <span className="px-2.5 py-1 rounded-xl bg-white/[0.06] border border-white/[0.1] font-mono font-bold text-sm text-[#EDEDED]">
                      {selectedUnit.name}
                    </span>
                    <div>
                      <h3 className="text-sm font-semibold text-[#EDEDED]">{selectedUnit.tenantName}</h3>
                      <span className="text-[10px] font-mono text-cyan-400">
                        दर: ₹{(selectedUnit.type === 'room' ? tariffs.room : tariffs.shop).toFixed(1)}/यूनिट
                      </span>
                    </div>
                  </div>
                  <button onClick={handleCloseDrawer} className="p-1.5 rounded-full bg-white/[0.05] hover:bg-white/[0.1] text-[#94A3B8] hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {receiptData ? (
                  <div className="flex flex-col py-2">
                    <div className="flex items-center gap-2.5 pb-3 border-b border-white/[0.08]">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-[#EDEDED]">भुगतान सफलतापूर्वक दर्ज!</h3>
                        <p className="text-[11px] font-mono text-[#94A3B8]">
                          कुल नकद: ₹{receiptData.totalCash.toLocaleString('en-IN')} // {receiptData.unitName}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3.5 p-3.5 rounded-2xl bg-[#06080C] border border-white/[0.08] font-mono text-[11px] leading-relaxed text-[#CBD5E1] whitespace-pre-wrap select-text">
                      {receiptData.rawText}
                    </div>

                    <div className="mt-4 flex flex-col gap-2.5">
                      <button
                        type="button"
                        onClick={handleCloseDrawer}
                        className="w-full py-3 px-4 rounded-xl bg-[#D4AF37] hover:bg-[#E5C158] text-[#06080C] font-mono font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(212,175,55,0.3)] active:scale-98 transition-all"
                      >
                        <Check className="w-4 h-4" />
                        <span>संपन्न / Done (Skip)</span>
                      </button>

                      <div className="grid grid-cols-2 gap-2.5">
                        <a
                          href={receiptData.whatsappUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="py-2.5 px-3 rounded-xl bg-emerald-950/50 hover:bg-emerald-900/60 border border-emerald-500/40 text-emerald-300 font-mono font-semibold text-[11px] flex items-center justify-center gap-1.5 cursor-pointer active:scale-98 transition-all text-center"
                        >
                          <MessageCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span>🟢 WhatsApp</span>
                        </a>
                        <a
                          href={receiptData.smsUrl}
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
                    <div className="grid grid-cols-2 p-1 bg-black/50 border border-white/[0.08] rounded-xl mt-3.5">
                      <button
                        type="button"
                        onClick={() => setDrawerTab('meter')}
                        className={`py-2 px-3 rounded-lg text-xs font-mono font-medium flex items-center justify-center gap-1.5 transition-all ${
                          drawerTab === 'meter'
                            ? 'bg-white/[0.08] text-[#FFF4C2] border border-[#D4AF37]/40 shadow-sm'
                            : 'text-[#94A3B8] hover:text-white'
                        }`}
                      >
                        <Zap className="w-3.5 h-3.5 text-cyan-400" />
                        <span>1. सब-मीटर रीडिंग</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setDrawerTab('payment')}
                        className={`py-2 px-3 rounded-lg text-xs font-mono font-medium flex items-center justify-center gap-1.5 transition-all ${
                          drawerTab === 'payment'
                            ? 'bg-white/[0.08] text-[#FFF4C2] border border-[#D4AF37]/40 shadow-sm'
                            : 'text-[#94A3B8] hover:text-white'
                        }`}
                      >
                        <Wallet className="w-3.5 h-3.5 text-[#D4AF37]" />
                        <span>2. नकद वसूली (Split)</span>
                      </button>
                    </div>

                    {drawerTab === 'meter' ? (
                      <div className="flex flex-col gap-3 pt-3">
                        <div className="grid grid-cols-2 gap-2.5">
                          <div className="p-3 rounded-2xl bg-[#06080C] border border-white/[0.08] flex flex-col justify-between">
                            <span className="text-[10px] font-mono text-[#64748B] uppercase">पिछली रीडिंग</span>
                            <div className="mt-2 flex items-baseline gap-1">
                              <span className="text-2xl font-mono font-bold text-[#CBD5E1]">{selectedUnit.lastReading}</span>
                              <span className="text-xs font-mono text-[#64748B]">kWh</span>
                            </div>
                          </div>

                          <div className={`p-3 rounded-2xl bg-white/[0.04] border flex flex-col justify-between ${
                            isLowerThanPrev ? 'border-rose-500/80' : 'border-[#D4AF37]/50'
                          }`}>
                            <span className="text-[10px] font-mono text-cyan-400 uppercase">वर्तमान रीडिंग</span>
                            <div className="mt-1 flex items-baseline gap-1">
                              <input
                                type="number"
                                value={currentReadingInput}
                                onChange={(e) => setCurrentReadingInput(e.target.value)}
                                placeholder="0000"
                                className="w-full bg-transparent text-xl font-mono font-bold text-cyan-300 focus:outline-none"
                              />
                              <span className="text-[10px] font-mono text-cyan-400/60">kWh</span>
                            </div>
                          </div>
                        </div>

                        <div className="p-3 rounded-2xl bg-gradient-to-r from-cyan-950/30 via-[#0A0D14] to-[#D4AF37]/10 border border-cyan-500/20 flex items-center justify-between font-mono">
                          <span className="text-xs text-[#94A3B8]">खपत: <strong className="text-cyan-300">{unitsConsumed}</strong> यूनिट</span>
                          <span className="text-sm font-bold text-[#FFF4C2]">देय बिल: ₹{electricityDue.toLocaleString('en-IN')}</span>
                        </div>

                        <div className="grid grid-cols-2 gap-2.5 pt-1">
                          <button
                            type="button"
                            disabled={!canSaveReading}
                            onClick={handleSaveReadingOnly}
                            className={`py-3 px-3 rounded-xl text-xs font-mono font-semibold text-center ${
                              canSaveReading
                                ? 'bg-cyan-950/60 text-cyan-300 border border-cyan-500/50 cursor-pointer'
                                : 'bg-white/[0.04] text-[#64748B] border border-white/[0.08] cursor-not-allowed'
                            }`}
                          >
                            केवल रीडिंग सेव करें
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (electricityDue > 0) setElecPaidInput(String(electricityDue));
                              setDrawerTab('payment');
                            }}
                            className="py-3 px-3 rounded-xl bg-[#D4AF37] hover:bg-[#E5C158] text-[#06080C] font-mono font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-[0_0_15px_rgba(212,175,55,0.3)] active:scale-98 transition-all"
                          >
                            <span>भुगतान दर्ज करें &rarr;</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-3 pt-3">
                        <div className="p-3 rounded-2xl bg-[#06080C] border border-[#D4AF37]/40 flex flex-col gap-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-mono font-bold text-[#FFF4C2]">किराया (Rent Box)</span>
                            <span className="text-xs font-mono text-amber-400 font-bold">बकाया: ₹{effectiveRentDue.toLocaleString('en-IN')}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono text-[#94A3B8]">जमा: ₹</span>
                            <input
                              type="number"
                              value={rentPaidInput}
                              onChange={(e) => setRentPaidInput(e.target.value)}
                              className="flex-1 py-1 px-2.5 rounded-xl bg-[#0D1117] border border-white/[0.1] text-sm font-mono font-bold text-[#EDEDED] focus:outline-none"
                            />
                          </div>
                        </div>

                        <div className="p-3 rounded-2xl bg-[#06080C] border border-cyan-500/40 flex flex-col gap-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-mono font-bold text-cyan-300">बिजली बिल (Electricity Box)</span>
                            <span className="text-xs font-mono text-cyan-300 font-bold">देय: ₹{electricityDue.toLocaleString('en-IN')}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono text-[#94A3B8]">जमा: ₹</span>
                            <input
                              type="number"
                              value={elecPaidInput}
                              onChange={(e) => setElecPaidInput(e.target.value)}
                              className="flex-1 py-1 px-2.5 rounded-xl bg-[#0D1117] border border-white/[0.1] text-sm font-mono font-bold text-cyan-300 focus:outline-none"
                            />
                          </div>
                        </div>

                        <button
                          type="button"
                          disabled={totalCashCollected <= 0}
                          onClick={handleRecordPayment}
                          className={`w-full py-3 px-4 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(212,175,55,0.3)] transition-all ${
                            totalCashCollected > 0
                              ? 'bg-[#D4AF37] hover:bg-[#E5C158] text-[#06080C] cursor-pointer active:scale-98'
                              : 'bg-white/[0.04] text-[#64748B] border border-white/[0.06] cursor-not-allowed opacity-50'
                          }`}
                        >
                          <Check className="w-4 h-4" />
                          <span>₹{totalCashCollected.toLocaleString('en-IN')} नकद जमा दर्ज करें</span>
                        </button>
                      </div>
                    )}
                  </>
                )}
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* ================= PARKING RENEWAL & EV SETTLEMENT DRAWER ================= */}
        <AnimatePresence>
          {selectedSubForRenewal && (
            <>
              <motion.div
                key="parking-renewal-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedSubForRenewal(null)}
                className="absolute inset-0 bg-black/70 backdrop-blur-md z-40 cursor-pointer"
              />

              <motion.div
                key="parking-renewal-sheet"
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 28, stiffness: 320 }}
                className="absolute bottom-0 inset-x-0 bg-[#0A0D14] border-t border-white/[0.12] rounded-t-[32px] p-5 pb-[max(24px,env(safe-area-inset-bottom,24px))] shadow-[0_-20px_50px_rgba(0,0,0,0.9)] z-50 gpu-layer flex flex-col select-none max-h-[85vh] overflow-y-auto deck-scrollbar"
              >
                <div className="w-10 h-1 rounded-full bg-white/20 mb-3 mx-auto shrink-0" />

                <div className="flex items-center justify-between pb-3 border-b border-white/[0.07]">
                  <div className="flex items-center gap-2.5">
                    <span className="px-2.5 py-1 rounded-xl bg-white/[0.06] border border-white/[0.1] font-mono font-bold text-sm text-[#EDEDED]">
                      {selectedSubForRenewal.vehicleNumber}
                    </span>
                    <div>
                      <h3 className="text-sm font-semibold text-[#EDEDED]">{selectedSubForRenewal.ownerName}</h3>
                      <span className="text-[10px] font-mono text-[#D4AF37]">
                        {pricing[selectedSubForRenewal.category]?.label || 'Commercial Vehicle'}
                      </span>
                    </div>
                  </div>
                  <button onClick={() => setSelectedSubForRenewal(null)} className="p-1.5 rounded-full bg-white/[0.05] hover:bg-white/[0.1] text-[#94A3B8] hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Editable Slot */}
                <div className="pt-3 flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  <span className="text-[10px] font-mono text-[#94A3B8] uppercase">📍 स्लॉट / स्थान (Editable):</span>
                  <input
                    type="text"
                    value={renewalSlot}
                    onChange={(e) => setRenewalSlot(e.target.value)}
                    className="py-1 px-2.5 rounded-lg bg-[#06080C] border border-white/[0.12] text-xs font-mono font-bold text-amber-300 focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div className="flex flex-col gap-3.5 pt-3">
                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="p-3 rounded-xl bg-[#06080C] border border-white/[0.06] flex flex-col">
                      <span className="text-[10px] font-mono text-[#64748B] uppercase">पिछला भुगतान</span>
                      <span className="text-xs font-mono font-bold text-[#EDEDED] mt-0.5">{selectedSubForRenewal.lastPaidDate}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-[#06080C] border border-white/[0.06] flex flex-col">
                      <span className="text-[10px] font-mono text-[#64748B] uppercase">वर्तमान वैधता</span>
                      <span className="text-xs font-mono font-bold text-amber-400 mt-0.5">{selectedSubForRenewal.validTillDate}</span>
                    </div>
                  </div>

                  {/* Monthly Fee & Split Box */}
                  {(() => {
                    const catPrice = pricing[selectedSubForRenewal.category] || pricing.car_small;
                    return (
                      <div className="p-3.5 rounded-2xl bg-[#06080C] border border-[#D4AF37]/40 flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-mono font-bold text-[#FFF4C2] uppercase">मासिक पास शुल्क (Monthly Pass)</span>
                          <span className="text-base font-mono font-bold text-[#FFF4C2]">₹{catPrice.fee}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <div className="p-2 rounded-xl bg-[#0D1117] border border-[#D4AF37]/20 flex flex-col">
                            <span className="text-[9px] text-[#D4AF37] uppercase font-semibold">मालिक हिस्सा (Master)</span>
                            <span className="text-xs font-bold text-[#EDEDED] mt-0.5">₹{catPrice.owner}</span>
                          </div>
                          <div className="p-2 rounded-xl bg-[#0D1117] border border-cyan-500/20 flex flex-col">
                            <span className="text-[9px] text-cyan-400 uppercase font-semibold">रितिन कमीशन (Cut)</span>
                            <span className="text-xs font-bold text-cyan-300 mt-0.5">₹{catPrice.ritin}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 pt-1 border-t border-white/[0.06]">
                          <span className="text-xs font-mono text-[#94A3B8]">पास राशि प्राप्त: ₹</span>
                          <input
                            type="number"
                            value={renewalPassPaid}
                            onChange={(e) => setRenewalPassPaid(e.target.value)}
                            className="flex-1 py-1 px-2 rounded-lg bg-[#0D1117] border border-white/[0.1] text-xs font-mono font-bold text-[#EDEDED] focus:outline-none focus:border-[#D4AF37]"
                          />
                        </div>
                      </div>
                    );
                  })()}

                  {/* Tuk-Tuk Dedicated EV Sub-Meter */}
                  {selectedSubForRenewal.hasEvFacility && (
                    <div className="p-3.5 rounded-2xl bg-[#06080C] border border-cyan-500/40 flex flex-col gap-2.5">
                      <div className="flex items-center justify-between pb-1 border-b border-cyan-500/20">
                        <span className="text-xs font-mono font-bold text-cyan-300 uppercase flex items-center gap-1.5">
                          <Zap className="w-3.5 h-3.5 text-cyan-400" />
                          ⚡ ई-रिक्शा सब-मीटर रीडिंग
                        </span>
                        <span className="text-[10px] font-mono text-cyan-400">@ ₹{tariffs.tuktuk.toFixed(1)}/यूनिट</span>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="p-2.5 rounded-xl bg-[#0D1117] border border-white/[0.08] flex flex-col">
                          <span className="text-[9px] font-mono text-[#64748B] uppercase">पिछली रीडिंग</span>
                          <span className="text-sm font-mono font-bold text-[#EDEDED] mt-0.5">{selectedSubForRenewal.lastEvReading || 0} kWh</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-[#0D1117] border border-cyan-500/30 flex flex-col">
                          <span className="text-[9px] font-mono text-cyan-400 uppercase">वर्तमान रीडिंग</span>
                          <input
                            type="number"
                            value={renewalEvCurrReading}
                            onChange={(e) => setRenewalEvCurrReading(e.target.value)}
                            placeholder="0000"
                            className="w-full bg-transparent text-sm font-mono font-bold text-cyan-300 focus:outline-none mt-0.5"
                          />
                        </div>
                      </div>

                      <div className="flex flex-col gap-1 pt-1 border-t border-cyan-500/20">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-cyan-300">चार्जिंग नकद जमा: ₹</span>
                          <input
                            type="number"
                            value={renewalEvPaid}
                            onChange={(e) => setRenewalEvPaid(e.target.value)}
                            placeholder="0"
                            className="flex-1 py-1 px-2 rounded-lg bg-[#0D1117] border border-cyan-500/30 text-xs font-mono font-bold text-cyan-300 focus:outline-none"
                          />
                        </div>
                        <span className="text-[10px] font-mono text-amber-400">
                          पिछला बकाया: ₹{selectedSubForRenewal.evDueAmount || 0} (आंशिक जमा संभव)
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => setSelectedSubForRenewal(null)}
                      className="py-3 px-4 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-[#94A3B8] hover:text-white text-xs font-mono font-semibold cursor-pointer active:scale-98 transition-all text-center"
                    >
                      रद्द करें (Cancel)
                    </button>
                    <button
                      type="button"
                      onClick={handleRenewPass}
                      className="py-3 px-4 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-lg active:scale-98 bg-[#D4AF37] hover:bg-[#E5C158] text-[#06080C] border border-[#FFF4C2]/40 shadow-[0_0_20px_rgba(212,175,55,0.3)]"
                    >
                      <Check className="w-4 h-4" />
                      <span>नवीनीकरण दर्ज करें</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* ================= MONTHLY PASS DIGITAL RECEIPT MODAL ================= */}
        <AnimatePresence>
          {activeMonthlyReceipt && (
            <>
              <motion.div
                key="monthly-receipt-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setActiveMonthlyReceipt(null)}
                className="absolute inset-0 bg-black/75 backdrop-blur-md z-50 cursor-pointer"
              />
              <motion.div
                key="monthly-receipt-modal"
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ duration: 0.2 }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-sm bg-[#0A0D14] border border-[#D4AF37]/40 rounded-3xl p-5 shadow-[0_20px_50px_rgba(0,0,0,0.9)] z-50 flex flex-col gap-3 font-mono"
              >
                <div className="flex items-center gap-2.5 pb-2 border-b border-white/[0.08]">
                  <div className="w-8 h-8 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/40 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-[#D4AF37]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-[#EDEDED]">मासिक पार्किंग रसीद (Monthly Pass)</h3>
                    <span className="text-[10px] text-emerald-400 font-bold">नकद प्राप्त दर्ज (सफल)</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#06080C] border border-white/[0.08] text-[11px] leading-relaxed text-[#CBD5E1] whitespace-pre-wrap select-text">
                  {activeMonthlyReceipt.rawText}
                </div>

                <div className="p-2 rounded-xl bg-white/[0.02] border border-white/[0.04] text-[10px] text-center text-[#94A3B8]">
                  मालिक नेट: <strong className="text-[#D4AF37]">₹{activeMonthlyReceipt.ownerNet}</strong> | रितिन कमीशन: <strong className="text-cyan-300">₹{activeMonthlyReceipt.ritinCut}</strong>
                </div>

                <div className="flex flex-col gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setActiveMonthlyReceipt(null)}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#D4AF37] hover:bg-[#E5C158] text-[#06080C] font-mono font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(212,175,55,0.3)] active:scale-98 transition-all"
                  >
                    <Check className="w-4 h-4" />
                    <span>संपन्न / Done (Skip)</span>
                  </button>
                  <div className="grid grid-cols-2 gap-2">
                    <a
                      href={activeMonthlyReceipt.whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2 px-3 rounded-xl bg-emerald-950/50 hover:bg-emerald-900/60 border border-emerald-500/40 text-emerald-300 font-mono font-semibold text-[11px] flex items-center justify-center gap-1.5 cursor-pointer active:scale-98 transition-all text-center"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                      <span>🟢 WhatsApp</span>
                    </a>
                    <a
                      href={activeMonthlyReceipt.smsUrl}
                      className="py-2 px-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 text-slate-200 font-mono font-semibold text-[11px] flex items-center justify-center gap-1.5 cursor-pointer active:scale-98 transition-all text-center"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-cyan-300" />
                      <span>💬 SMS रसीद</span>
                    </a>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* ================= OWNER MASTER OVERRIDE MODAL (PIN: 1912 ONLY) ================= */}
        <AnimatePresence>
          {isMasterOverrideOpen && (
            <>
              <motion.div
                key="master-override-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMasterOverrideOpen(false)}
                className="absolute inset-0 bg-black/80 backdrop-blur-md z-50 cursor-pointer"
              />
              <motion.div
                key="master-override-modal"
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ duration: 0.2 }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[92%] max-w-sm bg-[#0A0D14] border border-[#D4AF37]/50 rounded-3xl p-5 shadow-[0_25px_60px_rgba(0,0,0,0.95)] z-50 flex flex-col gap-3 font-mono max-h-[90vh] overflow-y-auto deck-scrollbar"
              >
                <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/50 flex items-center justify-center text-[#D4AF37] font-bold text-sm">
                      ⚙️
                    </span>
                    <div>
                      <h3 className="text-sm font-bold text-[#FFF4C2]">Master Control Panel</h3>
                      <span className="text-[10px] text-[#D4AF37]">मालिक विशेष अधिकार (PIN: 1912)</span>
                    </div>
                  </div>
                  <button onClick={() => setIsMasterOverrideOpen(false)} className="p-1.5 rounded-full bg-white/[0.05] hover:bg-white/[0.1] text-[#94A3B8] hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* 1. Electricity Tariffs */}
                <div className="p-3 rounded-2xl bg-[#06080C] border border-white/[0.08] flex flex-col gap-2">
                  <span className="text-xs font-bold text-cyan-300 uppercase flex items-center gap-1">
                    ⚡ बिजली दरें (Tariffs ₹/यूनिट)
                  </span>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <label className="block text-[9px] text-[#94A3B8]">कमरा (Rooms)</label>
                      <input
                        type="number"
                        step="0.5"
                        value={tariffs.room}
                        onChange={(e) => setTariffs((t) => ({ ...t, room: parseFloat(e.target.value) || t.room }))}
                        className="w-full py-1 px-2 rounded-lg bg-[#0D1117] border border-white/[0.1] font-bold text-cyan-300 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] text-[#94A3B8]">दुकान (Shops)</label>
                      <input
                        type="number"
                        step="0.5"
                        value={tariffs.shop}
                        onChange={(e) => setTariffs((t) => ({ ...t, shop: parseFloat(e.target.value) || t.shop }))}
                        className="w-full py-1 px-2 rounded-lg bg-[#0D1117] border border-white/[0.1] font-bold text-cyan-300 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] text-[#94A3B8]">ई-रिक्शा (EV)</label>
                      <input
                        type="number"
                        step="0.5"
                        value={tariffs.tuktuk}
                        onChange={(e) => setTariffs((t) => ({ ...t, tuktuk: parseFloat(e.target.value) || t.tuktuk }))}
                        className="w-full py-1 px-2 rounded-lg bg-[#0D1117] border border-white/[0.1] font-bold text-cyan-300 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Category Fees & Splits */}
                <div className="p-3 rounded-2xl bg-[#06080C] border border-[#D4AF37]/30 flex flex-col gap-2.5">
                  <span className="text-xs font-bold text-[#FFF4C2] uppercase flex items-center gap-1">
                    🅿️ पार्किंग शुल्क व कमीशन (4 Categories)
                  </span>
                  {(['car_small', 'car_large', 'heavy', 'tuktuk'] as VehicleCategory[]).map((cat) => {
                    const p = pricing[cat];
                    return (
                      <div key={cat} className="p-2 rounded-xl bg-white/[0.02] border border-white/[0.04] flex flex-col gap-1 text-[11px]">
                        <span className="font-bold text-[#EDEDED]">{p.label}</span>
                        <div className="grid grid-cols-3 gap-1.5 text-[10px]">
                          <div>
                            <span className="text-[#64748B]">मासिक: ₹</span>
                            <input
                              type="number"
                              value={p.fee}
                              onChange={(e) => {
                                const val = parseInt(e.target.value, 10) || 0;
                                setPricing((prev) => ({ ...prev, [cat]: { ...prev[cat], fee: val } }));
                              }}
                              className="w-full py-0.5 px-1.5 rounded bg-[#0D1117] border border-white/[0.1] text-[#EDEDED]"
                            />
                          </div>
                          <div>
                            <span className="text-[#D4AF37]">मालिक: ₹</span>
                            <input
                              type="number"
                              value={p.owner}
                              onChange={(e) => {
                                const val = parseInt(e.target.value, 10) || 0;
                                setPricing((prev) => ({ ...prev, [cat]: { ...prev[cat], owner: val } }));
                              }}
                              className="w-full py-0.5 px-1.5 rounded bg-[#0D1117] border border-white/[0.1] text-[#EDEDED]"
                            />
                          </div>
                          <div>
                            <span className="text-cyan-300">रितिन: ₹</span>
                            <input
                              type="number"
                              value={p.ritin}
                              onChange={(e) => {
                                const val = parseInt(e.target.value, 10) || 0;
                                setPricing((prev) => ({ ...prev, [cat]: { ...prev[cat], ritin: val } }));
                              }}
                              className="w-full py-0.5 px-1.5 rounded bg-[#0D1117] border border-white/[0.1] text-[#EDEDED]"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* 3. Unit Rent & Arrears Adjustment */}
                <div className="p-3 rounded-2xl bg-[#06080C] border border-white/[0.08] flex flex-col gap-2">
                  <span className="text-xs font-bold text-[#EDEDED] uppercase">🏢 यूनिट किराया व बकाया समायोजन</span>
                  <select
                    value={overrideSelectedUnitId}
                    onChange={(e) => {
                      const id = e.target.value;
                      setOverrideSelectedUnitId(id);
                      const u = units.find((x) => x.id === id);
                      if (u) {
                        setOverrideUnitRent(String(u.rentAmount));
                        setOverrideUnitDue(String(u.rentDueAmount));
                      }
                    }}
                    className="w-full py-1.5 px-2 rounded-xl bg-[#0D1117] border border-white/[0.1] text-xs font-mono text-[#EDEDED] focus:outline-none"
                  >
                    {units.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} - {u.isOccupied ? u.tenantName : '(रिक्त)'}
                      </option>
                    ))}
                  </select>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <label className="block text-[9px] text-[#94A3B8]">मासिक किराया (₹)</label>
                      <input
                        type="number"
                        value={overrideUnitRent}
                        onChange={(e) => setOverrideUnitRent(e.target.value)}
                        className="w-full py-1 px-2 rounded-lg bg-[#0D1117] border border-white/[0.1] font-bold text-[#EDEDED]"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] text-[#94A3B8]">कुल बकाया (₹)</label>
                      <input
                        type="number"
                        value={overrideUnitDue}
                        onChange={(e) => setOverrideUnitDue(e.target.value)}
                        className="w-full py-1 px-2 rounded-lg bg-[#0D1117] border border-white/[0.1] font-bold text-amber-400"
                      />
                    </div>
                  </div>
                </div>

                {/* 4. Parking Subscriber Balance & Slot Adjustment */}
                <div className="p-3 rounded-2xl bg-[#06080C] border border-white/[0.08] flex flex-col gap-2">
                  <span className="text-xs font-bold text-[#EDEDED] uppercase">🅿️ पार्किंग ग्राहक व स्लॉट समायोजन</span>
                  <select
                    value={overrideSelectedSubId}
                    onChange={(e) => {
                      const id = e.target.value;
                      setOverrideSelectedSubId(id);
                      const s = subscribers.find((x) => x.id === id);
                      if (s) {
                        setOverrideSubSlot(s.slot || 'General');
                        setOverrideSubEvDue(String(s.evDueAmount || 0));
                      }
                    }}
                    className="w-full py-1.5 px-2 rounded-xl bg-[#0D1117] border border-white/[0.1] text-xs font-mono text-[#EDEDED] focus:outline-none"
                  >
                    {subscribers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.vehicleNumber} - {s.ownerName} ({s.slot})
                      </option>
                    ))}
                  </select>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <label className="block text-[9px] text-[#94A3B8]">स्लॉट / स्थान</label>
                      <input
                        type="text"
                        value={overrideSubSlot}
                        onChange={(e) => setOverrideSubSlot(e.target.value)}
                        className="w-full py-1 px-2 rounded-lg bg-[#0D1117] border border-white/[0.1] font-bold text-amber-300"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] text-[#94A3B8]">EV बकाया (₹)</label>
                      <input
                        type="number"
                        value={overrideSubEvDue}
                        onChange={(e) => setOverrideSubEvDue(e.target.value)}
                        className="w-full py-1 px-2 rounded-lg bg-[#0D1117] border border-white/[0.1] font-bold text-cyan-300"
                      />
                    </div>
                  </div>
                </div>

                {/* Apply Button */}
                <button
                  type="button"
                  onClick={handleApplyMasterOverrides}
                  className="w-full py-3 px-4 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-2 cursor-pointer active:scale-98 transition-all bg-[#D4AF37] hover:bg-[#E5C158] text-[#06080C] shadow-[0_0_20px_rgba(212,175,55,0.3)] mt-1"
                >
                  <Check className="w-4 h-4" />
                  <span>परिवर्तन तुरंत लागू करें (Save Changes)</span>
                </button>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
