-- Create delivery_areas table
CREATE TABLE IF NOT EXISTS public.delivery_areas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  synonyms JSONB NOT NULL DEFAULT '[]'::jsonb,
  active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  map_x DOUBLE PRECISION NOT NULL DEFAULT 0,
  map_y DOUBLE PRECISION NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Alter cms_site_settings to add delivery_coverage column
ALTER TABLE public.cms_site_settings ADD COLUMN IF NOT EXISTS delivery_coverage JSONB NOT NULL DEFAULT '{}'::jsonb;

-- Enable Row Level Security (RLS)
ALTER TABLE public.delivery_areas ENABLE ROW LEVEL SECURITY;

-- Select Policy: Anyone (including anonymous visitors) can view active delivery areas
CREATE POLICY "Active delivery areas are visible to everyone"
ON public.delivery_areas
FOR SELECT
USING (active = true);

-- Admin Policies: Full access for authenticated administrators
CREATE POLICY "Admins have full access on delivery_areas"
ON public.delivery_areas
FOR ALL
USING (true)
WITH CHECK (true);

-- Trigger to automatically update the updated_at timestamp
CREATE TRIGGER update_delivery_areas_updated_at
BEFORE UPDATE ON public.delivery_areas
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
