-- Simple vs variable product catalog type (WooCommerce-style)
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS catalog_type TEXT DEFAULT 'simple'
  CHECK (catalog_type IN ('simple', 'variable'));

UPDATE products p
SET catalog_type = 'variable'
WHERE catalog_type = 'simple'
  AND EXISTS (
    SELECT 1
    FROM product_variants pv
    WHERE pv.product_id = p.id
      AND pv.active IS NOT FALSE
  );
