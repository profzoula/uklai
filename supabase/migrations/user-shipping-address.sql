-- Saved shipping address on customer profile (Account → Shipping address)

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS shipping_name TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS shipping_address TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS shipping_city TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS shipping_state TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS shipping_zip TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS shipping_country TEXT DEFAULT 'US';
