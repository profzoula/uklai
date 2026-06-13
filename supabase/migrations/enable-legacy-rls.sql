-- Enable RLS on legacy/public tables flagged by Supabase Security Advisor.
-- With RLS ON and NO public policies, anon/authenticated API access is blocked.
-- service_role (backend) and postgres still bypass RLS.
--
-- HOW TO USE:
-- 1. Open Supabase → SQL Editor
-- 2. Paste and run this entire file
-- 3. Refresh Security Advisor — red "RLS Disabled" warnings should drop
-- 4. UKLAI app tables (products, orders, profiles, …) keep their existing policies
--
-- To add admin-only access on a legacy table later:
--   CREATE POLICY "Admins only" ON public.some_table FOR ALL
--   USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));

DO $$
DECLARE
  legacy_tables text[] := ARRAY[
    'admin_user',
    'coupon',
    'order_activity',
    'product',
    'shipment',
    'shipping_zone_method',
    'customer',
    'order',
    'order_item',
    'payment',
    'product_category',
    'product_image',
    'shipping_address',
    'shipping_method',
    'tax_rate',
    'user',
    'wishlist'
  ];
  t text;
BEGIN
  FOREACH t IN ARRAY legacy_tables
  LOOP
    IF EXISTS (
      SELECT 1
      FROM pg_tables
      WHERE schemaname = 'public' AND tablename = t
    ) THEN
      EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
      RAISE NOTICE 'RLS enabled on public.%', t;
    END IF;
  END LOOP;
END $$;

-- Ensure core UKLAI tables have RLS (no-op if already enabled)
ALTER TABLE IF EXISTS profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS products ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS wishlist_items ENABLE ROW LEVEL SECURITY;
