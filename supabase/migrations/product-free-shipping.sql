-- Per-product free shipping flag
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS free_shipping BOOLEAN DEFAULT FALSE;
