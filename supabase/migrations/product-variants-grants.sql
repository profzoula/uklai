-- Fix "permission denied for table product_variants"
-- Run in Supabase SQL Editor if variants save/load fails after creating the table.

GRANT SELECT ON product_variants TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON product_variants TO authenticated;
GRANT ALL ON product_variants TO service_role;

DROP POLICY IF EXISTS "Admins manage product variants" ON product_variants;
CREATE POLICY "Admins manage product variants" ON product_variants
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );
