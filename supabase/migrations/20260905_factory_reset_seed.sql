-- ==========================================================
-- SHREE BALAJI ESTATE & PARKING - FACTORY RESET CLEANSE
-- Migration: 20260905_factory_reset_seed.sql
-- ==========================================================

-- 1. Flush all historical transaction records, logs, and subscriber passes
TRUNCATE TABLE collections_ledger, meter_readings_log, parking_subscribers CASCADE;

-- 2. Flush and reset estate units
TRUNCATE TABLE estate_units CASCADE;

-- 3. Seed Fresh Clean Structural Inventory (14 Rooms + 8 Shops)
-- All units initialized with 0 dues, 0 meter readings, and ready for first live tenant registration.
INSERT INTO estate_units (id, name, type, base_rent, is_occupied, tenant_name, tenant_phone, rent_due_amount, last_reading, is_reading_pending)
VALUES
  -- 14 Rooms (Base Rents intact, vacant, 0 dues, 0 readings)
  ('r-101', 'R-101', 'room', 6500, false, NULL, NULL, 0, 0, false),
  ('r-102', 'R-102', 'room', 6500, false, NULL, NULL, 0, 0, false),
  ('r-103', 'R-103', 'room', 7000, false, NULL, NULL, 0, 0, false),
  ('r-104', 'R-104', 'room', 6500, false, NULL, NULL, 0, 0, false),
  ('r-105', 'R-105', 'room', 6000, false, NULL, NULL, 0, 0, false),
  ('r-106', 'R-106', 'room', 6500, false, NULL, NULL, 0, 0, false),
  ('r-107', 'R-107', 'room', 7000, false, NULL, NULL, 0, 0, false),
  ('r-108', 'R-108', 'room', 6500, false, NULL, NULL, 0, 0, false),
  ('r-109', 'R-109', 'room', 6500, false, NULL, NULL, 0, 0, false),
  ('r-110', 'R-110', 'room', 7500, false, NULL, NULL, 0, 0, false),
  ('r-111', 'R-111', 'room', 6500, false, NULL, NULL, 0, 0, false),
  ('r-112', 'R-112', 'room', 7000, false, NULL, NULL, 0, 0, false),
  ('r-113', 'R-113', 'room', 7000, false, NULL, NULL, 0, 0, false),
  ('r-114', 'R-114', 'room', 7500, false, NULL, NULL, 0, 0, false),

  -- 8 Commercial Shops (Base Rents intact, vacant, 0 dues, 0 readings)
  ('s-01', 'S-01', 'shop', 18000, false, NULL, NULL, 0, 0, false),
  ('s-02', 'S-02', 'shop', 16500, false, NULL, NULL, 0, 0, false),
  ('s-03', 'S-03', 'shop', 14000, false, NULL, NULL, 0, 0, false),
  ('s-04', 'S-04', 'shop', 12500, false, NULL, NULL, 0, 0, false),
  ('s-05', 'S-05', 'shop', 15000, false, NULL, NULL, 0, 0, false),
  ('s-06', 'S-06', 'shop', 15000, false, NULL, NULL, 0, 0, false),
  ('s-07', 'S-07', 'shop', 13000, false, NULL, NULL, 0, 0, false),
  ('s-08', 'S-08', 'shop', 22000, false, NULL, NULL, 0, 0, false)
ON CONFLICT (id) DO UPDATE SET
  base_rent = EXCLUDED.base_rent,
  is_occupied = EXCLUDED.is_occupied,
  tenant_name = EXCLUDED.tenant_name,
  tenant_phone = EXCLUDED.tenant_phone,
  rent_due_amount = EXCLUDED.rent_due_amount,
  last_reading = EXCLUDED.last_reading,
  is_reading_pending = EXCLUDED.is_reading_pending;

-- 4. Reset Default System Config (Tariffs & Parking Pricing)
INSERT INTO system_config (key, value, updated_at)
VALUES
  ('tariffs', '{" room\: 9.0, \shop\: 11.0, \tuktuk_ev\: 9.0}'::jsonb, NOW()),
 ('parking_pricing', '{
 \car_small\: {\fee\: 500, \owner\: 400, \ritin\: 100},
 \car_large\: {\fee\: 700, \owner\: 500, \ritin\: 200},
 \heavy\: {\fee\: 800, \owner\: 600, \ritin\: 200},
 \tuktuk\: {\fee\: 500, \owner\: 400, \ritin\: 100}
 }'::jsonb, NOW())
ON CONFLICT (key) DO UPDATE SET
 value = EXCLUDED.value,
 updated_at = NOW();
