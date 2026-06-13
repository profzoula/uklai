import type {
  Category,
  Product,
  ProductVariant,
  Order,
  DashboardStats,
} from "@/types/database";
import {
  isSupabaseConfigured,
  isSupabaseServerLive,
  useMockDataFallback,
} from "@/lib/supabase/config";
import { getDataSupabase } from "@/lib/supabase/server-data";
import { enrichProductsWithVariantAggregates } from "@/lib/product-variant-sync";
import "server-only";

export { isSupabaseConfigured, isSupabaseServerLive };

function useMockFallback(): boolean {
  if (!isSupabaseServerLive()) return true;
  return useMockDataFallback();
}

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
      "https://images.unsplash.com/photo-1606148032779-3425ef6b2295?w=600&q=80",
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
  const supabase = await getDataSupabase();
  if (!supabase) return mockCategories;

  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order");

  if (error || !data?.length) {
    return useMockFallback() ? mockCategories : [];
  }
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

  const supabase = await getDataSupabase();
  if (!supabase) {
    return applyFilters(mockProducts);
  }

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
    return useMockFallback() ? applyFilters(mockProducts) : [];
  }

  let products = data as Product[];
  if (options?.deals) {
    products = products.filter(
      (p) => p.compare_at_price != null && p.compare_at_price > p.price
    );
  }
  return enrichProductsWithVariantAggregates(supabase, products);
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

  if (slug === "deal-of-the-day") {
    return [...active]
      .filter(
        (p) => p.compare_at_price != null && p.compare_at_price > p.price
      )
      .sort(
        (a, b) =>
          b.compare_at_price! -
          b.price -
          (a.compare_at_price! - a.price)
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
    "deal-of-the-day": {
      id: "deal-of-the-day",
      name: "Deal of the Day",
      slug: "deal-of-the-day",
      description: "Limited-time daily deals — biggest savings while they last.",
    },
    featured: {
      id: "featured",
      name: "Featured Products",
      slug: "featured",
      description: "Curated products on the homepage Featured section",
    },
  };

  const supabase = await getDataSupabase();
  if (!supabase) {
    return fallbacks[slug] ?? null;
  }

  const { data } = await supabase
    .from("collections")
    .select("id, name, slug, description")
    .eq("slug", slug)
    .eq("active", true)
    .maybeSingle();

  if (data) return data as StoreCollection;
  return fallbacks[slug] ?? null;
}

const HOMEPAGE_COLLECTION_SLUGS = new Set([
  "featured",
  "best-sellers",
  "new-arrivals",
  "deal-of-the-day",
]);

async function getAutoCollectionProducts(
  supabase: NonNullable<Awaited<ReturnType<typeof getDataSupabase>>>,
  collectionSlug: string,
  limit: number
): Promise<Product[]> {
  let query = supabase
    .from("products")
    .select("*, categories(*)")
    .eq("active", true)
    .limit(limit);

  if (collectionSlug === "best-sellers") {
    query = query.order("review_count", { ascending: false });
  } else if (collectionSlug === "new-arrivals") {
    query = query.order("created_at", { ascending: false });
  } else if (collectionSlug === "deal-of-the-day") {
    query = query
      .not("compare_at_price", "is", null)
      .order("price", { ascending: true });
  } else if (collectionSlug === "featured") {
    query = query.eq("featured", true).order("created_at", { ascending: false });
  } else {
    return useMockFallback()
      ? mockProductsForCollection(collectionSlug, limit)
      : [];
  }

  const { data, error } = await query;
  if (error || !data?.length) {
    return useMockFallback()
      ? mockProductsForCollection(collectionSlug, limit)
      : [];
  }

  return enrichProductsWithVariantAggregates(supabase, data as Product[]);
}

export async function getStoreCollections(): Promise<StoreCollection[]> {
  const supabase = await getDataSupabase();
  if (!supabase) {
    return [
      {
        id: "featured",
        name: "Featured Products",
        slug: "featured",
        description: null,
      },
      {
        id: "best-sellers",
        name: "Best Sellers",
        slug: "best-sellers",
        description: null,
      },
      {
        id: "new-arrivals",
        name: "New Arrivals",
        slug: "new-arrivals",
        description: null,
      },
      {
        id: "deal-of-the-day",
        name: "Deal of the Day",
        slug: "deal-of-the-day",
        description: null,
      },
    ];
  }

  const { data, error } = await supabase
    .from("collections")
    .select("id, name, slug, description")
    .eq("active", true)
    .order("name");

  if (error || !data?.length) return [];
  return data as StoreCollection[];
}

export async function getProductsByCollectionSlug(
  collectionSlug: string,
  limit = 10
): Promise<Product[]> {
  const supabase = await getDataSupabase();
  if (!supabase) {
    return mockProductsForCollection(collectionSlug, limit);
  }

  const { data: collection } = await supabase
    .from("collections")
    .select("id")
    .eq("slug", collectionSlug)
    .eq("active", true)
    .maybeSingle();

  if (collection) {
    const { fetchCollectionProductLinks, orderByCollectionLinks } =
      await import("@/lib/collection-products");
    const links = await fetchCollectionProductLinks(supabase, collection.id);

    if (links.length) {
      const productIds = links.map((l) => l.product_id);
      const { data: products } = await supabase
        .from("products")
        .select("*, categories(*)")
        .in("id", productIds)
        .eq("active", true);

      if (products?.length) {
        const ordered = orderByCollectionLinks(products as Product[], links).slice(
          0,
          limit
        );
        return enrichProductsWithVariantAggregates(supabase, ordered);
      }

      return [];
    }

    if (HOMEPAGE_COLLECTION_SLUGS.has(collectionSlug)) {
      return getAutoCollectionProducts(supabase, collectionSlug, limit);
    }

    return [];
  }

  if (HOMEPAGE_COLLECTION_SLUGS.has(collectionSlug)) {
    return getAutoCollectionProducts(supabase, collectionSlug, limit);
  }

  return useMockFallback()
    ? mockProductsForCollection(collectionSlug, limit)
    : [];
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const supabase = await getDataSupabase();
  if (!supabase) {
    const product = mockProducts.find((p) => p.slug === slug);
    if (!product) return null;
    const category = mockCategories.find((c) => c.id === product.category_id);
    return category ? { ...product, categories: category } : product;
  }

  const { data, error } = await supabase
    .from("products")
    .select("*, categories(*)")
    .eq("slug", slug)
    .eq("active", true)
    .single();

  if (error || !data) {
    if (!useMockFallback()) return null;
    const product = mockProducts.find((p) => p.slug === slug);
    if (!product) return null;
    const category = mockCategories.find((c) => c.id === product.category_id);
    return category ? { ...product, categories: category } : product;
  }

  const [product] = await enrichProductsWithVariantAggregates(supabase, [
    data as Product,
  ]);
  return product;
}

export async function getProductVariants(
  productId: string
): Promise<ProductVariant[]> {
  const supabase = await getDataSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("product_variants")
    .select("*")
    .eq("product_id", productId)
    .eq("active", true)
    .order("sort_order", { ascending: true });

  if (error) {
    if (/relation.*product_variants/i.test(error.message)) return [];
    return [];
  }

  return (data ?? []) as ProductVariant[];
}

export async function getRelatedProducts(
  product: Product,
  limit = 8
): Promise<Product[]> {
  const categorySlug =
    product.categories && !Array.isArray(product.categories)
      ? product.categories.slug
      : Array.isArray(product.categories) && product.categories[0]
        ? product.categories[0].slug
        : undefined;

  let related: Product[] = [];

  if (categorySlug) {
    related = await getProducts({
      categorySlug,
      limit: limit + 1,
    });
  }

  if (related.length <= 1) {
    const bestSellers = await getProductsByCollectionSlug("best-sellers", limit + 1);
    related = [...related, ...bestSellers];
  }

  const seen = new Set<string>([product.id]);
  const unique: Product[] = [];

  for (const item of related) {
    if (seen.has(item.id)) continue;
    seen.add(item.id);
    unique.push(item);
    if (unique.length >= limit) break;
  }

  return unique;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = await getDataSupabase();
  if (!supabase) {
    return {
      totalRevenue: 45280,
      totalOrders: 156,
      totalProducts: mockProducts.length,
      totalCustomers: 89,
      recentOrders: [],
      topProducts: mockProducts.slice(0, 5),
    };
  }

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
  const revenueStatuses = new Set([
    "paid",
    "processing",
    "shipped",
    "delivered",
  ]);
  const totalRevenue = orders
    .filter((o) => revenueStatuses.has(o.status))
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
  const supabase = await getDataSupabase();
  if (!supabase) return [];

  const { data } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .order("created_at", { ascending: false });

  return (data ?? []) as Order[];
}

export async function getOrderById(id: string): Promise<Order | null> {
  const supabase = await getDataSupabase();
  if (!supabase) return null;

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
  const supabase = await getDataSupabase();
  if (!supabase) return null;

  const { data } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("stripe_session_id", sessionId)
    .single();

  return (data as Order) ?? null;
}

export async function getAllProductsAdmin(): Promise<Product[]> {
  const supabase = await getDataSupabase();
  if (!supabase) return mockProducts;

  const { data } = await supabase
    .from("products")
    .select("*, categories(*)")
    .order("created_at", { ascending: false });

  const products = (data ?? []) as Product[];
  return enrichProductsWithVariantAggregates(supabase, products);
}

export async function getProductByIdAdmin(id: string): Promise<Product | null> {
  const supabase = await getDataSupabase();
  if (!supabase) {
    return mockProducts.find((p) => p.id === id) ?? null;
  }

  const { data } = await supabase
    .from("products")
    .select("*, categories(*)")
    .eq("id", id)
    .single();

  if (!data) {
    return useMockFallback()
      ? (mockProducts.find((p) => p.id === id) ?? null)
      : null;
  }

  return data as Product;
}

export async function getAllCategoriesAdmin(): Promise<Category[]> {
  const supabase = await getDataSupabase();
  if (!supabase) return mockCategories;

  const { data } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order");

  return (data ?? (useMockFallback() ? mockCategories : [])) as Category[];
}

export async function getCategoryByIdAdmin(
  id: string
): Promise<Category | null> {
  const categories = await getAllCategoriesAdmin();
  return categories.find((c) => c.id === id) ?? null;
}
