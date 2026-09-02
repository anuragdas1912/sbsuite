export type Role = 'owner' | 'manager';

export interface MasterConfig {
  id: string;
  elec_rate_per_unit: number; // default 9.0
  monthly_parking_fee: number; // default 700
  monthly_owner_cut: number; // default 500
  monthly_manager_cut: number; // default 200
  daily_parking_fee: number; // default 50
  daily_owner_ratio: number; // default 0.80 (80%)
  daily_manager_ratio: number; // default 0.20 (20%)
  updated_at?: string;
}

export interface PropertyUnit {
  id: string;
  type: 'room' | 'shop';
  unit_number: string;
  tenant_name: string;
  tenant_phone: string;
  base_rent: number;
  last_meter_reading: number;
  previous_arrears: number;
  is_occupied: boolean;
  created_at?: string;
}

export interface UtilityBill {
  id: string;
  unit_id: string;
  billing_month: string;
  prev_reading: number;
  curr_reading: number;
  units_consumed: number;
  unit_rate: number;
  electricity_total: number;
  base_rent: number;
  previous_arrears: number;
  total_amount_due: number;
  amount_paid: number;
  payment_mode?: 'cash' | 'upi' | 'mixed' | 'unpaid';
  payment_status: 'unpaid' | 'partial' | 'paid';
  meter_photo_url?: string;
  created_at?: string;
}

export interface ParkingSlot {
  id: string;
  slot_number: string;
  mode: 'monthly' | 'daily';
  vehicle_number: string;
  owner_name: string;
  owner_phone: string;
  valid_until?: string | null;
  is_occupied: boolean;
  fee: number;
  created_at?: string;
}

export interface DailyParkingLog {
  id: string;
  vehicle_number: string;
  vehicle_type?: string;
  in_time: string;
  out_time?: string | null;
  fee_charged: number;
  owner_cut: number;
  manager_cut: number;
  payment_mode: 'cash' | 'upi';
  status: 'parked' | 'completed';
  created_at?: string;
}

export interface Settlement {
  id: string;
  manager_id: string;
  manager_name: string;
  total_collected: number;
  manager_commission: number;
  net_to_owner: number;
  payment_breakdown?: {
    cash: number;
    upi: number;
  };
  status: 'pending' | 'settled';
  notes?: string;
  settled_at?: string | null;
  created_at?: string;
}
