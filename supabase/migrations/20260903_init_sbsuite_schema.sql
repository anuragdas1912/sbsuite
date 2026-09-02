-- =====================================================================
-- SB SUITE OS - MASTER DATABASE SCHEMA & SEED DATA
-- Target: Shree Balaji Properties (sbsuite.in)
-- =====================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Master Configuration Table
CREATE TABLE IF NOT EXISTS master_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    elec_rate_per_unit NUMERIC(10,2) NOT NULL DEFAULT 9.0,
    monthly_parking_fee NUMERIC(10,2) NOT NULL DEFAULT 700.0,
    monthly_owner_cut NUMERIC(10,2) NOT NULL DEFAULT 500.0,
    monthly_manager_cut NUMERIC(10,2) NOT NULL DEFAULT 200.0,
    daily_parking_fee NUMERIC(10,2) NOT NULL DEFAULT 50.0,
    daily_owner_ratio NUMERIC(5,2) NOT NULL DEFAULT 0.80,
    daily_manager_ratio NUMERIC(5,2) NOT NULL DEFAULT 0.20,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Seed default master config if table is empty
INSERT INTO master_config (id, elec_rate_per_unit, monthly_parking_fee, monthly_owner_cut, monthly_manager_cut, daily_parking_fee, daily_owner_ratio, daily_manager_ratio)
SELECT 'a0000000-0000-0000-0000-000000000001'::uuid, 9.0, 700.0, 500.0, 200.0, 50.0, 0.80, 0.20
WHERE NOT EXISTS (SELECT 1 FROM master_config LIMIT 1);

-- 3. Property Units (14 Rooms & 8 Shops)
CREATE TABLE IF NOT EXISTS properties_units (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type TEXT NOT NULL CHECK (type IN ('room', 'shop')),
    unit_number TEXT NOT NULL UNIQUE,
    tenant_name TEXT,
    tenant_phone TEXT,
    base_rent NUMERIC(10,2) NOT NULL DEFAULT 0.0,
    last_meter_reading NUMERIC(10,2) NOT NULL DEFAULT 0.0,
    previous_arrears NUMERIC(10,2) NOT NULL DEFAULT 0.0,
    is_occupied BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Pre-seed 14 Residential Rooms
INSERT INTO properties_units (unit_number, type, tenant_name, tenant_phone, base_rent, last_meter_reading, previous_arrears, is_occupied) VALUES
('R-101', 'room', 'Rahul Sharma', '9876543210', 4500.0, 1240.0, 0.0, true),
('R-102', 'room', 'Amit Kumar', '9812345678', 4500.0, 980.0, 500.0, true),
('R-103', 'room', 'Vikram Singh', '9711223344', 4200.0, 1540.0, 0.0, true),
('R-104', 'room', 'Suresh Verma', '9988776655', 4200.0, 890.0, 0.0, true),
('R-105', 'room', 'Deepak Yadav', '9871122334', 4500.0, 1120.0, 0.0, true),
('R-106', 'room', 'Pooja Tiwari', '9899001122', 4500.0, 670.0, 0.0, true),
('R-107', 'room', 'Manoj Gupta', '9811224466', 4200.0, 1430.0, 1200.0, true),
('R-201', 'room', 'Pankaj Mishra', '9711335577', 4800.0, 2100.0, 0.0, true),
('R-202', 'room', 'Ravi Kant', '9811998877', 4800.0, 1750.0, 0.0, true),
('R-203', 'room', 'Neeraj Joshi', '9955443322', 4600.0, 1320.0, 0.0, true),
('R-204', 'room', 'Sanjay Rawat', '9822334455', 4600.0, 890.0, 0.0, true),
('R-205', 'room', 'Anil Saxena', '9911442255', 4800.0, 1640.0, 0.0, true),
('R-206', 'room', 'Rohit Patel', '9877665544', 4800.0, 1980.0, 0.0, true),
('R-207', 'room', 'Vacant Room', '', 4500.0, 500.0, 0.0, false)
ON CONFLICT (unit_number) DO NOTHING;

-- Pre-seed 8 Commercial Shops
INSERT INTO properties_units (unit_number, type, tenant_name, tenant_phone, base_rent, last_meter_reading, previous_arrears, is_occupied) VALUES
('S-1', 'shop', 'Balaji Grocery Store', '9811002233', 12000.0, 3450.0, 0.0, true),
('S-2', 'shop', 'Shree Medical & Healthcare', '9811334455', 14000.0, 4120.0, 0.0, true),
('S-3', 'shop', 'Super Hair Salon', '9822446688', 8500.0, 2180.0, 1500.0, true),
('S-4', 'shop', 'Balaji Fast Food & Tea', '9833557799', 10000.0, 3890.0, 0.0, true),
('S-5', 'shop', 'Sharma Stationary & Xerox', '9844668800', 8000.0, 1560.0, 0.0, true),
('S-6', 'shop', 'City Dry Cleaners', '9855779911', 9500.0, 2870.0, 0.0, true),
('S-7', 'shop', 'Mobile Care & Recharge', '9866880022', 9000.0, 1940.0, 0.0, true),
('S-8', 'shop', 'Vacant Commercial Shop', '', 11000.0, 1000.0, 0.0, false)
ON CONFLICT (unit_number) DO NOTHING;

-- 4. Utility & Rent Invoicing
CREATE TABLE IF NOT EXISTS utility_bills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    unit_id UUID NOT NULL REFERENCES properties_units(id) ON DELETE CASCADE,
    billing_month TEXT NOT NULL,
    prev_reading NUMERIC(10,2) NOT NULL,
    curr_reading NUMERIC(10,2) NOT NULL,
    units_consumed NUMERIC(10,2) NOT NULL,
    unit_rate NUMERIC(10,2) NOT NULL,
    electricity_total NUMERIC(10,2) NOT NULL,
    base_rent NUMERIC(10,2) NOT NULL,
    previous_arrears NUMERIC(10,2) NOT NULL DEFAULT 0.0,
    total_amount_due NUMERIC(10,2) NOT NULL,
    amount_paid NUMERIC(10,2) NOT NULL DEFAULT 0.0,
    payment_mode TEXT CHECK (payment_mode IN ('cash', 'upi', 'mixed', 'unpaid')),
    payment_status TEXT NOT NULL CHECK (payment_status IN ('unpaid', 'partial', 'paid')),
    meter_photo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Parking Slots Matrix
CREATE TABLE IF NOT EXISTS parking_slots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slot_number TEXT NOT NULL UNIQUE,
    mode TEXT NOT NULL CHECK (mode IN ('monthly', 'daily')),
    vehicle_number TEXT,
    owner_name TEXT,
    owner_phone TEXT,
    valid_until DATE,
    is_occupied BOOLEAN NOT NULL DEFAULT false,
    fee NUMERIC(10,2) NOT NULL DEFAULT 700.0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Seed 10 Default Parking Slots
INSERT INTO parking_slots (slot_number, mode, vehicle_number, owner_name, owner_phone, valid_until, is_occupied, fee) VALUES
('P-01', 'monthly', 'DL 3C AB 1234', 'Rahul Sharma (R-101)', '9876543210', (CURRENT_DATE + INTERVAL '25 days'), true, 700.0),
('P-02', 'monthly', 'HR 26 DQ 5678', 'Balaji Grocery (S-1)', '9811002233', (CURRENT_DATE + INTERVAL '18 days'), true, 700.0),
('P-03', 'monthly', 'UP 16 X 9012', 'Vikram Singh (R-103)', '9711223344', (CURRENT_DATE + INTERVAL '5 days'), true, 700.0),
('P-04', 'monthly', 'DL 8S CJ 3456', 'Medical Store (S-2)', '9811334455', (CURRENT_DATE - INTERVAL '2 days'), true, 700.0),
('P-05', 'monthly', '', '', '', NULL, false, 700.0),
('P-06', 'daily', '', '', '', NULL, false, 50.0),
('P-07', 'daily', '', '', '', NULL, false, 50.0),
('P-08', 'daily', '', '', '', NULL, false, 50.0),
('P-09', 'daily', '', '', '', NULL, false, 50.0),
('P-10', 'daily', '', '', '', NULL, false, 50.0)
ON CONFLICT (slot_number) DO NOTHING;

-- 6. Daily Parking Logs (Walk-in Cars / Bikes)
CREATE TABLE IF NOT EXISTS daily_parking_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_number TEXT NOT NULL,
    vehicle_type TEXT DEFAULT '4-wheeler',
    in_time TIMESTAMPTZ NOT NULL DEFAULT now(),
    out_time TIMESTAMPTZ,
    fee_charged NUMERIC(10,2) NOT NULL DEFAULT 50.0,
    owner_cut NUMERIC(10,2) NOT NULL DEFAULT 40.0,
    manager_cut NUMERIC(10,2) NOT NULL DEFAULT 10.0,
    payment_mode TEXT NOT NULL CHECK (payment_mode IN ('cash', 'upi')),
    status TEXT NOT NULL CHECK (status IN ('parked', 'completed')),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Manager Handover & Cash Settlement Ledger
CREATE TABLE IF NOT EXISTS settlements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    manager_id TEXT NOT NULL DEFAULT 'ritin',
    manager_name TEXT NOT NULL DEFAULT 'Ritin',
    total_collected NUMERIC(10,2) NOT NULL,
    manager_commission NUMERIC(10,2) NOT NULL,
    net_to_owner NUMERIC(10,2) NOT NULL,
    payment_breakdown JSONB DEFAULT '{"cash": 0, "upi": 0}'::jsonb,
    status TEXT NOT NULL CHECK (status IN ('pending', 'settled')),
    notes TEXT,
    settled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 8. Enable Row Level Security (RLS) & Open Policies for Direct App Integration
ALTER TABLE master_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE utility_bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE parking_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_parking_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE settlements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read-write master_config" ON master_config FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write properties_units" ON properties_units FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write utility_bills" ON utility_bills FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write parking_slots" ON parking_slots FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write daily_parking_logs" ON daily_parking_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write settlements" ON settlements FOR ALL USING (true) WITH CHECK (true);
