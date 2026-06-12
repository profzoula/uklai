-- UKLAI E-commerce Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Categories
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Products
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  compare_at_price DECIMAL(10,2),
  image_url TEXT,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  stock INT DEFAULT 0,
  badge TEXT,
  rating DECIMAL(2,1) DEFAULT 0,
  review_count INT DEFAULT 0,
  featured BOOLEAN DEFAULT FALSE,
  active BOOLEAN DEFAULT TRUE,
  product_type TEXT DEFAULT 'physical' CHECK (product_type IN ('physical', 'digital')),
  digital_file_url TEXT,
  sku TEXT,
  highlights JSONB DEFAULT '[]',
  gallery_urls JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  stripe_session_id TEXT UNIQUE,
  stripe_payment_intent_id TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled')),
  total DECIMAL(10,2) NOT NULL,
  customer_email TEXT,
  shipping_name TEXT,
  shipping_address TEXT,
  shipping_city TEXT,
  shipping_state TEXT,
  shipping_zip TEXT,
  shipping_country TEXT DEFAULT 'US',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Order Items
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  product_image TEXT,
  quantity INT NOT NULL DEFAULT 1,
  price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Newsletter subscribers
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  subscribed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Categories policies (public read, admin write)
CREATE POLICY "Categories are viewable by everyone" ON categories FOR SELECT USING (true);
CREATE POLICY "Admins can manage categories" ON categories FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);

-- Products policies
CREATE POLICY "Active products are viewable by everyone" ON products FOR SELECT USING (active = true OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));
CREATE POLICY "Admins can manage products" ON products FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);

-- Orders policies
CREATE POLICY "Users can view own orders" ON orders FOR SELECT USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));
CREATE POLICY "Users can create orders" ON orders FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Admins can manage orders" ON orders FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);

-- Order items policies
CREATE POLICY "Users can view own order items" ON order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND (orders.user_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)))
);
CREATE POLICY "Order items can be inserted" ON order_items FOR INSERT WITH CHECK (true);

-- Newsletter policies
CREATE POLICY "Anyone can subscribe" ON newsletter_subscribers FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view subscribers" ON newsletter_subscribers FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Seed data
INSERT INTO categories (name, slug, description, image_url, sort_order) VALUES
  ('Electronics', 'electronics', 'Latest tech essentials', 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400', 1),
  ('Fashion', 'fashion', 'Style that defines you', 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400', 2),
  ('Home & Living', 'home-living', 'Comfort meets design', 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400', 3),
  ('Fitness', 'fitness', 'Gear for your best self', 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400', 4),
  ('Accessories', 'accessories', 'Small things that matter', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400', 5)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (name, slug, description, price, compare_at_price, image_url, category_id, stock, badge, rating, review_count, featured) VALUES
  ('Smart Fitness Watch', 'smart-fitness-watch', 'Track your fitness goals with precision. Heart rate monitor, GPS, and 7-day battery life.', 149.00, 199.00, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600', (SELECT id FROM categories WHERE slug = 'electronics'), 50, '25% OFF', 4.7, 328, true),
  ('Noise Cancelling Headphones', 'noise-cancelling-headphones', 'Premium sound quality with active noise cancellation for immersive listening.', 229.00, 299.00, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600', (SELECT id FROM categories WHERE slug = 'electronics'), 35, 'Trending', 4.9, 512, true),
  ('Wireless Game Controller', 'wireless-game-controller', 'Ergonomic design with responsive buttons and long battery life.', 49.00, 69.00, 'https://images.unsplash.com/photo-1612287230202-1ff1d85b1dff?w=600', (SELECT id FROM categories WHERE slug = 'electronics'), 100, NULL, 4.5, 214, true),
  ('Classic Black T-Shirt', 'classic-black-t-shirt', 'Premium cotton blend for everyday comfort and style.', 29.00, 39.00, 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600', (SELECT id FROM categories WHERE slug = 'fashion'), 200, NULL, 4.3, 876, true),
  ('Crystal Statement Necklace', 'crystal-statement-necklace', 'Elegant crystal necklace perfect for any occasion.', 119.00, 159.00, 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600', (SELECT id FROM categories WHERE slug = 'accessories'), 25, 'Bestseller', 4.6, 143, true),
  ('Quilted Chain Handbag', 'quilted-chain-handbag', 'Luxury quilted design with gold chain strap.', 89.00, 120.00, 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600', (SELECT id FROM categories WHERE slug = 'accessories'), 40, 'Bestseller', 4.8, 265, true),
  ('Slim Laptop Messenger Bag', 'slim-laptop-messenger-bag', 'Professional messenger bag with padded laptop compartment.', 59.00, 79.00, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600', (SELECT id FROM categories WHERE slug = 'accessories'), 60, NULL, 4.4, 189, true),
  ('Modern Upholstered Bed', 'modern-upholstered-bed', 'Contemporary bed frame with premium upholstery.', 749.00, 899.00, 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600', (SELECT id FROM categories WHERE slug = 'home-living'), 10, NULL, 4.6, 92, true)
ON CONFLICT (slug) DO NOTHING;

-- Collections
CREATE TABLE IF NOT EXISTS collections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS collection_products (
  collection_id UUID REFERENCES collections(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  sort_order INT DEFAULT 0,
  PRIMARY KEY (collection_id, product_id)
);

ALTER TABLE collection_products ADD COLUMN IF NOT EXISTS sort_order INT DEFAULT 0;

ALTER TABLE collection_products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Collection products viewable by everyone" ON collection_products FOR SELECT USING (true);
CREATE POLICY "Admins manage collection products" ON collection_products FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);

-- Attributes
CREATE TABLE IF NOT EXISTS attributes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  type TEXT DEFAULT 'text' CHECK (type IN ('text', 'color', 'size', 'number')),
  values JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Coupons
CREATE TABLE IF NOT EXISTS coupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  type TEXT DEFAULT 'percentage' CHECK (type IN ('percentage', 'fixed')),
  value DECIMAL(10,2) NOT NULL,
  usage_count INT DEFAULT 0,
  usage_limit INT,
  active BOOLEAN DEFAULT TRUE,
  starts_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  rules JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- CMS Pages
CREATE TABLE IF NOT EXISTS cms_pages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('published', 'draft')),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Widgets
CREATE TABLE IF NOT EXISTS widgets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT DEFAULT 'banner' CHECK (type IN ('banner', 'carousel', 'featured', 'newsletter')),
  location TEXT DEFAULT 'Homepage',
  config JSONB DEFAULT '{}',
  active BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE attributes ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE widgets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Collections viewable by everyone" ON collections FOR SELECT USING (true);
CREATE POLICY "Admins manage collections" ON collections FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);
CREATE POLICY "Attributes viewable by everyone" ON attributes FOR SELECT USING (true);
CREATE POLICY "Admins manage attributes" ON attributes FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);
CREATE POLICY "Active coupons viewable" ON coupons FOR SELECT USING (active = true OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));
CREATE POLICY "Admins manage coupons" ON coupons FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);
CREATE POLICY "Published pages viewable" ON cms_pages FOR SELECT USING (status = 'published' OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));
CREATE POLICY "Admins manage pages" ON cms_pages FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);
CREATE POLICY "Active widgets viewable" ON widgets FOR SELECT USING (active = true OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));
CREATE POLICY "Admins manage widgets" ON widgets FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);

INSERT INTO coupons (code, type, value, usage_limit, active, expires_at) VALUES
  ('SAVE10', 'percentage', 10, 1000, true, '2026-12-31'),
  ('WELCOME20', 'percentage', 20, 500, true, '2026-09-30')
ON CONFLICT (code) DO NOTHING;

INSERT INTO collections (name, slug, description) VALUES
  ('Summer Sale', 'summer-sale', 'Hot deals for the summer season'),
  ('New Arrivals', 'new-arrivals', 'Latest products just landed'),
  ('Best Sellers', 'best-sellers', 'Our most popular items'),
  ('Deal of the Day', 'deal-of-the-day', 'Limited-time daily deals with the biggest savings'),
  ('Featured Products', 'featured', 'Curated products on the homepage Featured section')
ON CONFLICT (slug) DO NOTHING;

-- Product variants (color/SKU matrix)
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
CREATE POLICY "Product variants viewable by everyone" ON product_variants FOR SELECT USING (true);
CREATE POLICY "Admins manage product variants" ON product_variants FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
) WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);

GRANT SELECT ON product_variants TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON product_variants TO authenticated;
GRANT ALL ON product_variants TO service_role;

INSERT INTO attributes (name, slug, type, values) VALUES
  ('Color', 'color', 'color', '["Black","White","Red","Blue","Green"]'),
  ('Size', 'size', 'size', '["XS","S","M","L","XL","XXL"]'),
  ('Material', 'material', 'text', '["Cotton","Polyester","Leather","Metal","Wood"]')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO cms_pages (title, slug, status) VALUES
  ('About Us', 'about-us', 'published'),
  ('Terms of Service', 'terms-of-service', 'published'),
  ('Privacy Policy', 'privacy-policy', 'published'),
  ('FAQ', 'faq', 'draft')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO widgets (name, type, location) VALUES
  ('Hero Banner', 'banner', 'Homepage'),
  ('Featured Products', 'featured', 'Homepage'),
  ('Testimonials Carousel', 'carousel', 'Homepage'),
  ('Newsletter Signup', 'newsletter', 'Footer')
ON CONFLICT DO NOTHING;

-- Store settings (single row)
CREATE TABLE IF NOT EXISTS store_settings (
  id SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  data JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Store settings readable by everyone" ON store_settings FOR SELECT USING (true);
CREATE POLICY "Admins manage store settings" ON store_settings FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);

INSERT INTO store_settings (id, data) VALUES (1, '{}')
ON CONFLICT (id) DO NOTHING;

-- Optional columns for richer product admin (safe to re-run)
ALTER TABLE products ADD COLUMN IF NOT EXISTS product_type TEXT DEFAULT 'physical';
ALTER TABLE products ADD COLUMN IF NOT EXISTS digital_file_url TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS sku TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS highlights JSONB DEFAULT '[]';
ALTER TABLE products ADD COLUMN IF NOT EXISTS color TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS size TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS meta_title TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS meta_description TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS tax_class TEXT DEFAULT 'taxable';
ALTER TABLE products ADD COLUMN IF NOT EXISTS weight DECIMAL(10,2);
ALTER TABLE products ADD COLUMN IF NOT EXISTS no_shipping_required BOOLEAN DEFAULT FALSE;

-- Product image storage (Supabase Storage)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Product images public read" ON storage.objects;
DROP POLICY IF EXISTS "Product images upload" ON storage.objects;
DROP POLICY IF EXISTS "Product images delete" ON storage.objects;

CREATE POLICY "Product images public read"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

CREATE POLICY "Product images upload"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "Product images delete"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'product-images');

-- Admin extensions (orders tracking, returns, reviews)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking_number TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking_carrier TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS admin_notes TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS coupon_code TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(10,2) DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS subtotal DECIMAL(10,2);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tax_amount DECIMAL(10,2) DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'stripe';

ALTER TABLE order_items ADD COLUMN IF NOT EXISTS digital_file_url TEXT;
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS product_type TEXT DEFAULT 'physical';

CREATE TABLE IF NOT EXISTS return_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  customer_email TEXT NOT NULL,
  order_number TEXT,
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
  admin_notes TEXT,
  items JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS product_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  body TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE return_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can submit return request" ON return_requests;
DROP POLICY IF EXISTS "Admins manage return requests" ON return_requests;
DROP POLICY IF EXISTS "Approved reviews are public" ON product_reviews;
DROP POLICY IF EXISTS "Users can submit reviews" ON product_reviews;
DROP POLICY IF EXISTS "Admins manage reviews" ON product_reviews;

CREATE POLICY "Anyone can submit return request" ON return_requests
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins manage return requests" ON return_requests
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Approved reviews are public" ON product_reviews
  FOR SELECT USING (
    status = 'approved'
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Users can submit reviews" ON product_reviews
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins manage reviews" ON product_reviews
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );
