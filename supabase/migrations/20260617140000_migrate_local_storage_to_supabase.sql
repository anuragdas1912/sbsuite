CREATE TABLE visitor_passes (
    id TEXT PRIMARY KEY,
    tenant_id TEXT,
    tenant_name TEXT NOT NULL,
    unit_name TEXT NOT NULL,
    visitor_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    visit_type TEXT NOT NULL,
    vehicle_no TEXT,
    valid_until TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE visitor_logs (
    id TEXT PRIMARY KEY,
    pass_id TEXT NOT NULL,
    visitor_name TEXT NOT NULL,
    tenant_name TEXT NOT NULL,
    unit_name TEXT NOT NULL,
    visit_type TEXT NOT NULL,
    vehicle_no TEXT,
    check_in_time TIMESTAMPTZ NOT NULL,
    manager_name TEXT NOT NULL
);

CREATE TABLE global_rates (
    id INTEGER PRIMARY KEY DEFAULT 1,
    rent JSONB NOT NULL DEFAULT '{"residential": 5000, "commercial": 12000, "parking": 1500}'::jsonb,
    power JSONB NOT NULL DEFAULT '{"residential": 10, "commercial": 15, "parking": 12}'::jsonb
);

INSERT INTO global_rates (id) VALUES (1) ON CONFLICT DO NOTHING;
