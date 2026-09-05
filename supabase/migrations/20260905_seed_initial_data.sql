-- 1. Seed Estate Units (14 Rooms + 8 Shops)
INSERT INTO estate_units (id, name, type, base_rent, is_occupied, tenant_name, tenant_phone, rent_due_amount, last_reading, is_reading_pending)
VALUES
  -- 14 Rooms
  ('r-101', 'R-101', 'room', 6500, true, 'Sunil Verma', '98371-10101', 0, 1420, false),
  ('r-102', 'R-102', 'room', 6500, true, 'Amit Sharma', '94120-10202', 4000, 1380, true),
  ('r-103', 'R-103', 'room', 7000, true, 'Rajesh Patel', '98102-10303', 0, 1890, false),
  ('r-104', 'R-104', 'room', 6500, true, 'Priya Nair', '97190-10404', 0, 1120, false),
  ('r-105', 'R-105', 'room', 6000, true, 'Vikas Gupta', '99270-10505', 0, 980, false),
  ('r-106', 'R-106', 'room', 6500, true, 'Deepak Yadav', '98114-10606', 0, 2150, false),
  ('r-107', 'R-107', 'room', 7000, true, 'Sneha Kulkarni', '94111-10707', 0, 1460, true),
  ('r-108', 'R-108', 'room', 6500, false, NULL, NULL, 0, 1200, false),
  ('r-109', 'R-109', 'room', 6500, true, 'Manish Tiwari', '96340-10909', 0, 1340, false),
  ('r-110', 'R-110', 'room', 7500, true, 'Ananya Roy', '95570-11010', 0, 1760, false),
  ('r-111', 'R-111', 'room', 6500, true, 'Rohit Chauhan', '97580-11111', 0, 1510, false),
  ('r-112', 'R-112', 'room', 7000, false, NULL, NULL, 0, 940, false),
  ('r-113', 'R-113', 'room', 7000, true, 'Karan Malhotra', '98971-11313', 0, 1680, true),
  ('r-114', 'R-114', 'room', 7500, true, 'Pooja Mehra', '94121-11414', 0, 1930, false),

  -- 8 Shops
  ('s-01', 'S-01', 'shop', 18000, true, 'Balaji Medicals', '97198-20101', 0, 4210, false),
  ('s-02', 'S-02', 'shop', 16500, true, 'Shree Ganesh Grocery', '98375-20202', 0, 3890, false),
  ('s-03', 'S-03', 'shop', 14000, true, 'Modern Dry Cleaners', '94560-20303', 8500, 2890, true),
  ('s-04', 'S-04', 'shop', 12500, true, 'Metro Cyber & Print', '99271-20404', 0, 2450, false),
  ('s-05', 'S-05', 'shop', 15000, false, NULL, NULL, 0, 1100, false),
  ('s-06', 'S-06', 'shop', 15000, true, 'Royal Hair Salon', '95480-20606', 0, 3110, false),
  ('s-07', 'S-07', 'shop', 13000, true, 'Shanti Stationery', '98970-20707', 0, 1840, false),
  ('s-08', 'S-08', 'shop', 22000, true, 'Om Sweet & Snacks', '94129-20808', 0, 5620, false)
ON CONFLICT (id) DO NOTHING;

-- 2. Seed Parking Subscribers (4 Fleet Categories)
INSERT INTO parking_subscribers (
  vehicle_plate, owner_name, phone, category, assigned_slot, pass_status, 
  valid_till, is_parked_inside, has_ev_facility, last_ev_reading, ev_due_amount
)
VALUES
  -- Car: Small (₹500: 400/100)
  ('UK 06 AB 1912', 'राजेश कुमार', '98371-20411', 'car_small', 'P-01', 'active', NOW() + INTERVAL '25 days', true, false, 0, 0),
  ('UK 06 CD 4589', 'अमित सिब्बल', '94120-88320', 'car_small', 'P-02', 'active', NOW() + INTERVAL '23 days', true, false, 0, 0),
  ('UP 25 BE 3390', 'विक्रम राणा', '97190-44120', 'car_small', 'P-03', 'active', NOW() + INTERVAL '17 days', false, false, 0, 0),

  -- Car: Large / SUV (₹700: 500/200)
  ('DL 01 AX 7721', 'डॉ. पी. के. शर्मा', '98102-34901', 'car_large', 'P-08', 'active', NOW() + INTERVAL '29 days', true, false, 0, 0),
  ('HR 26 DQ 1104', 'संजय ग्रोवर', '98114-55092', 'car_large', 'P-09', 'active', NOW() + INTERVAL '10 days', true, false, 0, 0),
  ('UK 04 F 9012', 'दीपक बिष्ट', '99270-11234', 'car_large', 'P-10', 'due', NOW() - INTERVAL '3 days', true, false, 0, 0),

  -- Pickup / Loader / Heavy (₹800: 600/200)
  ('UK 06 L 8820', 'महेन्द्र सिंह लोडर', '95570-33412', 'heavy', 'Open Yard-A', 'active', NOW() + INTERVAL '22 days', true, false, 0, 0),
  ('UP 22 M 2244', 'अनिल रस्तोगी', '96340-99812', 'heavy', 'Open Yard-B', 'active', NOW() + INTERVAL '21 days', true, false, 0, 0),

  -- E-Rickshaw / Tuk-Tuk (₹500: 400/100) + Optional EV Charging Sub-Meter
  ('UK 06 ER 4420', 'रमेश पाल', '97580-22109', 'tuktuk', 'EV-Bay 1', 'active', NOW() + INTERVAL '20 days', true, true, 420, 0),
  ('UK 06 ER 7710', 'सलीम अख्तर', '98971-88410', 'tuktuk', 'EV-Bay 2', 'active', NOW() + INTERVAL '25 days', true, true, 580, 180),
  ('UK 06 ER 1109', 'राजू कश्यप', '94121-66782', 'tuktuk', 'EV-Bay 3', 'due', NOW() - INTERVAL '2 days', true, true, 310, 0),
  ('UK 06 ER 9904', 'सुरेश मौर्या', '97198-44510', 'tuktuk', 'T-04', 'active', NOW() + INTERVAL '27 days', false, false, 0, 0)
ON CONFLICT (vehicle_plate) DO NOTHING;
