-- 1. Create Custom Enums
CREATE TYPE unit_type_enum AS ENUM ('room', 'shop');
CREATE TYPE vehicle_category_enum AS ENUM ('car_small', 'car_large', 'heavy', 'tuktuk');
CREATE TYPE pass_status_enum AS ENUM ('active', 'due', 'expired');
CREATE TYPE target_meter_type_enum AS ENUM ('unit', 'tuktuk_ev');
CREATE TYPE collection_source_enum AS ENUM ('estate_rent', 'estate_electricity', 'parking_pass', 'tuktuk_charging');

-- 2. System Configuration (Live Owner Overrides)
CREATE TABLE system_config (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed System Config
INSERT INTO system_config (key, value) VALUES
('tariffs', '{"room": 9.0, "shop": 11.0, "tuktuk_ev": 9.0}'::jsonb),
('parking_pricing', '{
    "car_small": {"fee": 500, "owner": 400, "ritin": 100},
    "car_large": {"fee": 700, "owner": 500, "ritin": 200},
    "heavy":     {"fee": 800, "owner": 600, "ritin": 200},
    "tuktuk":    {"fee": 500, "owner": 400, "ritin": 100}
}'::jsonb);

-- 3. Estate Units Table
CREATE TABLE estate_units (
    id TEXT PRIMARY KEY, -- e.g. 'r-101', 's-01'
    name VARCHAR(20) NOT NULL,
    type unit_type_enum NOT NULL,
    base_rent NUMERIC(10,2) NOT NULL,
    is_occupied BOOLEAN DEFAULT FALSE,
    tenant_name VARCHAR(100),
    tenant_phone VARCHAR(20),
    rent_due_amount NUMERIC(10,2) DEFAULT 0,
    last_reading NUMERIC(10,2) DEFAULT 0,
    is_reading_pending BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Parking Subscribers Table
CREATE TABLE parking_subscribers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_plate VARCHAR(20) NOT NULL UNIQUE,
    owner_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) DEFAULT '',
    category vehicle_category_enum NOT NULL,
    assigned_slot VARCHAR(50) DEFAULT 'Open Yard',
    pass_status pass_status_enum DEFAULT 'active',
    valid_till TIMESTAMPTZ NOT NULL,
    last_paid_date TIMESTAMPTZ DEFAULT NOW(),
    is_parked_inside BOOLEAN DEFAULT TRUE,
    has_ev_facility BOOLEAN DEFAULT FALSE,
    last_ev_reading NUMERIC(10,2) DEFAULT 0,
    ev_due_amount NUMERIC(10,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Sub-Meter Readings Log
CREATE TABLE meter_readings_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    target_type target_meter_type_enum NOT NULL,
    target_id TEXT NOT NULL,
    prev_reading NUMERIC(10,2) NOT NULL,
    curr_reading NUMERIC(10,2) NOT NULL,
    units_consumed NUMERIC(10,2) NOT NULL,
    tariff_rate NUMERIC(6,2) NOT NULL,
    total_bill NUMERIC(10,2) NOT NULL,
    photo_url TEXT,
    recorded_by VARCHAR(20) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Collections Ledger (Financial Split Engine)
CREATE TABLE collections_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_type collection_source_enum NOT NULL,
    source_id TEXT NOT NULL,
    total_cash NUMERIC(10,2) NOT NULL,
    owner_share NUMERIC(10,2) NOT NULL,
    ritin_commission NUMERIC(10,2) NOT NULL,
    note TEXT,
    received_by VARCHAR(20) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
