-- 1. Enable Realtime on messages
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- 2. Create the "documents" storage bucket if not exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tenant_id TEXT REFERENCES public.tenants(id) ON DELETE CASCADE,
    tenant_name TEXT NOT NULL,
    notification_type TEXT NOT NULL,
    message_content TEXT NOT NULL,
    status TEXT DEFAULT 'Sent',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable RLS for notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Allow anonymous access for notifications (mock app)
CREATE POLICY "Allow public read access on notifications"
    ON public.notifications FOR SELECT
    USING (true);

CREATE POLICY "Allow public insert on notifications"
    ON public.notifications FOR INSERT
    WITH CHECK (true);

-- Allow public access to documents bucket
CREATE POLICY "Public Access"
    ON storage.objects FOR SELECT
    USING ( bucket_id = 'documents' );

CREATE POLICY "Public Upload"
    ON storage.objects FOR INSERT
    WITH CHECK ( bucket_id = 'documents' );

CREATE POLICY "Public Delete"
    ON storage.objects FOR DELETE
    USING ( bucket_id = 'documents' );
