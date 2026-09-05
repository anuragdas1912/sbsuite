-- ==========================================================
-- SHREE BALAJI ESTATE - MAINTENANCE EXPENSE & MANAGER LEDGER
-- Migration: 20260905_maintenance_expenses.sql
-- ==========================================================

CREATE TABLE IF NOT EXISTS maintenance_expenses (
    id TEXT PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    manager_name TEXT DEFAULT 'Ritin',
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    vendor TEXT,
    status TEXT DEFAULT 'pending_settlement',
    settled_at TIMESTAMPTZ,
    settled_by TEXT
);

ALTER TABLE maintenance_expenses ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'maintenance_expenses' AND policyname = 'Allow public read on maintenance_expenses'
    ) THEN
        CREATE POLICY "Allow public read on maintenance_expenses" ON maintenance_expenses FOR SELECT USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'maintenance_expenses' AND policyname = 'Allow public insert on maintenance_expenses'
    ) THEN
        CREATE POLICY "Allow public insert on maintenance_expenses" ON maintenance_expenses FOR INSERT WITH CHECK (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'maintenance_expenses' AND policyname = 'Allow public update on maintenance_expenses'
    ) THEN
        CREATE POLICY "Allow public update on maintenance_expenses" ON maintenance_expenses FOR UPDATE USING (true);
    END IF;
END $$;
