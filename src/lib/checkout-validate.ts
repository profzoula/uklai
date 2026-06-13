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
  weight?: number | null;
};

type RawCheckoutItem = {
  productId: string;
  variantId?: string | null;
  variantLabel?: string | null;
  name?: string;
  price?: number;
  quantity: number;
  image?: string | null;
};

type ProductRow = {
  id: string;
  name: string;
  price: number;
  compare_at_price: number | null;
  image_url: string | null;
  stock: number;
  active: boolean;
  catalog_type: string | null;
  free_shipping: boolean | null;
  no_shipping_required: boolean | null;
  weight: number | null;
};

type VariantRow = {
  id: string;
  product_id: string;
  price: number;
  compare_at_price: number | null;
  stock: number;
  image_url: string | null;
  color: string | null;
  active: boolean;
  sort_order: number;
};

export type ResolvedCartLine = {
  productId: string;
  variantId: string | null;
  variantLabel: string | null;
  name: string;
  price: number;
  quantity: number;
  image: string | null;
  stock: number;
  slug?: string;
};

function pickDisplayVariant(variants: VariantRow[]): VariantRow {
  return variants.reduce((best, variant) =>
    Number(variant.price) < Number(best.price) ? variant : best
  );
}

function totalVariantStock(variants: VariantRow[]): number {
  return variants.reduce(
    (sum, variant) => sum + Math.max(0, Number(variant.stock)),
    0
  );
}

function resolveVariantForItem(
  product: ProductRow,
  item: RawCheckoutItem,
  variantsById: Map<string, VariantRow>,
  activeByProduct: Map<string, VariantRow[]>
): VariantRow | undefined {
  const productVariants = activeByProduct.get(product.id) ?? [];

  if (item.variantId) {
    const direct = variantsById.get(item.variantId);
    if (direct?.product_id === product.id && direct.active) {
      return direct;
    }

    if (item.variantLabel?.trim()) {
      const label = item.variantLabel.trim().toLowerCase();
      const byLabel = productVariants.find(
        (variant) => variant.color?.trim().toLowerCase() === label
      );
      if (byLabel) return byLabel;
    }

    if (productVariants.length === 1) return productVariants[0];
    if (productVariants.length > 1) return pickDisplayVariant(productVariants);
    return undefined;
  }

  if (product.catalog_type === "variable" && productVariants.length > 0) {
    return pickDisplayVariant(productVariants);
  }

  return undefined;
}

function resolveStock(
  product: ProductRow,
  variant: VariantRow | undefined,
  productVariants: VariantRow[]
): number {
  if (variant) return Number(variant.stock);
  if (product.catalog_type === "variable" && productVariants.length > 0) {
    return totalVariantStock(productVariants);
  }
  return Number(product.stock);
}

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
    .select(
      "id, name, price, compare_at_price, image_url, stock, active, catalog_type, free_shipping, no_shipping_required, weight"
    )
    .in("id", ids);

  if (error) {
    return { error: "Could not validate products." };
  }

  const byId = new Map((products ?? []).map((p) => [p.id, p as ProductRow]));
  const validated: ValidatedCheckoutItem[] = [];

  const variantIds = [
    ...new Set(
      items.map((i) => i.variantId).filter((id): id is string => !!id)
    ),
  ];
  const variantsById = new Map<string, VariantRow>();
  const activeByProduct = new Map<string, VariantRow[]>();

  const { data: allVariants, error: variantError } = await supabase
    .from("product_variants")
    .select(
      "id, product_id, price, compare_at_price, stock, image_url, color, active, sort_order"
    )
    .in("product_id", ids)
    .eq("active", true)
    .order("sort_order", { ascending: true });

  if (variantError && !/relation.*product_variants/i.test(variantError.message)) {
    return { error: "Could not validate product variants." };
  }

  for (const variant of (allVariants ?? []) as VariantRow[]) {
    variantsById.set(variant.id, variant);
    const list = activeByProduct.get(variant.product_id) ?? [];
    list.push(variant);
    activeByProduct.set(variant.product_id, list);
  }

  // Also load explicitly referenced variant ids that may be inactive/stale.
  const missingVariantIds = variantIds.filter((id) => !variantsById.has(id));
  if (missingVariantIds.length) {
    const { data: staleVariants } = await supabase
      .from("product_variants")
      .select(
        "id, product_id, price, compare_at_price, stock, image_url, color, active, sort_order"
      )
      .in("id", missingVariantIds);

    for (const variant of (staleVariants ?? []) as VariantRow[]) {
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

    const productVariants = activeByProduct.get(product.id) ?? [];
    const variant = resolveVariantForItem(
      product,
      item,
      variantsById,
      activeByProduct
    );

    if (
      item.variantId &&
      product.catalog_type === "variable" &&
      productVariants.length > 0 &&
      !variant
    ) {
      return { error: `${product.name} variant is no longer available.` };
    }

    const price = variant
      ? Number(variant.price)
      : getDisplayPrices(Number(product.price), product.compare_at_price)
          .currentPrice;
    const stock = resolveStock(product, variant, productVariants);
    const image = variant?.image_url ?? product.image_url ?? null;
    const variantLabel = variant?.color?.trim() || item.variantLabel?.trim() || null;
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
      weight: product.weight == null ? null : Number(product.weight),
    });
  }

  return { items: validated };
}

export async function resolveCartLines(
  supabase: SupabaseClient,
  items: RawCheckoutItem[]
): Promise<{ items: ResolvedCartLine[] } | { error: string }> {
  if (!items?.length) {
    return { items: [] };
  }

  const ids = [...new Set(items.map((i) => i.productId).filter(Boolean))];
  if (!ids.length) {
    return { error: "Invalid cart items." };
  }

  const { data: products, error } = await supabase
    .from("products")
    .select(
      "id, name, slug, price, compare_at_price, image_url, stock, active, catalog_type"
    )
    .in("id", ids);

  if (error) {
    return { error: "Could not refresh cart." };
  }

  const byId = new Map(
    (products ?? []).map((p) => [
      p.id,
      p as ProductRow & { slug: string },
    ])
  );

  const variantsById = new Map<string, VariantRow>();
  const activeByProduct = new Map<string, VariantRow[]>();

  const { data: allVariants, error: variantError } = await supabase
    .from("product_variants")
    .select(
      "id, product_id, price, compare_at_price, stock, image_url, color, active, sort_order"
    )
    .in("product_id", ids)
    .eq("active", true)
    .order("sort_order", { ascending: true });

  if (variantError && !/relation.*product_variants/i.test(variantError.message)) {
    return { error: "Could not refresh cart variants." };
  }

  for (const variant of (allVariants ?? []) as VariantRow[]) {
    variantsById.set(variant.id, variant);
    const list = activeByProduct.get(variant.product_id) ?? [];
    list.push(variant);
    activeByProduct.set(variant.product_id, list);
  }

  const resolved: ResolvedCartLine[] = [];

  for (const item of items) {
    const product = byId.get(item.productId);
    if (!product || !product.active) continue;

    const productVariants = activeByProduct.get(product.id) ?? [];
    const variant = resolveVariantForItem(
      product,
      item,
      variantsById,
      activeByProduct
    );

    const stock = resolveStock(product, variant, productVariants);
    if (stock <= 0) continue;

    const price = variant
      ? Number(variant.price)
      : getDisplayPrices(Number(product.price), product.compare_at_price)
          .currentPrice;
    const image = variant?.image_url ?? product.image_url ?? null;
    const variantLabel = variant?.color?.trim() || item.variantLabel?.trim() || null;
    const qty = Math.min(Math.max(1, Math.floor(item.quantity)), stock);

    resolved.push({
      productId: product.id,
      variantId: variant?.id ?? null,
      variantLabel,
      name: product.name,
      price,
      quantity: qty,
      image,
      stock,
      slug: (product as ProductRow & { slug: string }).slug,
    });
  }

  return { items: resolved };
}
