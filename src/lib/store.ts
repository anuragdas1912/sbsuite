import { create } from 'zustand';
import { supabase } from './supabase';
import { 
  MasterConfig, 
  PropertyUnit, 
  UtilityBill, 
  ParkingSlot, 
  DailyParkingLog, 
  Settlement 
} from '@/types';

// Default initial master config
const DEFAULT_CONFIG: MasterConfig = {
  id: 'a0000000-0000-0000-0000-000000000001',
  elec_rate_per_unit: 9.0,
  monthly_parking_fee: 700.0,
  monthly_owner_cut: 500.0,
  monthly_manager_cut: 200.0,
  daily_parking_fee: 50.0,
  daily_owner_ratio: 0.80,
  daily_manager_ratio: 0.20,
};

// Default 14 Residential Rooms and 8 Commercial Shops
const DEFAULT_UNITS: PropertyUnit[] = [
  { id: 'u-r-101', type: 'room', unit_number: 'R-101', tenant_name: 'Rahul Sharma', tenant_phone: '9876543210', base_rent: 4500, last_meter_reading: 1240, previous_arrears: 0, is_occupied: true },
  { id: 'u-r-102', type: 'room', unit_number: 'R-102', tenant_name: 'Amit Kumar', tenant_phone: '9812345678', base_rent: 4500, last_meter_reading: 980, previous_arrears: 500, is_occupied: true },
  { id: 'u-r-103', type: 'room', unit_number: 'R-103', tenant_name: 'Vikram Singh', tenant_phone: '9711223344', base_rent: 4200, last_meter_reading: 1540, previous_arrears: 0, is_occupied: true },
  { id: 'u-r-104', type: 'room', unit_number: 'R-104', tenant_name: 'Suresh Verma', tenant_phone: '9988776655', base_rent: 4200, last_meter_reading: 890, previous_arrears: 0, is_occupied: true },
  { id: 'u-r-105', type: 'room', unit_number: 'R-105', tenant_name: 'Deepak Yadav', tenant_phone: '9871122334', base_rent: 4500, last_meter_reading: 1120, previous_arrears: 0, is_occupied: true },
  { id: 'u-r-106', type: 'room', unit_number: 'R-106', tenant_name: 'Pooja Tiwari', tenant_phone: '9899001122', base_rent: 4500, last_meter_reading: 670, previous_arrears: 0, is_occupied: true },
  { id: 'u-r-107', type: 'room', unit_number: 'R-107', tenant_name: 'Manoj Gupta', tenant_phone: '9811224466', base_rent: 4200, last_meter_reading: 1430, previous_arrears: 1200, is_occupied: true },
  { id: 'u-r-201', type: 'room', unit_number: 'R-201', tenant_name: 'Pankaj Mishra', tenant_phone: '9711335577', base_rent: 4800, last_meter_reading: 2100, previous_arrears: 0, is_occupied: true },
  { id: 'u-r-202', type: 'room', unit_number: 'R-202', tenant_name: 'Ravi Kant', tenant_phone: '9811998877', base_rent: 4800, last_meter_reading: 1750, previous_arrears: 0, is_occupied: true },
  { id: 'u-r-203', type: 'room', unit_number: 'R-203', tenant_name: 'Neeraj Joshi', tenant_phone: '9955443322', base_rent: 4600, last_meter_reading: 1320, previous_arrears: 0, is_occupied: true },
  { id: 'u-r-204', type: 'room', unit_number: 'R-204', tenant_name: 'Sanjay Rawat', tenant_phone: '9822334455', base_rent: 4600, last_meter_reading: 890, previous_arrears: 0, is_occupied: true },
  { id: 'u-r-205', type: 'room', unit_number: 'R-205', tenant_name: 'Anil Saxena', tenant_phone: '9911442255', base_rent: 4800, last_meter_reading: 1640, previous_arrears: 0, is_occupied: true },
  { id: 'u-r-206', type: 'room', unit_number: 'R-206', tenant_name: 'Rohit Patel', tenant_phone: '9877665544', base_rent: 4800, last_meter_reading: 1980, previous_arrears: 0, is_occupied: true },
  { id: 'u-r-207', type: 'room', unit_number: 'R-207', tenant_name: 'Vacant Room', tenant_phone: '', base_rent: 4500, last_meter_reading: 500, previous_arrears: 0, is_occupied: false },
  
  // 8 Commercial Shops
  { id: 'u-s-1', type: 'shop', unit_number: 'S-1', tenant_name: 'Balaji Grocery Store', tenant_phone: '9811002233', base_rent: 12000, last_meter_reading: 3450, previous_arrears: 0, is_occupied: true },
  { id: 'u-s-2', type: 'shop', unit_number: 'S-2', tenant_name: 'Shree Medical & Healthcare', tenant_phone: '9811334455', base_rent: 14000, last_meter_reading: 4120, previous_arrears: 0, is_occupied: true },
  { id: 'u-s-3', type: 'shop', unit_number: 'S-3', tenant_name: 'Super Hair Salon', tenant_phone: '9822446688', base_rent: 8500, last_meter_reading: 2180, previous_arrears: 1500, is_occupied: true },
  { id: 'u-s-4', type: 'shop', unit_number: 'S-4', tenant_name: 'Balaji Fast Food & Tea', tenant_phone: '9833557799', base_rent: 10000, last_meter_reading: 3890, previous_arrears: 0, is_occupied: true },
  { id: 'u-s-5', type: 'shop', unit_number: 'S-5', tenant_name: 'Sharma Stationary & Xerox', tenant_phone: '9844668800', base_rent: 8000, last_meter_reading: 1560, previous_arrears: 0, is_occupied: true },
  { id: 'u-s-6', type: 'shop', unit_number: 'S-6', tenant_name: 'City Dry Cleaners', tenant_phone: '9855779911', base_rent: 9500, last_meter_reading: 2870, previous_arrears: 0, is_occupied: true },
  { id: 'u-s-7', type: 'shop', unit_number: 'S-7', tenant_name: 'Mobile Care & Recharge', tenant_phone: '9866880022', base_rent: 9000, last_meter_reading: 1940, previous_arrears: 0, is_occupied: true },
  { id: 'u-s-8', type: 'shop', unit_number: 'S-8', tenant_name: 'Vacant Commercial Shop', tenant_phone: '', base_rent: 11000, last_meter_reading: 1000, previous_arrears: 0, is_occupied: false },
];

const DEFAULT_PARKING: ParkingSlot[] = [
  { id: 'p-1', slot_number: 'P-01', mode: 'monthly', vehicle_number: 'DL 3C AB 1234', owner_name: 'Rahul Sharma (R-101)', owner_phone: '9876543210', valid_until: '2026-09-28', is_occupied: true, fee: 700 },
  { id: 'p-2', slot_number: 'P-02', mode: 'monthly', vehicle_number: 'HR 26 DQ 5678', owner_name: 'Balaji Grocery (S-1)', owner_phone: '9811002233', valid_until: '2026-09-21', is_occupied: true, fee: 700 },
  { id: 'p-3', slot_number: 'P-03', mode: 'monthly', vehicle_number: 'UP 16 X 9012', owner_name: 'Vikram Singh (R-103)', owner_phone: '9711223344', valid_until: '2026-09-08', is_occupied: true, fee: 700 },
  { id: 'p-4', slot_number: 'P-04', mode: 'monthly', vehicle_number: 'DL 8S CJ 3456', owner_name: 'Medical Store (S-2)', owner_phone: '9811334455', valid_until: '2026-09-01', is_occupied: true, fee: 700 },
  { id: 'p-5', slot_number: 'P-05', mode: 'monthly', vehicle_number: '', owner_name: '', owner_phone: '', valid_until: null, is_occupied: false, fee: 700 },
  { id: 'p-6', slot_number: 'P-06', mode: 'daily', vehicle_number: '', owner_name: '', owner_phone: '', valid_until: null, is_occupied: false, fee: 50 },
  { id: 'p-7', slot_number: 'P-07', mode: 'daily', vehicle_number: '', owner_name: '', owner_phone: '', valid_until: null, is_occupied: false, fee: 50 },
  { id: 'p-8', slot_number: 'P-08', mode: 'daily', vehicle_number: '', owner_name: '', owner_phone: '', valid_until: null, is_occupied: false, fee: 50 },
  { id: 'p-9', slot_number: 'P-09', mode: 'daily', vehicle_number: '', owner_name: '', owner_phone: '', valid_until: null, is_occupied: false, fee: 50 },
  { id: 'p-10', slot_number: 'P-10', mode: 'daily', vehicle_number: '', owner_name: '', owner_phone: '', valid_until: null, is_occupied: false, fee: 50 },
];

interface AppState {
  // State
  config: MasterConfig;
  units: PropertyUnit[];
  bills: UtilityBill[];
  parkingSlots: ParkingSlot[];
  dailyParkingLogs: DailyParkingLog[];
  settlements: Settlement[];
  isLoading: boolean;
  isOnline: boolean;
  selectedMonth: string;

  // Actions
  fetchInitialData: () => Promise<void>;
  setSelectedMonth: (month: string) => void;
  updateMasterConfig: (newConfig: Partial<MasterConfig>) => Promise<void>;
  updateUnit: (unitId: string, updates: Partial<PropertyUnit>) => Promise<void>;
  
  // Billing & Electricity
  recordMeterReadingAndBill: (params: {
    unit_id: string;
    billing_month: string;
    prev_reading: number;
    curr_reading: number;
    base_rent: number;
    previous_arrears: number;
    amount_paid: number;
    payment_mode: 'cash' | 'upi';
    meter_photo_url?: string;
  }) => Promise<{ bill: UtilityBill; carriedArrears: number }>;

  // Parking
  recordDailyParking: (params: {
    slot_number?: string;
    vehicle_number: string;
    vehicle_type?: string;
    payment_mode: 'cash' | 'upi';
  }) => Promise<DailyParkingLog>;

  renewMonthlyParking: (params: {
    slot_id: string;
    vehicle_number: string;
    owner_name: string;
    owner_phone: string;
    payment_mode: 'cash' | 'upi';
  }) => Promise<ParkingSlot>;

  // Handover & Settlement
  settleHandover: (notes?: string) => Promise<Settlement>;

  // Computed Telemetry
  getManagerEarningsSummary: () => {
    todayEarnings: number;
    monthEarnings: number;
    monthlyPassCount: number;
    dailyCount: number;
    cashInHand: number;
    netToOwner: number;
  };
}

// LocalStorage helpers
const loadFromStorage = <T>(key: string, fallback: T): T => {
  if (typeof window === 'undefined') return fallback;
  try {
    const item = localStorage.getItem(`sbsuite_${key}`);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
};

const saveToStorage = <T>(key: string, data: T) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`sbsuite_${key}`, JSON.stringify(data));
  } catch (err) {
    console.error('Storage error:', err);
  }
};

export const useAppStore = create<AppState>((set, get) => ({
  config: DEFAULT_CONFIG,
  units: DEFAULT_UNITS,
  bills: [],
  parkingSlots: DEFAULT_PARKING,
  dailyParkingLogs: [],
  settlements: [],
  isLoading: true,
  isOnline: true,
  selectedMonth: new Date().toLocaleString('en-US', { month: 'short', year: 'numeric' }),

  setSelectedMonth: (month) => set({ selectedMonth: month }),

  fetchInitialData: async () => {
    set({ isLoading: true });
    
    // 1. First hydrate from local cache immediately for zero-lag startup
    const cachedConfig = loadFromStorage('config', DEFAULT_CONFIG);
    const cachedUnits = loadFromStorage('units', DEFAULT_UNITS);
    const cachedBills = loadFromStorage('bills', []);
    const cachedParking = loadFromStorage('parking', DEFAULT_PARKING);
    const cachedDaily = loadFromStorage('daily_parking', []);
    const cachedSettlements = loadFromStorage('settlements', []);

    set({
      config: cachedConfig,
      units: cachedUnits,
      bills: cachedBills,
      parkingSlots: cachedParking,
      dailyParkingLogs: cachedDaily,
      settlements: cachedSettlements,
    });

    // 2. Fetch fresh data from Supabase in background
    try {
      const [
        { data: configData },
        { data: unitsData },
        { data: billsData },
        { data: slotsData },
        { data: dailyData },
        { data: settlementsData },
      ] = await Promise.all([
        supabase.from('master_config').select('*').limit(1).maybeSingle(),
        supabase.from('properties_units').select('*').order('unit_number'),
        supabase.from('utility_bills').select('*').order('created_at', { ascending: false }),
        supabase.from('parking_slots').select('*').order('slot_number'),
        supabase.from('daily_parking_logs').select('*').order('in_time', { ascending: false }),
        supabase.from('settlements').select('*').order('created_at', { ascending: false }),
      ]);

      const config = configData ? { ...DEFAULT_CONFIG, ...configData } : cachedConfig;
      const units = unitsData && unitsData.length > 0 ? unitsData : cachedUnits;
      const bills = billsData || cachedBills;
      const parkingSlots = slotsData && slotsData.length > 0 ? slotsData : cachedParking;
      const dailyParkingLogs = dailyData || cachedDaily;
      const settlements = settlementsData || cachedSettlements;

      // Update store & local cache
      set({
        config,
        units,
        bills,
        parkingSlots,
        dailyParkingLogs,
        settlements,
        isLoading: false,
        isOnline: true,
      });

      saveToStorage('config', config);
      saveToStorage('units', units);
      saveToStorage('bills', bills);
      saveToStorage('parking', parkingSlots);
      saveToStorage('daily_parking', dailyParkingLogs);
      saveToStorage('settlements', settlements);
    } catch (err) {
      console.warn('Network sync offline or Supabase connecting, using robust local state:', err);
      set({ isLoading: false, isOnline: false });
    }
  },

  updateMasterConfig: async (newConfig) => {
    const updated = { ...get().config, ...newConfig, updated_at: new Date().toISOString() };
    set({ config: updated });
    saveToStorage('config', updated);

    try {
      await supabase.from('master_config').upsert(updated);
    } catch (err) {
      console.error('Failed to sync master config to Supabase:', err);
    }
  },

  updateUnit: async (unitId, updates) => {
    const updatedUnits = get().units.map((u) => (u.id === unitId ? { ...u, ...updates } : u));
    set({ units: updatedUnits });
    saveToStorage('units', updatedUnits);

    try {
      await supabase.from('properties_units').update(updates).eq('id', unitId);
    } catch (err) {
      console.error('Failed to update unit in Supabase:', err);
    }
  },

  recordMeterReadingAndBill: async ({
    unit_id,
    billing_month,
    prev_reading,
    curr_reading,
    base_rent,
    previous_arrears,
    amount_paid,
    payment_mode,
    meter_photo_url,
  }) => {
    const { config, units, bills } = get();
    const unitRate = config.elec_rate_per_unit || 9.0;
    
    // Core Utility & Rent Math
    const unitsConsumed = Math.max(0, curr_reading - prev_reading);
    const electricityTotal = Math.round(unitsConsumed * unitRate);
    const totalAmountDue = Math.round(base_rent + electricityTotal + previous_arrears);
    
    const paymentStatus = 
      amount_paid >= totalAmountDue ? 'paid' : 
      amount_paid > 0 ? 'partial' : 'unpaid';

    // Calculate carry forward arrears for subsequent month
    const carriedArrears = Math.max(0, totalAmountDue - amount_paid);

    const newBill: UtilityBill = {
      id: 'bill_' + Math.random().toString(36).substring(2, 9),
      unit_id,
      billing_month,
      prev_reading,
      curr_reading,
      units_consumed: unitsConsumed,
      unit_rate: unitRate,
      electricity_total: electricityTotal,
      base_rent,
      previous_arrears,
      total_amount_due: totalAmountDue,
      amount_paid,
      payment_mode: amount_paid > 0 ? payment_mode : 'unpaid',
      payment_status: paymentStatus,
      meter_photo_url,
      created_at: new Date().toISOString(),
    };

    // Update Bills and Unit readings/arrears
    const updatedBills = [newBill, ...bills.filter(b => !(b.unit_id === unit_id && b.billing_month === billing_month))];
    const updatedUnits = units.map((u) => 
      u.id === unit_id 
        ? { ...u, last_meter_reading: curr_reading, previous_arrears: carriedArrears } 
        : u
    );

    set({ bills: updatedBills, units: updatedUnits });
    saveToStorage('bills', updatedBills);
    saveToStorage('units', updatedUnits);

    // Sync to Supabase
    try {
      await supabase.from('utility_bills').insert(newBill);
      await supabase.from('properties_units').update({
        last_meter_reading: curr_reading,
        previous_arrears: carriedArrears,
      }).eq('id', unit_id);
    } catch (err) {
      console.warn('Stored bill locally, Supabase sync deferred:', err);
    }

    return { bill: newBill, carriedArrears };
  },

  recordDailyParking: async ({ slot_number, vehicle_number, vehicle_type = '4-wheeler', payment_mode }) => {
    const { config, dailyParkingLogs } = get();
    const fee = config.daily_parking_fee || 50;
    const ownerCut = Math.round(fee * config.daily_owner_ratio);
    const managerCut = Math.round(fee * config.daily_manager_ratio);

    const newLog: DailyParkingLog = {
      id: 'park_' + Math.random().toString(36).substring(2, 9),
      vehicle_number: vehicle_number.toUpperCase().trim(),
      vehicle_type,
      in_time: new Date().toISOString(),
      fee_charged: fee,
      owner_cut: ownerCut,
      manager_cut: managerCut,
      payment_mode,
      status: 'parked',
      created_at: new Date().toISOString(),
    };

    const updatedLogs = [newLog, ...dailyParkingLogs];
    set({ dailyParkingLogs: updatedLogs });
    saveToStorage('daily_parking', updatedLogs);

    try {
      await supabase.from('daily_parking_logs').insert(newLog);
    } catch (err) {
      console.warn('Stored daily parking log locally:', err);
    }

    return newLog;
  },

  renewMonthlyParking: async ({ slot_id, vehicle_number, owner_name, owner_phone, payment_mode }) => {
    const { config, parkingSlots } = get();
    const fee = config.monthly_parking_fee || 700;
    
    // Set expiry 30 days ahead from today
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30);
    const validUntil = expiryDate.toISOString().split('T')[0];

    const updatedSlots = parkingSlots.map((slot) => {
      if (slot.id === slot_id) {
        return {
          ...slot,
          vehicle_number: vehicle_number.toUpperCase().trim(),
          owner_name,
          owner_phone,
          valid_until: validUntil,
          is_occupied: true,
          fee,
        };
      }
      return slot;
    });

    set({ parkingSlots: updatedSlots });
    saveToStorage('parking', updatedSlots);

    try {
      await supabase.from('parking_slots').update({
        vehicle_number: vehicle_number.toUpperCase().trim(),
        owner_name,
        owner_phone,
        valid_until: validUntil,
        is_occupied: true,
        fee,
      }).eq('id', slot_id);
    } catch (err) {
      console.warn('Stored monthly parking locally:', err);
    }

    const matched = updatedSlots.find((s) => s.id === slot_id)!;
    return matched;
  },

  settleHandover: async (notes = '') => {
    const summary = get().getManagerEarningsSummary();
    
    const newSettlement: Settlement = {
      id: 'set_' + Math.random().toString(36).substring(2, 9),
      manager_id: 'ritin',
      manager_name: 'Ritin',
      total_collected: summary.cashInHand + summary.todayEarnings,
      manager_commission: summary.todayEarnings,
      net_to_owner: summary.netToOwner,
      status: 'settled',
      notes,
      settled_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };

    const updatedSettlements = [newSettlement, ...get().settlements];
    set({ settlements: updatedSettlements });
    saveToStorage('settlements', updatedSettlements);

    try {
      await supabase.from('settlements').insert(newSettlement);
    } catch (err) {
      console.warn('Stored settlement locally:', err);
    }

    return newSettlement;
  },

  getManagerEarningsSummary: () => {
    const { config, bills, dailyParkingLogs, parkingSlots } = get();
    
    const todayStr = new Date().toISOString().split('T')[0];
    
    // Daily parking today
    const dailyToday = dailyParkingLogs.filter(
      (l) => l.in_time && l.in_time.startsWith(todayStr)
    );
    const dailyManagerEarning = dailyToday.reduce((acc, l) => acc + (l.manager_cut || 10), 0);
    const dailyTotalCollection = dailyToday.reduce((acc, l) => acc + (l.fee_charged || 50), 0);
    
    // Monthly passes active/paid (Ritin earns monthly_manager_cut per active monthly pass)
    const activeMonthlyPasses = parkingSlots.filter((s) => s.mode === 'monthly' && s.is_occupied).length;
    const monthlyManagerEarning = activeMonthlyPasses * (config.monthly_manager_cut || 200);

    // Total today's earnings for Ritin ("Aaj Ki Meri Kamai")
    const todayEarnings = dailyManagerEarning + (activeMonthlyPasses > 0 ? (config.monthly_manager_cut || 200) : 0);
    const monthEarnings = monthlyManagerEarning + dailyParkingLogs.reduce((acc, l) => acc + (l.manager_cut || 10), 0);

    // Total cash collections in hand from rent + daily parking
    const cashBills = bills.filter((b) => b.payment_mode === 'cash').reduce((acc, b) => acc + b.amount_paid, 0);
    const cashDailyParking = dailyParkingLogs.filter((l) => l.payment_mode === 'cash').reduce((acc, l) => acc + l.fee_charged, 0);
    const totalCashCollected = cashBills + cashDailyParking;
    
    const netToOwner = Math.max(0, totalCashCollected - todayEarnings);

    return {
      todayEarnings,
      monthEarnings,
      monthlyPassCount: activeMonthlyPasses,
      dailyCount: dailyToday.length,
      cashInHand: totalCashCollected,
      netToOwner,
    };
  },
}));
