-- 1. Seed Estate Units (14 Rooms + 8 Shops - Clean Zero Base Rent)
INSERT INTO estate_units (id, name, type, base_rent, is_occupied, tenant_name, tenant_phone, rent_due_amount, last_reading, is_reading_pending)
VALUES
  -- 14 Rooms
  ('r-101', 'R-101', 'room', 0, false, NULL, NULL, 0, 0, false),
  ('r-102', 'R-102', 'room', 0, false, NULL, NULL, 0, 0, false),
  ('r-103', 'R-103', 'room', 0, false, NULL, NULL, 0, 0, false),
  ('r-104', 'R-104', 'room', 0, false, NULL, NULL, 0, 0, false),
  ('r-105', 'R-105', 'room', 0, false, NULL, NULL, 0, 0, false),
  ('r-106', 'R-106', 'room', 0, false, NULL, NULL, 0, 0, false),
  ('r-107', 'R-107', 'room', 0, false, NULL, NULL, 0, 0, false),
  ('r-108', 'R-108', 'room', 0, false, NULL, NULL, 0, 0, false),
  ('r-109', 'R-109', 'room', 0, false, NULL, NULL, 0, 0, false),
  ('r-110', 'R-110', 'room', 0, false, NULL, NULL, 0, 0, false),
  ('r-111', 'R-111', 'room', 0, false, NULL, NULL, 0, 0, false),
  ('r-112', 'R-112', 'room', 0, false, NULL, NULL, 0, 0, false),
  ('r-113', 'R-113', 'room', 0, false, NULL, NULL, 0, 0, false),
  ('r-114', 'R-114', 'room', 0, false, NULL, NULL, 0, 0, false),

  -- 8 Shops
  ('s-01', 'S-01', 'shop', 0, false, NULL, NULL, 0, 0, false),
  ('s-02', 'S-02', 'shop', 0, false, NULL, NULL, 0, 0, false),
  ('s-03', 'S-03', 'shop', 0, false, NULL, NULL, 0, 0, false),
  ('s-04', 'S-04', 'shop', 0, false, NULL, NULL, 0, 0, false),
  ('s-05', 'S-05', 'shop', 0, false, NULL, NULL, 0, 0, false),
  ('s-06', 'S-06', 'shop', 0, false, NULL, NULL, 0, 0, false),
  ('s-07', 'S-07', 'shop', 0, false, NULL, NULL, 0, 0, false),
  ('s-08', 'S-08', 'shop', 0, false, NULL, NULL, 0, 0, false)
ON CONFLICT (id) DO UPDATE SET
  base_rent = EXCLUDED.base_rent,
  is_occupied = EXCLUDED.is_occupied,
  tenant_name = EXCLUDED.tenant_name,
  tenant_phone = EXCLUDED.tenant_phone,
  rent_due_amount = EXCLUDED.rent_due_amount,
  last_reading = EXCLUDED.last_reading,
  is_reading_pending = EXCLUDED.is_reading_pending;
