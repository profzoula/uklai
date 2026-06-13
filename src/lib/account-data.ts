import "server-only";

import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { Order, Product, ProductReview } from "@/types/database";

export async function getUserOrders(userId: string): Promise<Order[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = await createClient();
  const { data } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  return (data ?? []) as Order[];
}

export async function getUserDigitalDownloads(userId: string) {
  const orders = await getUserOrders(userId);
  const downloads: Array<{
    orderId: string;
    orderDate: string;
    itemId: string;
    productName: string;
    url: string;
  }> = [];

  for (const order of orders) {
    if (!["paid", "processing", "shipped", "delivered"].includes(order.status)) {
      continue;
    }
    for (const item of order.order_items ?? []) {
      if (item.digital_file_url) {
        downloads.push({
          orderId: order.id,
          orderDate: order.created_at,
          itemId: item.id,
          productName: item.product_name,
          url: item.digital_file_url,
        });
      }
    }
  }

  return downloads;
}

export async function getUserWishlistProducts(userId: string): Promise<Product[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = await createClient();
  const { data: rows } = await supabase
    .from("wishlist_items")
    .select("product_id, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  const ids = (rows ?? []).map((row) => row.product_id);
  if (ids.length === 0) return [];

  const { data: products } = await supabase
    .from("products")
    .select("*")
    .in("id", ids)
    .eq("status", "published");

  const byId = new Map((products ?? []).map((product) => [product.id, product]));
  return ids
    .map((id) => byId.get(id))
    .filter((product): product is Product => Boolean(product));
}

export async function getApprovedReviewsForProduct(
  productId: string
): Promise<ProductReview[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = await createClient();
  const { data } = await supabase
    .from("product_reviews")
    .select("*")
    .eq("product_id", productId)
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  return (data ?? []) as ProductReview[];
}
