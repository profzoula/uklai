export type Collection = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  product_count: number;
  active: boolean;
  created_at: string;
};

export type CollectionProductRow = {
  id: string;
  name: string;
  slug: string;
  sku: string | null;
  price: number;
  image_url: string | null;
};

export type Attribute = {
  id: string;
  name: string;
  slug: string;
  type: "text" | "color" | "size" | "number";
  values: string[];
  created_at: string;
};

export type CouponDiscountSubtype =
  | "order_fixed"
  | "order_percentage"
  | "product_fixed"
  | "product_percentage"
  | "buy_x_get_y";

export type CouponProductCondition = {
  productId: string;
  productName: string;
  operator: string;
  value: string;
  minQty: number;
};

export type CouponRules = {
  free_shipping?: boolean;
  discount_subtype?: CouponDiscountSubtype;
  min_purchase_amount?: number;
  min_purchase_qty?: number;
  product_conditions?: CouponProductCondition[];
  customer_group?: string;
  customer_emails?: string[];
  min_customer_orders?: number;
};

export type Coupon = {
  id: string;
  code: string;
  description?: string | null;
  type: "percentage" | "fixed";
  value: number;
  usage_count: number;
  usage_limit: number | null;
  active: boolean;
  starts_at?: string | null;
  expires_at: string | null;
  rules?: CouponRules;
  created_at: string;
};

export type CmsPage = {
  id: string;
  title: string;
  slug: string;
  content: string | null;
  status: "published" | "draft";
  updated_at: string;
};

export type Widget = {
  id: string;
  name: string;
  type: "banner" | "carousel" | "featured" | "newsletter";
  location: string;
  active: boolean;
  updated_at: string;
};

export type LatestOrderRow = {
  id: string;
  order_id: string;
  product: string;
  customer_name: string;
  avatar: string;
  date: string;
  price: number;
  status: "completed" | "pending" | "canceled";
};

export type MonthlyOrderCount = {
  month: string;
  count: number;
};

export type DashboardTrend = {
  percentChange: number | null;
  direction: "up" | "down" | "neutral";
  label: string;
};

export type AdminDashboardTrends = {
  revenue: DashboardTrend;
  orders: DashboardTrend;
  products: DashboardTrend;
  customers: DashboardTrend;
};
