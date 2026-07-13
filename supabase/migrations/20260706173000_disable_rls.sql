-- Disable Row Level Security (RLS) on all CMS tables to allow open access
ALTER TABLE public.cms_hero_slides DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_products DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_site_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.ecommerce_orders DISABLE ROW LEVEL SECURITY;
