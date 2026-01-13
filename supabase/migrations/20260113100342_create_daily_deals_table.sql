BEGIN;

CREATE TABLE IF NOT EXISTS public.daily_deals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    price NUMERIC NOT NULL,
    currency TEXT DEFAULT 'INR',
    image_url TEXT,
    link TEXT NOT NULL,
    source TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.daily_deals ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Allow public read access" ON public.daily_deals
    FOR SELECT USING (true);

COMMIT;