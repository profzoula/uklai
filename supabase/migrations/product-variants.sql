-- Product variants (color/SKU matrix per product)
-- Run in Supabase SQL Editor after schema.sql

CREATE TABLE IF NOT EXISTS product_variants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  sku TEXT,
  color TEXT,
  image_url TEXT,
  price DECIMAL(10,2) NOT NULL,
  compare_at_price DECIMAL(10,2),
  stock INT DEFAULT 0,
  sort_order INT DEFAULT 0,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_product_variants_product_id
  ON product_variants(product_id);

ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Product variants viewable by everyone" ON product_variants
  FOR SELECT USING (true);

CREATE POLICY "Admins manage product variants" ON product_variants
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- Table-level grants (required for Supabase authenticated/anon roles)
GRANT SELECT ON product_variants TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON product_variants TO authenticated;
GRANT ALL ON product_variants TO service_role;
