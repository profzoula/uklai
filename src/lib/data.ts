import type { Category, Product, Order, DashboardStats } from "@/types/database";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import "server-only";

export { isSupabaseConfigured };

export const mockCategories: Category[] = [
  {
    id: "1",
    name: "Electronics",
    slug: "electronics",
    description: "Latest tech essentials",
    image_url:
      "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400",
    sort_order: 1,
    created_at: new Date().toISOString(),
  },
  {
    id: "2",
    name: "Fashion",
    slug: "fashion",
    description: "Style that defines you",
    image_url:
      "https://images.unsplash.com/photo-1445205170230-053b83016050?w=400",
    sort_order: 2,
    created_at: new Date().toISOString(),
  },
  {
    id: "3",
    name: "Home & Living",
    slug: "home-living",
    description: "Comfort meets design",
    image_url:
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400",
    sort_order: 3,
    created_at: new Date().toISOString(),
  },
  {
    id: "4",
    name: "Fitness",
    slug: "fitness",
    description: "Gear for your best self",
    image_url:
      "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400",
    sort_order: 4,
    created_at: new Date().toISOString(),
  },
  {
    id: "5",
    name: "Accessories",
    slug: "accessories",
    description: "Small things that matter",
    image_url:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400",
    sort_order: 5,
    created_at: new Date().toISOString(),
  },
];

export const mockProducts: Product[] = [
  {
    id: "1",
    name: "Smart Fitness Watch",
    slug: "smart-fitness-watch",
    description:
      "Track your fitness goals with precision. Heart rate monitor, GPS, and 7-day battery life.",
    price: 149,
    compare_at_price: 199,
    image_url:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600",
    category_id: "1",
    stock: 50,
    badge: "25% OFF",
    rating: 4.7,
    review_count: 328,
    featured: true,
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "2",
    name: "Noise Cancelling Headphones",
    slug: "noise-cancelling-headphones",
    description:
      "Premium sound quality with active noise cancellation for immersive listening.",
    price: 229,
    compare_at_price: 299,
    image_url:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600",
    category_id: "1",
    stock: 35,
    badge: "Trending",
    rating: 4.9,
    review_count: 512,
    featured: true,
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "3",
    name: "Wireless Game Controller",
    slug: "wireless-game-controller",
    description:
      "Ergonomic design with responsive buttons and long battery life.",
    price: 49,
    compare_at_price: 69,
    image_url:
      "https://images.unsplash.com/photo-1612287230202-1ff1d85b1dff?w=600",
    category_id: "1",
    stock: 100,
    badge: null,
    rating: 4.5,
    review_count: 214,
    featured: true,
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "4",
    name: "Classic Black T-Shirt",
    slug: "classic-black-t-shirt",
    description: "Premium cotton blend for everyday comfort and style.",
    price: 29,
    compare_at_price: 39,
    image_url:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600",
    category_id: "2",
    stock: 200,
    badge: null,
    rating: 4.3,
    review_count: 876,
    featured: true,
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "5",
    name: "Crystal Statement Necklace",
    slug: "crystal-statement-necklace",
    description: "Elegant crystal necklace perfect for any occasion.",
    price: 119,
    compare_at_price: 159,
    image_url:
      "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600",
    category_id: "5",
    stock: 25,
    badge: "Bestseller",
    rating: 4.6,
    review_count: 143,
    featured: true,
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "6",
    name: "Quilted Chain Handbag",
    slug: "quilted-chain-handbag",
    description: "Luxury quilted design with gold chain strap.",
    price: 89,
    compare_at_price: 120,
    image_url:
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600",
    category_id: "5",
    stock: 40,
    badge: "Bestseller",
    rating: 4.8,
    review_count: 265,
    featured: true,
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "7",
    name: "Slim Laptop Messenger Bag",
    slug: "slim-laptop-messenger-bag",
    description: "Professional messenger bag with padded laptop compartment.",
    price: 59,
    compare_at_price: 79,
    image_url:
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600",
    category_id: "5",
    stock: 60,
    badge: null,
    rating: 4.4,
    review_count: 189,
    featured: true,
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "8",
    name: "Modern Upholstered Bed",
    slug: "modern-upholstered-bed",
    description: "Contemporary bed frame with premium upholstery.",
    price: 749,
    compare_at_price: 899,
    image_url:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600",
    category_id: "3",
    stock: 10,
    badge: null,
    rating: 4.6,
    review_count: 92,
    featured: true,
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export async function getCategories(): Promise<Category[]> {
  if (!isSupabaseConfigured()) return mockCategories;

  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order");

  if (error || !data?.length) return mockCategories;
  return data;
}

export async function getProducts(options?: {
  featured?: boolean;
  deals?: boolean;
  categorySlug?: string;
  search?: string;
  limit?: number;
}): Promise<Product[]> {
  function applyFilters(products: Product[]): Product[] {
    let result = [...products];

    if (options?.deals) {
      result = result.filter(
        (p) => p.compare_at_price != null && p.compare_at_price > p.price
      );
    } else if (options?.featured) {
      result = result.filter((p) => p.featured);
    }

    if (options?.categorySlug) {
      const cat = mockCategories.find((c) => c.slug === options.categorySlug);
      if (cat) result = result.filter((p) => p.category_id === cat.id);
    }

    if (options?.search) {
      const q = options.search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q)
      );
    }

    if (options?.limit) result = result.slice(0, options.limit);
    return result;
  }

  if (!isSupabaseConfigured()) {
    return applyFilters(mockProducts);
  }

  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  let query = supabase
    .from("products")
    .select("*, categories(*)")
    .eq("active", true)
    .order("created_at", { ascending: false });

  if (options?.featured) query = query.eq("featured", true);
  if (options?.categorySlug) {
    const { data: cat } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", options.categorySlug)
      .single();
    if (cat) query = query.eq("category_id", cat.id);
  }
  if (options?.search) {
    query = query.or(
      `name.ilike.%${options.search}%,description.ilike.%${options.search}%`
    );
  }
  if (options?.limit) query = query.limit(options.limit);

  const { data, error } = await query;
  if (error || !data?.length) {
    return applyFilters(mockProducts);
  }

  let products = data as Product[];
  if (options?.deals) {
    products = products.filter(
      (p) => p.compare_at_price != null && p.compare_at_price > p.price
    );
  }
  return products;
}

export type StoreCollection = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
};

function mockProductsForCollection(slug: string, limit: number): Product[] {
  const active = mockProducts.filter((p) => p.active);

  if (slug === "best-sellers") {
    return [...active]
      .sort((a, b) => b.review_count - a.review_count)
      .slice(0, limit);
  }

  if (slug === "new-arrivals") {
    return [...active]
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
      .slice(0, limit);
  }

  return active.slice(0, limit);
}

export async function getCollectionBySlug(
  slug: string
): Promise<StoreCollection | null> {
  const fallbacks: Record<string, StoreCollection> = {
    "best-sellers": {
      id: "best-sellers",
      name: "Best Sellers",
      slug: "best-sellers",
      description: "Our most popular items",
    },
    "new-arrivals": {
      id: "new-arrivals",
      name: "New Arrivals",
      slug: "new-arrivals",
      description: "Latest products just landed",
    },
  };

  if (!isSupabaseConfigured()) {
    return fallbacks[slug] ?? null;
  }

  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  const { data } = await supabase
    .from("collections")
    .select("id, name, slug, description")
    .eq("slug", slug)
    .eq("active", true)
    .maybeSingle();

  if (data) return data as StoreCollection;
  return fallbacks[slug] ?? null;
}

export async function getProductsByCollectionSlug(
  collectionSlug: string,
  limit = 10
): Promise<Product[]> {
  if (!isSupabaseConfigured()) {
    return mockProductsForCollection(collectionSlug, limit);
  }

  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();

  const { data: collection } = await supabase
    .from("collections")
    .select("id")
    .eq("slug", collectionSlug)
    .eq("active", true)
    .maybeSingle();

  if (collection) {
    const { data: links } = await supabase
      .from("collection_products")
      .select("product_id")
      .eq("collection_id", collection.id);

    if (links?.length) {
      const productIds = links.map((l) => l.product_id);
      const { data: products } = await supabase
        .from("products")
        .select("*, categories(*)")
        .in("id", productIds)
        .eq("active", true)
        .limit(limit);

      if (products?.length) return products as Product[];
    }
  }

  let query = supabase
    .from("products")
    .select("*, categories(*)")
    .eq("active", true)
    .limit(limit);

  if (collectionSlug === "best-sellers") {
    query = query.order("review_count", { ascending: false });
  } else if (collectionSlug === "new-arrivals") {
    query = query.order("created_at", { ascending: false });
  } else {
    return mockProductsForCollection(collectionSlug, limit);
  }

  const { data, error } = await query;
  if (error || !data?.length) {
    return mockProductsForCollection(collectionSlug, limit);
  }

  return data as Product[];
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  if (!isSupabaseConfigured()) {
    const product = mockProducts.find((p) => p.slug === slug);
    if (!product) return null;
    const category = mockCategories.find((c) => c.id === product.category_id);
    return category ? { ...product, categories: category } : product;
  }

  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*, categories(*)")
    .eq("slug", slug)
    .eq("active", true)
    .single();

  if (error || !data) {
    const product = mockProducts.find((p) => p.slug === slug);
    if (!product) return null;
    const category = mockCategories.find((c) => c.id === product.category_id);
    return category ? { ...product, categories: category } : product;
  }
  return data;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  if (!isSupabaseConfigured()) {
    return {
      totalRevenue: 45280,
      totalOrders: 156,
      totalProducts: mockProducts.length,
      totalCustomers: 89,
      recentOrders: [],
      topProducts: mockProducts.slice(0, 5),
    };
  }

  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();

  const [ordersRes, productsRes, customersRes, recentRes] = await Promise.all([
    supabase.from("orders").select("total, status, created_at"),
    supabase.from("products").select("id"),
    supabase.from("profiles").select("id, created_at"),
    supabase
      .from("orders")
      .select("*, order_items(*)")
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  const orders = ordersRes.data ?? [];
  const totalRevenue = orders
    .filter((o) => o.status === "paid" || o.status === "delivered")
    .reduce((sum, o) => sum + Number(o.total), 0);

  return {
    totalRevenue,
    totalOrders: orders.length,
    totalProducts: productsRes.data?.length ?? 0,
    totalCustomers: customersRes.data?.length ?? 0,
    recentOrders: (recentRes.data ?? []) as Order[],
    topProducts: [],
  };
}

export async function getAllOrders(): Promise<Order[]> {
  if (!isSupabaseConfigured()) return [];

  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  const { data } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .order("created_at", { ascending: false });

  return (data ?? []) as Order[];
}

export async function getOrderById(id: string): Promise<Order | null> {
  if (!isSupabaseConfigured()) return null;

  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  const { data } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("id", id)
    .single();

  return (data as Order) ?? null;
}

export async function getOrderByStripeSession(
  sessionId: string
): Promise<Order | null> {
  if (!isSupabaseConfigured()) return null;

  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  const { data } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("stripe_session_id", sessionId)
    .single();

  return (data as Order) ?? null;
}

export async function getAllProductsAdmin(): Promise<Product[]> {
  if (!isSupabaseConfigured()) return mockProducts;

  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("*, categories(*)")
    .order("created_at", { ascending: false });

  return (data ?? []) as Product[];
}

export async function getProductByIdAdmin(id: string): Promise<Product | null> {
  if (!isSupabaseConfigured()) {
    return mockProducts.find((p) => p.id === id) ?? null;
  }

  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("*, categories(*)")
    .eq("id", id)
    .single();

  if (!data) {
    return mockProducts.find((p) => p.id === id) ?? null;
  }

  return data as Product;
}

export async function getAllCategoriesAdmin(): Promise<Category[]> {
  if (!isSupabaseConfigured()) return mockCategories;

  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  const { data } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order");

  return (data ?? mockCategories) as Category[];
}

export async function getCategoryByIdAdmin(
  id: string
): Promise<Category | null> {
  const categories = await getAllCategoriesAdmin();
  return categories.find((c) => c.id === id) ?? null;
}
