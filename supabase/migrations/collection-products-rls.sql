-- Collection products: public read + admin write
ALTER TABLE collection_products ADD COLUMN IF NOT EXISTS sort_order INT DEFAULT 0;

ALTER TABLE collection_products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Collection products viewable by everyone" ON collection_products;
CREATE POLICY "Collection products viewable by everyone"
  ON collection_products FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins manage collection products" ON collection_products;
CREATE POLICY "Admins manage collection products"
  ON collection_products FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );
