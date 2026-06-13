export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  is_admin: boolean;
  shipping_name?: string | null;
  shipping_address?: string | null;
  shipping_city?: string | null;
  shipping_state?: string | null;
  shipping_zip?: string | null;
  shipping_country?: string | null;
  created_at: string;
  updated_at: string;
};

export type SavedShippingAddress = {
  shipping_name: string;
  shipping_address: string;
  shipping_city: string;
  shipping_state: string;
  shipping_zip: string;
  shipping_country: string;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  sort_order: number;
  created_at: string;
};

export type ProductType = "physical" | "digital";
export type CatalogType = "simple" | "variable";

export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  compare_at_price: number | null;
  image_url: string | null;
  category_id: string | null;
  stock: number;
  badge: string | null;
  rating: number;
  review_count: number;
  featured: boolean;
  active: boolean;
  product_type?: ProductType;
  catalog_type?: CatalogType;
  digital_file_url?: string | null;
  sku?: string | null;
  highlights?: string[] | null;
  gallery_urls?: string[] | null;
  meta_title?: string | null;
  meta_description?: string | null;
  tax_class?: string | null;
  weight?: number | null;
  no_shipping_required?: boolean;
  free_shipping?: boolean;
  color?: string | null;
  size?: string | null;
  created_at: string;
  updated_at: string;
  categories?: Category;
  product_variants?: ProductVariant[];
};

export type ProductVariant = {
  id: string;
  product_id: string;
  sku: string | null;
  color: string | null;
  image_url: string | null;
  price: number;
  compare_at_price: number | null;
  stock: number;
  sort_order: number;
  active: boolean;
  created_at: string;
  updated_at: string;
};

export type OrderStatus =
  | "pending"
  | "paid"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

export type Order = {
  id: string;
  user_id: string | null;
  stripe_session_id: string | null;
  stripe_payment_intent_id: string | null;
  status: OrderStatus;
  total: number;
  subtotal: number | null;
  discount_amount: number | null;
  coupon_code: string | null;
  refunded_amount: number | null;
  customer_email: string | null;
  shipping_name: string | null;
  shipping_address: string | null;
  shipping_city: string | null;
  shipping_state: string | null;
  shipping_zip: string | null;
  shipping_country: string;
  tracking_number: string | null;
  tracking_carrier: string | null;
  admin_notes: string | null;
  tax_amount: number | null;
  payment_method?: string | null;
  review_request_sent_at?: string | null;
  created_at: string;
  updated_at: string;
  order_items?: OrderItem[];
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  product_image: string | null;
  quantity: number;
  price: number;
  product_type?: string | null;
  digital_file_url?: string | null;
  created_at: string;
};

export type ReturnRequestStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "completed";

export type ReturnRequest = {
  id: string;
  order_id: string | null;
  user_id: string | null;
  customer_email: string;
  order_number: string | null;
  reason: string;
  status: ReturnRequestStatus;
  admin_notes: string | null;
  items: unknown[];
  created_at: string;
  updated_at: string;
};

export type ReviewStatus = "pending" | "approved" | "rejected";

export type ProductReview = {
  id: string;
  product_id: string;
  user_id: string | null;
  customer_name: string;
  customer_email: string | null;
  rating: number;
  title: string | null;
  body: string | null;
  status: ReviewStatus;
  created_at: string;
  products?: Pick<Product, "name" | "slug">;
};

export type NewsletterSubscriber = {
  id: string;
  email: string;
  subscribed_at: string;
};

export type CartItem = {
  product: Product;
  quantity: number;
  variantId?: string | null;
  variantLabel?: string | null;
};

export type DashboardStats = {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
  recentOrders: Order[];
  topProducts: Product[];
};
