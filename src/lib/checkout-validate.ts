import type { SupabaseClient } from "@supabase/supabase-js";

export type ValidatedCheckoutItem = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string | null;
};

type RawCheckoutItem = {
  productId: string;
  name?: string;
  price?: number;
  quantity: number;
  image?: string | null;
};

export async function validateCheckoutItems(
  supabase: SupabaseClient,
  items: RawCheckoutItem[]
): Promise<{ items: ValidatedCheckoutItem[] } | { error: string }> {
  if (!items?.length) {
    return { error: "No items in cart." };
  }

  const ids = [...new Set(items.map((i) => i.productId).filter(Boolean))];
  if (!ids.length) {
    return { error: "Invalid cart items." };
  }

  const { data: products, error } = await supabase
    .from("products")
    .select("id, name, price, image_url, stock, active")
    .in("id", ids);

  if (error) {
    return { error: "Could not validate products." };
  }

  const byId = new Map((products ?? []).map((p) => [p.id, p]));
  const validated: ValidatedCheckoutItem[] = [];

  for (const item of items) {
    const product = byId.get(item.productId);
    if (!product) {
      return { error: `Product not found: ${item.name ?? item.productId}` };
    }
    if (!product.active) {
      return { error: `${product.name} is no longer available.` };
    }

    const qty = Math.max(1, Math.floor(item.quantity));
    if (product.stock < qty) {
      return {
        error:
          product.stock <= 0
            ? `${product.name} is out of stock.`
            : `Only ${product.stock} left for ${product.name}.`,
      };
    }

    validated.push({
      productId: product.id,
      name: product.name,
      price: Number(product.price),
      quantity: qty,
      image: product.image_url ?? null,
    });
  }

  return { items: validated };
}
