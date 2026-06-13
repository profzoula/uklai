import type { SupabaseClient } from "@supabase/supabase-js";
import { getDisplayPrices } from "@/lib/product-pricing";

export type ValidatedCheckoutItem = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string | null;
  freeShipping?: boolean;
  noShippingRequired?: boolean;
};

type RawCheckoutItem = {
  productId: string;
  variantId?: string | null;
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
    .select("id, name, price, compare_at_price, image_url, stock, active, free_shipping, no_shipping_required")
    .in("id", ids);

  if (error) {
    return { error: "Could not validate products." };
  }

  const byId = new Map((products ?? []).map((p) => [p.id, p]));
  const validated: ValidatedCheckoutItem[] = [];

  const variantIds = [
    ...new Set(
      items.map((i) => i.variantId).filter((id): id is string => !!id)
    ),
  ];
  const variantsById = new Map<
    string,
    {
      id: string;
      product_id: string;
      price: number;
      stock: number;
      image_url: string | null;
      color: string | null;
      active: boolean;
    }
  >();

  if (variantIds.length) {
    const { data: variants, error: variantError } = await supabase
      .from("product_variants")
      .select("id, product_id, price, stock, image_url, color, active")
      .in("id", variantIds);

    if (variantError && !/relation.*product_variants/i.test(variantError.message)) {
      return { error: "Could not validate product variants." };
    }

    for (const variant of variants ?? []) {
      variantsById.set(variant.id, variant);
    }
  }

  for (const item of items) {
    const product = byId.get(item.productId);
    if (!product) {
      return { error: `Product not found: ${item.name ?? item.productId}` };
    }
    if (!product.active) {
      return { error: `${product.name} is no longer available.` };
    }

    const variant = item.variantId
      ? variantsById.get(item.variantId)
      : undefined;

    if (item.variantId) {
      if (!variant || variant.product_id !== product.id || !variant.active) {
        return { error: `${product.name} variant is no longer available.` };
      }
    }

    const price = variant
      ? Number(variant.price)
      : getDisplayPrices(Number(product.price), product.compare_at_price)
          .currentPrice;
    const stock = variant ? Number(variant.stock) : Number(product.stock);
    const image = variant?.image_url ?? product.image_url ?? null;
    const variantLabel = variant?.color?.trim();
    const displayName = variantLabel
      ? `${product.name} (${variantLabel})`
      : product.name;

    const qty = Math.max(1, Math.floor(item.quantity));
    if (stock < qty) {
      return {
        error:
          stock <= 0
            ? `${displayName} is out of stock.`
            : `Only ${stock} left for ${displayName}.`,
      };
    }

    validated.push({
      productId: product.id,
      name: displayName,
      price,
      quantity: qty,
      image,
      freeShipping: Boolean(product.free_shipping),
      noShippingRequired: Boolean(product.no_shipping_required),
    });
  }

  return { items: validated };
}
