import "server-only";

import {
  getDashboardStats,
  getAllProductsAdmin,
  getAllOrders,
  getAllCategoriesAdmin,
} from "@/lib/data";
import { isSupabaseConfigured, isSupabaseServerLive, useMockDataFallback } from "@/lib/supabase/config";
import { getDataSupabase } from "@/lib/supabase/server-data";
import type { Order, Product } from "@/types/database";
import type {
  Collection,
  Attribute,
  Coupon,
  CouponRules,
  CmsPage,
  Widget,
  LatestOrderRow,
  MonthlyOrderCount,
  AdminDashboardTrends,
} from "@/lib/admin-data-types";

export type {
  Collection,
  Attribute,
  CouponDiscountSubtype,
  CouponProductCondition,
  CouponRules,
  Coupon,
  CmsPage,
  Widget,
  LatestOrderRow,
  MonthlyOrderCount,
  AdminDashboardTrends,
} from "@/lib/admin-data-types";

export const mockCollections: Collection[] = [
  {
    id: "1",
    name: "Summer Sale",
    slug: "summer-sale",
    description: "Hot deals for the summer season",
    product_count: 12,
    active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "2",
    name: "New Arrivals",
    slug: "new-arrivals",
    description: "Latest products just landed",
    product_count: 8,
    active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "4",
    name: "Deal of the Day",
    slug: "deal-of-the-day",
    description: "Limited-time daily deals with the biggest savings",
    product_count: 6,
    active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "3",
    name: "Best Sellers",
    slug: "best-sellers",
    description: "Our most popular items",
    product_count: 15,
    active: true,
    created_at: new Date().toISOString(),
  },
];

export const mockAttributes: Attribute[] = [
  {
    id: "1",
    name: "Color",
    slug: "color",
    type: "color",
    values: ["Black", "White", "Red", "Blue", "Green"],
    created_at: new Date().toISOString(),
  },
  {
    id: "2",
    name: "Size",
    slug: "size",
    type: "size",
    values: ["XS", "S", "M", "L", "XL", "XXL"],
    created_at: new Date().toISOString(),
  },
  {
    id: "3",
    name: "Material",
    slug: "material",
    type: "text",
    values: ["Cotton", "Polyester", "Leather", "Metal", "Wood"],
    created_at: new Date().toISOString(),
  },
];

export const mockCoupons: Coupon[] = [
  {
    id: "1",
    code: "SAVE10",
    type: "percentage",
    value: 10,
    usage_count: 142,
    usage_limit: 1000,
    active: true,
    expires_at: "2026-12-31",
    created_at: new Date().toISOString(),
  },
  {
    id: "2",
    code: "WELCOME20",
    type: "percentage",
    value: 20,
    usage_count: 56,
    usage_limit: 500,
    active: true,
    expires_at: "2026-09-30",
    created_at: new Date().toISOString(),
  },
  {
    id: "3",
    code: "FLAT15",
    type: "fixed",
    value: 15,
    usage_count: 28,
    usage_limit: null,
    active: false,
    expires_at: null,
    created_at: new Date().toISOString(),
  },
];

export const mockPages: CmsPage[] = [
  {
    id: "1",
    title: "About Us",
    slug: "about-us",
    content: "About UKLAI store.",
    status: "published",
    updated_at: new Date().toISOString(),
  },
  {
    id: "2",
    title: "Terms of Service",
    slug: "terms-of-service",
    content: "Terms and conditions.",
    status: "published",
    updated_at: new Date().toISOString(),
  },
  {
    id: "3",
    title: "Privacy Policy",
    slug: "privacy-policy",
    content: "Privacy policy content.",
    status: "published",
    updated_at: new Date().toISOString(),
  },
  {
    id: "4",
    title: "FAQ",
    slug: "faq",
    content: "Frequently asked questions.",
    status: "draft",
    updated_at: new Date().toISOString(),
  },
];

export const mockWidgets: Widget[] = [
  {
    id: "1",
    name: "Hero Banner",
    type: "banner",
    location: "Homepage",
    active: true,
    updated_at: new Date().toISOString(),
  },
  {
    id: "2",
    name: "Featured Products",
    type: "featured",
    location: "Homepage",
    active: true,
    updated_at: new Date().toISOString(),
  },
  {
    id: "3",
    name: "Testimonials Carousel",
    type: "carousel",
    location: "Homepage",
    active: true,
    updated_at: new Date().toISOString(),
  },
  {
    id: "4",
    name: "Newsletter Signup",
    type: "newsletter",
    location: "Footer",
    active: true,
    updated_at: new Date().toISOString(),
  },
];

export const mockLatestOrders: LatestOrderRow[] = [
  {
    id: "1",
    order_id: "#10245",
    product: "Apple Macbook M2 Chip",
    customer_name: "Andrew Harris",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80",
    date: "2026-01-15",
    price: 99,
    status: "completed",
  },
  {
    id: "2",
    order_id: "#10244",
    product: "Mi Projector 3k Lumens",
    customer_name: "Sarah Johnson",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80",
    date: "2026-01-14",
    price: 49,
    status: "pending",
  },
  {
    id: "3",
    order_id: "#10243",
    product: "Noise Cancelling Headphones",
    customer_name: "Alex Chen",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80",
    date: "2026-01-14",
    price: 229,
    status: "completed",
  },
  {
    id: "4",
    order_id: "#10242",
    product: "Smart Fitness Watch",
    customer_name: "Jane Smith",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80",
    date: "2026-01-13",
    price: 149,
    status: "canceled",
  },
  {
    id: "5",
    order_id: "#10241",
    product: "Quilted Chain Handbag",
    customer_name: "John Doe",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80",
    date: "2026-01-12",
    price: 89,
    status: "completed",
  },
];

export type AdminDashboardData = {
  stats: Awaited<ReturnType<typeof getDashboardStats>>;
  lowStockProducts: Product[];
  outOfStockProducts: Product[];
  latestOrders: LatestOrderRow[];
  categoryCounts: { name: string; count: number }[];
  monthlyOrders: MonthlyOrderCount[];
  trends: AdminDashboardTrends;
  isLive: boolean;
};

const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function computeMonthlyOrders(orders: Order[]): MonthlyOrderCount[] {
  const counts = new Array(12).fill(0);
  const year = new Date().getFullYear();

  for (const order of orders) {
    const date = new Date(order.created_at);
    if (date.getFullYear() === year) {
      counts[date.getMonth()]++;
    }
  }

  return MONTH_LABELS.map((month, index) => ({
    month,
    count: counts[index],
  }));
}

function buildTrend(
  current: number,
  previous: number,
  label: string
): AdminDashboardTrends["revenue"] {
  if (previous === 0 && current === 0) {
    return { percentChange: null, direction: "neutral", label };
  }
  if (previous === 0) {
    return { percentChange: 100, direction: "up", label };
  }

  const percentChange = Math.round(((current - previous) / previous) * 100);
  return {
    percentChange,
    direction:
      percentChange > 0 ? "up" : percentChange < 0 ? "down" : "neutral",
    label,
  };
}

function sumRevenueInRange(
  orders: Order[],
  start: Date,
  end: Date
): number {
  return orders
    .filter((order) => {
      const created = new Date(order.created_at);
      return (
        created >= start &&
        created < end &&
        (order.status === "paid" || order.status === "delivered")
      );
    })
    .reduce((sum, order) => sum + Number(order.total), 0);
}

function countInRange<T extends { created_at: string }>(
  items: T[],
  start: Date,
  end: Date
): number {
  return items.filter((item) => {
    const created = new Date(item.created_at);
    return created >= start && created < end;
  }).length;
}

function computeTrends(
  orders: Order[],
  products: Product[],
  profiles: Array<{ created_at: string }>
): AdminDashboardTrends {
  const now = new Date();
  const currentStart = new Date(now);
  currentStart.setDate(currentStart.getDate() - 30);
  const previousStart = new Date(currentStart);
  previousStart.setDate(previousStart.getDate() - 30);

  const ordersCurrent = countInRange(orders, currentStart, now);
  const ordersPrevious = countInRange(orders, previousStart, currentStart);

  const revenueCurrent = sumRevenueInRange(orders, currentStart, now);
  const revenuePrevious = sumRevenueInRange(orders, previousStart, currentStart);

  const productsCurrent = countInRange(products, currentStart, now);
  const productsPrevious = countInRange(products, previousStart, currentStart);

  const customersCurrent = countInRange(profiles, currentStart, now);
  const customersPrevious = countInRange(profiles, previousStart, currentStart);

  return {
    revenue: buildTrend(revenueCurrent, revenuePrevious, "vs last 30 days"),
    orders: buildTrend(ordersCurrent, ordersPrevious, "vs last 30 days"),
    products: buildTrend(productsCurrent, productsPrevious, "new this month"),
    customers: buildTrend(customersCurrent, customersPrevious, "new this month"),
  };
}

function mapOrderToRow(order: Order): LatestOrderRow {
  const firstItem = order.order_items?.[0];
  const statusMap: Record<string, LatestOrderRow["status"]> = {
    paid: "completed",
    delivered: "completed",
    pending: "pending",
    processing: "pending",
    shipped: "pending",
    cancelled: "canceled",
  };

  return {
    id: order.id,
    order_id: `#${order.id.slice(0, 8)}`,
    product: firstItem?.product_name ?? "Order items",
    customer_name: order.shipping_name ?? order.customer_email ?? "Guest",
    avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
      order.customer_email ?? order.id
    )}`,
    date: order.created_at,
    price: order.total,
    status: statusMap[order.status] ?? "pending",
  };
}

export async function getAdminDashboardData(): Promise<AdminDashboardData> {
  const live = isSupabaseConfigured();
  const [stats, products, orders, categories] = await Promise.all([
    getDashboardStats(),
    getAllProductsAdmin(),
    getAllOrders(),
    getAllCategoriesAdmin(),
  ]);

  const lowStockProducts = products
    .filter((p) => p.stock > 0 && p.stock <= 10)
    .sort((a, b) => a.stock - b.stock);

  const outOfStockProducts = products.filter((p) => p.stock <= 0);

  const categoryCounts = categories.map((cat) => ({
    name: cat.name,
    count: products.filter((p) => p.category_id === cat.id).length,
  }));

  const uncategorized = products.filter((p) => !p.category_id).length;
  if (uncategorized > 0) {
    categoryCounts.push({ name: "Uncategorized", count: uncategorized });
  }

  const latestOrders = orders.slice(0, 8).map(mapOrderToRow);
  const monthlyOrders = computeMonthlyOrders(orders);

  let trends: AdminDashboardTrends = {
    revenue: { percentChange: null, direction: "neutral", label: "vs last 30 days" },
    orders: { percentChange: null, direction: "neutral", label: "vs last 30 days" },
    products: { percentChange: null, direction: "neutral", label: "new this month" },
    customers: { percentChange: null, direction: "neutral", label: "new this month" },
  };

  if (live) {
    const supabase = await getSupabase();
    if (supabase) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("created_at");
      trends = computeTrends(orders, products, profiles ?? []);
    }
  }

  return {
    stats,
    lowStockProducts,
    outOfStockProducts,
    latestOrders,
    categoryCounts,
    monthlyOrders,
    trends,
    isLive: live,
  };
}

export async function getLatestOrders(): Promise<LatestOrderRow[]> {
  const orders = await getAllOrders();
  return orders.slice(0, 8).map(mapOrderToRow);
}

async function getSupabase() {
  return getDataSupabase();
}

function useMockFallback(): boolean {
  if (!isSupabaseServerLive()) return true;
  return useMockDataFallback();
}

export async function getCollections(): Promise<Collection[]> {
  const supabase = await getSupabase();
  if (!supabase) return mockCollections;

  const { data } = await supabase
    .from("collections")
    .select("*")
    .order("created_at", { ascending: false });

  if (!data?.length) return useMockFallback() ? mockCollections : [];

  const withCounts = await Promise.all(
    data.map(async (row) => {
      const { count } = await supabase
        .from("collection_products")
        .select("*", { count: "exact", head: true })
        .eq("collection_id", row.id);

      return {
        id: row.id,
        name: row.name,
        slug: row.slug,
        description: row.description,
        product_count: count ?? 0,
        active: row.active ?? true,
        created_at: row.created_at,
      };
    })
  );

  return withCounts;
}

export async function getCollectionById(id: string): Promise<Collection | null> {
  const items = await getCollections();
  return items.find((c) => c.id === id) ?? null;
}

export async function getCollectionWithProducts(id: string): Promise<{
  collection: Collection;
  products: import("@/lib/admin-data-types").CollectionProductRow[];
} | null> {
  const supabase = await getSupabase();
  if (!supabase) {
    const collection = mockCollections.find((c) => c.id === id);
    if (!collection) return null;
    return { collection, products: [] };
  }

  const { data: row } = await supabase
    .from("collections")
    .select("*")
    .eq("id", id)
    .single();

  if (!row) return null;

  const { data: links } = await supabase
    .from("collection_products")
    .select("product_id")
    .eq("collection_id", id);

  let products: import("@/lib/admin-data-types").CollectionProductRow[] = [];

  if (links?.length) {
    const ids = links.map((l) => l.product_id);
    const { data: productRows } = await supabase
      .from("products")
      .select("id, name, slug, sku, price, image_url")
      .in("id", ids);

    products = (productRows ?? []) as import("@/lib/admin-data-types").CollectionProductRow[];
  }

  const collection: Collection = {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    product_count: products.length,
    active: row.active ?? true,
    created_at: row.created_at,
  };

  return { collection, products };
}

export async function getAttributes(): Promise<Attribute[]> {
  const supabase = await getSupabase();
  if (!supabase) return mockAttributes;

  const { data } = await supabase.from("attributes").select("*").order("name");
  if (!data?.length) return mockAttributes;

  return data.map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    type: row.type as Attribute["type"],
    values: Array.isArray(row.values) ? row.values : [],
    created_at: row.created_at,
  }));
}

export async function getAttributeById(id: string): Promise<Attribute | null> {
  const items = await getAttributes();
  return items.find((a) => a.id === id) ?? null;
}

export async function getCoupons(): Promise<Coupon[]> {
  const supabase = await getSupabase();
  if (!supabase) return mockCoupons;

  const { data } = await supabase
    .from("coupons")
    .select("*")
    .order("created_at", { ascending: false });

  if (!data?.length) return mockCoupons;

  return data.map((row) => ({
    id: row.id,
    code: row.code,
    description: row.description ?? null,
    type: row.type as Coupon["type"],
    value: Number(row.value),
    usage_count: row.usage_count ?? 0,
    usage_limit: row.usage_limit,
    active: row.active ?? true,
    starts_at: row.starts_at ?? null,
    expires_at: row.expires_at,
    rules: (row.rules as CouponRules) ?? {},
    created_at: row.created_at,
  }));
}

export async function getCouponById(id: string): Promise<Coupon | null> {
  const items = await getCoupons();
  return items.find((c) => c.id === id) ?? null;
}

export async function getCmsPages(): Promise<CmsPage[]> {
  const supabase = await getSupabase();
  if (!supabase) return mockPages;

  const { data } = await supabase
    .from("cms_pages")
    .select("*")
    .order("updated_at", { ascending: false });

  if (!data?.length) return mockPages;

  return data.map((row) => ({
    id: row.id,
    title: row.title,
    slug: row.slug,
    content: row.content,
    status: row.status as CmsPage["status"],
    updated_at: row.updated_at,
  }));
}

export async function getCmsPageById(id: string): Promise<CmsPage | null> {
  const items = await getCmsPages();
  return items.find((p) => p.id === id) ?? null;
}

export async function getWidgets(): Promise<Widget[]> {
  const supabase = await getSupabase();
  if (!supabase) return mockWidgets;

  const { data } = await supabase
    .from("widgets")
    .select("*")
    .order("updated_at", { ascending: false });

  if (!data?.length) return mockWidgets;

  return data.map((row) => ({
    id: row.id,
    name: row.name,
    type: row.type as Widget["type"],
    location: row.location,
    active: row.active ?? true,
    updated_at: row.updated_at,
  }));
}

export async function getWidgetById(id: string): Promise<Widget | null> {
  const items = await getWidgets();
  return items.find((w) => w.id === id) ?? null;
}

export async function getCustomers() {
  const supabase = await getSupabase();
  if (!supabase) {
    return [];
  }

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, email, full_name, created_at")
    .order("created_at", { ascending: false });

  if (!profiles?.length) return [];

  const { data: orders } = await supabase
    .from("orders")
    .select("user_id, total, status");

  return profiles.map((profile) => {
    const userOrders = (orders ?? []).filter(
      (o) => o.user_id === profile.id
    );
    const total_spent = userOrders
      .filter((o) =>
        ["paid", "processing", "shipped", "delivered"].includes(o.status)
      )
      .reduce((sum, o) => sum + Number(o.total), 0);

    return {
      id: profile.id,
      full_name: profile.full_name ?? "Customer",
      email: profile.email,
      orders_count: userOrders.length,
      total_spent,
      created_at: profile.created_at,
    };
  });
}

export async function getCustomerById(id: string) {
  const supabase = await getSupabase();
  if (!supabase) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email, full_name, created_at")
    .eq("id", id)
    .single();

  if (!profile) return null;

  const { data: orders } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("user_id", id)
    .order("created_at", { ascending: false });

  const orderList = (orders ?? []) as import("@/types/database").Order[];
  const total_spent = orderList
    .filter((o) =>
      ["paid", "processing", "shipped", "delivered"].includes(o.status)
    )
    .reduce((sum, o) => sum + Number(o.total), 0);

  return {
    ...profile,
    full_name: profile.full_name ?? "Customer",
    orders: orderList,
    orders_count: orderList.length,
    total_spent,
  };
}

export async function getNewsletterSubscribers() {
  const supabase = await getSupabase();
  if (!supabase) return [];

  const { data } = await supabase
    .from("newsletter_subscribers")
    .select("*")
    .order("subscribed_at", { ascending: false });

  return data ?? [];
}

export async function getReturnRequests() {
  const supabase = await getSupabase();
  if (!supabase) return [];

  const { data } = await supabase
    .from("return_requests")
    .select("*")
    .order("created_at", { ascending: false });

  return data ?? [];
}

export async function getReturnById(id: string) {
  const supabase = await getSupabase();
  if (!supabase) return null;

  const { data } = await supabase
    .from("return_requests")
    .select("*")
    .eq("id", id)
    .single();

  return data;
}

export async function getProductReviews() {
  const supabase = await getSupabase();
  if (!supabase) return [];

  const { data } = await supabase
    .from("product_reviews")
    .select("*, products(name, slug)")
    .order("created_at", { ascending: false });

  return data ?? [];
}
