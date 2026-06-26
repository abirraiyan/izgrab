CREATE TABLE public.cms_products (
  slug TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price INTEGER NOT NULL CHECK (price >= 0),
  image TEXT NOT NULL,
  video TEXT,
  category TEXT NOT NULL,
  tag TEXT CHECK (tag IN ('Best Seller', 'Limited', 'New')),
  description TEXT NOT NULL,
  ingredients TEXT NOT NULL DEFAULT '',
  sizes TEXT[] NOT NULL DEFAULT '{}',
  flavors TEXT[] NOT NULL DEFAULT '{}',
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.cms_hero_slides (
  id TEXT PRIMARY KEY,
  image TEXT NOT NULL DEFAULT '',
  video TEXT,
  eyebrow TEXT NOT NULL DEFAULT '',
  title TEXT NOT NULL,
  sub TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.cms_site_settings (
  key TEXT PRIMARY KEY DEFAULT 'main' CHECK (key = 'main'),
  announcements TEXT[] NOT NULL DEFAULT '{}',
  contact JSONB NOT NULL DEFAULT '{}'::jsonb,
  footer_tagline TEXT NOT NULL DEFAULT '',
  socials JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.ecommerce_orders (
  id TEXT PRIMARY KEY,
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL DEFAULT '',
  address TEXT NOT NULL,
  area TEXT NOT NULL DEFAULT '',
  city TEXT NOT NULL DEFAULT '',
  notes TEXT NOT NULL DEFAULT '',
  payment TEXT NOT NULL DEFAULT 'cod',
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  subtotal INTEGER NOT NULL CHECK (subtotal >= 0),
  delivery INTEGER NOT NULL DEFAULT 0 CHECK (delivery >= 0),
  total INTEGER NOT NULL CHECK (total >= 0),
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'preparing', 'delivered', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_cms_products_updated_at
BEFORE UPDATE ON public.cms_products
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cms_hero_slides_updated_at
BEFORE UPDATE ON public.cms_hero_slides
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cms_site_settings_updated_at
BEFORE UPDATE ON public.cms_site_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ecommerce_orders_updated_at
BEFORE UPDATE ON public.ecommerce_orders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.cms_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_hero_slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ecommerce_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published products are visible"
ON public.cms_products
FOR SELECT
USING (is_active = true);

CREATE POLICY "Published hero slides are visible"
ON public.cms_hero_slides
FOR SELECT
USING (is_active = true);

CREATE POLICY "Site settings are visible"
ON public.cms_site_settings
FOR SELECT
USING (true);

CREATE POLICY "Orders are not publicly readable"
ON public.ecommerce_orders
FOR SELECT
USING (false);

CREATE INDEX idx_cms_products_sort ON public.cms_products (sort_order, created_at DESC);
CREATE INDEX idx_cms_products_category ON public.cms_products (category) WHERE is_active = true;
CREATE INDEX idx_cms_hero_slides_sort ON public.cms_hero_slides (sort_order, created_at ASC);
CREATE INDEX idx_ecommerce_orders_status_created ON public.ecommerce_orders (status, created_at DESC);

INSERT INTO public.cms_site_settings (key, announcements, contact, footer_tagline, socials)
VALUES (
  'main',
  ARRAY['✨ Same day delivery available', '🍰 Freshly baked every morning', '🎁 Complimentary gift wrap on orders over ৳2000', '💌 Personalised notes for every cake'],
  '{"address":"House 12, Road 5, Banani\nDhaka, Bangladesh","phone":"+880 1700 000 000","hours":"Daily 9am — 10pm","email":"hello@izpatisserie.com","secondaryEmail":"orders@izpatisserie.com"}'::jsonb,
  'Crafting moments of pure indulgence through artisanal baking and high-end culinary artistry.',
  '{"instagram":"https://www.instagram.com/izpatisserieandcafe/","facebook":"https://www.facebook.com/IZPatisserieandCafe/","email":"mailto:hello@izpatisserie.com"}'::jsonb
)
ON CONFLICT (key) DO NOTHING;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'cms-media',
  'cms-media',
  true,
  52428800,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm']
)
ON CONFLICT (id) DO UPDATE
SET public = true,
    file_size_limit = 52428800,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm'];

CREATE POLICY "CMS media is publicly visible"
ON storage.objects
FOR SELECT
USING (bucket_id = 'cms-media');