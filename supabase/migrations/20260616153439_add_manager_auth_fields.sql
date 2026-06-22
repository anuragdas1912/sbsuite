-- Add login_id and password columns to managers table
ALTER TABLE public.managers
ADD COLUMN IF NOT EXISTS login_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS password TEXT;

-- Update existing managers with a default login_id if needed, though they were just truncated.
