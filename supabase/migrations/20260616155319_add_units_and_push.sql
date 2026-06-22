-- Create Units Table
CREATE TABLE IF NOT EXISTS public.units (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('residential', 'commercial')),
  status TEXT NOT NULL DEFAULT 'vacant' CHECK (status IN ('vacant', 'occupied', 'maintenance')),
  tenant_id TEXT REFERENCES public.tenants(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pre-populate 14 Rooms (Residential)
DO $$
BEGIN
  FOR i IN 1..14 LOOP
    INSERT INTO public.units (name, type, status) VALUES ('Room No. ' || i, 'residential', 'vacant');
  END LOOP;
END $$;

-- Pre-populate 12 Shops (Commercial)
DO $$
BEGIN
  FOR i IN 1..12 LOOP
    INSERT INTO public.units (name, type, status) VALUES ('Shop No. ' || i, 'commercial', 'vacant');
  END LOOP;
END $$;

-- Enable Realtime on Units
ALTER PUBLICATION supabase_realtime ADD TABLE public.units;

-- Create Push Subscriptions Table
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL, -- Could be owner, manager_id, or tenant_id
  role TEXT NOT NULL,
  subscription JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Realtime on Push Subscriptions (Optional but good)
ALTER PUBLICATION supabase_realtime ADD TABLE public.push_subscriptions;
