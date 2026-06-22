-- Create expenses table
CREATE TABLE IF NOT EXISTS public.expenses (
    id TEXT PRIMARY KEY,
    category TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    description TEXT,
    date TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Setup RLS
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access on expenses"
    ON public.expenses FOR SELECT
    USING (true);

CREATE POLICY "Allow public insert on expenses"
    ON public.expenses FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Allow public update on expenses"
    ON public.expenses FOR UPDATE
    USING (true);
