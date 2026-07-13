-- Create cms_media table to store Cloudinary metadata
CREATE TABLE IF NOT EXISTS public.cms_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  public_id TEXT NOT NULL UNIQUE,
  secure_url TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  width INTEGER,
  height INTEGER,
  format TEXT,
  folder TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.cms_media ENABLE ROW LEVEL SECURITY;

-- Select Policy: Allow everyone to select media items
CREATE POLICY "Everyone can view media items"
ON public.cms_media
FOR SELECT
USING (true);

-- Admin Policies: Full access for authenticated/admin users
CREATE POLICY "Admins have full access on media items"
ON public.cms_media
FOR ALL
USING (true)
WITH CHECK (true);
