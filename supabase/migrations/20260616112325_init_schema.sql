-- 1. Create tenants table
create table public.tenants (
  id text not null,
  name text not null,
  role text not null,
  unit_name text not null,
  phone text not null,
  aadhaar text not null,
  vehicle_rc text null,
  base_rent numeric not null,
  electricity_rate numeric not null,
  previous_reading numeric not null default 0,
  current_reading numeric not null default 0,
  ev_charger boolean not null default false,
  document_urls jsonb not null default '{}'::jsonb,
  created_at timestamp with time zone not null default now(),
  constraint tenants_pkey primary key (id),
  constraint tenants_role_check check (role = any (array['residential'::text, 'commercial'::text, 'parking'::text]))
);

-- 2. Create managers table
create table public.managers (
  id text not null,
  name text not null,
  phone text not null,
  cash_wallet numeric not null default 0,
  created_at timestamp with time zone not null default now(),
  constraint managers_pkey primary key (id)
);

-- 3. Create transactions table
create table public.transactions (
  id text not null,
  tenant_id text null,
  tenant_name text not null,
  business_type text not null,
  unit_name text not null,
  type text not null,
  total_amount numeric not null,
  amount_paid numeric not null,
  previous_reading numeric null,
  current_reading numeric null,
  units_consumed numeric null,
  payment_mode text not null,
  manager_name text not null,
  created_at timestamp with time zone not null default now(),
  constraint transactions_pkey primary key (id),
  constraint transactions_tenant_id_fkey foreign key (tenant_id) references tenants(id) on delete set null,
  constraint transactions_payment_mode_check check (payment_mode = any (array['Cash'::text, 'Online'::text])),
  constraint transactions_type_check check (type = any (array['rent'::text, 'electricity'::text, 'both'::text, 'parking'::text, 'handover'::text])),
  constraint transactions_business_type_check check (business_type = any (array['residential'::text, 'commercial'::text, 'parking'::text, 'handover'::text]))
);

-- 4. Create complaints table
create table public.complaints (
  id text not null,
  tenant_id text null,
  tenant_name text not null,
  unit_name text not null,
  role text not null,
  subject text not null,
  desc text not null,
  status text not null,
  created_at timestamp with time zone not null default now(),
  category text null default 'Other'::text,
  severity text null default 'Medium'::text,
  visit_slot text null,
  visit_notes text null,
  service_cost numeric null default 0,
  constraint complaints_pkey primary key (id),
  constraint complaints_tenant_id_fkey foreign key (tenant_id) references tenants(id) on delete set null,
  constraint complaints_role_check check (role = any (array['residential'::text, 'commercial'::text, 'parking'::text])),
  constraint complaints_status_check check (status = any (array['Pending'::text, 'In Progress'::text, 'Resolved'::text]))
);

-- 5. Create messages table
create table public.messages (
  id text not null,
  sender_id text not null,
  sender_name text not null,
  recipient_id text not null,
  content text not null,
  created_at timestamp with time zone not null default now(),
  constraint messages_pkey primary key (id)
);

-- Enable RLS on all tables
alter table public.tenants enable row level security;
alter table public.managers enable row level security;
alter table public.transactions enable row level security;
alter table public.complaints enable row level security;
alter table public.messages enable row level security;

-- Create RLS policies
create policy "Allow public read access to tenants" on public.tenants for select to anon, authenticated using (true);
create policy "Allow public insert access to tenants" on public.tenants for insert to anon, authenticated with check (true);
create policy "Allow public update access to tenants" on public.tenants for update to anon, authenticated using (true);
create policy "Allow public delete access to tenants" on public.tenants for delete to anon, authenticated using (true);

create policy "Allow public read access to managers" on public.managers for select to anon, authenticated using (true);
create policy "Allow public insert access to managers" on public.managers for insert to anon, authenticated with check (true);
create policy "Allow public update access to managers" on public.managers for update to anon, authenticated using (true);
create policy "Allow public delete access to managers" on public.managers for delete to anon, authenticated using (true);

create policy "Allow public read access to transactions" on public.transactions for select to anon, authenticated using (true);
create policy "Allow public insert access to transactions" on public.transactions for insert to anon, authenticated with check (true);
create policy "Allow public update access to transactions" on public.transactions for update to anon, authenticated using (true);
create policy "Allow public delete access to transactions" on public.transactions for delete to anon, authenticated using (true);

create policy "Allow public read access to complaints" on public.complaints for select to anon, authenticated using (true);
create policy "Allow public insert access to complaints" on public.complaints for insert to anon, authenticated with check (true);
create policy "Allow public update access to complaints" on public.complaints for update to anon, authenticated using (true);
create policy "Allow public delete access to complaints" on public.complaints for delete to anon, authenticated using (true);

create policy "Allow public read access to messages" on public.messages for select to anon, authenticated using (true);
create policy "Allow public insert access to messages" on public.messages for insert to anon, authenticated with check (true);
create policy "Allow public update access to messages" on public.messages for update to anon, authenticated using (true);
create policy "Allow public delete access to messages" on public.messages for delete to anon, authenticated using (true);
