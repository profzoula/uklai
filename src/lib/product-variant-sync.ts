import type { SupabaseClient } from "@supabase/supabase-js";
import type { Product } from "@/types/database";

type VariantRow = {
  product_id: string;
  price: number;
  compare_at_price: number | null;
  stock: number;
  active: boolean;
  sort_order: number;
};

function pickDisplayVariant(variants: VariantRow[]): VariantRow {
  return variants.reduce((best, variant) =>
    Number(variant.price) < Number(best.price) ? variant : best
  );
}

function aggregateProductFromVariants(
  product: Product,
  variants: VariantRow[]
): Product {
  if (!variants.length) return product;

  const displayVariant = pickDisplayVariant(variants);
  const totalStock = variants.reduce(
    (sum, variant) => sum + Math.max(0, Number(variant.stock)),
    0
  );

  return {
    ...product,
    catalog_type: product.catalog_type === "simple" ? "simple" : "variable",
    stock: totalStock,
    price: Number(displayVariant.price),
    compare_at_price: displayVariant.compare_at_price,
  };
}

export async function enrichProductsWithVariantAggregates(
  supabase: SupabaseClient,
  products: Product[]
): Promise<Product[]> {
  if (!products.length) return products;

  const productIds = products.map((product) => product.id);
  const { data: variants, error } = await supabase
    .from("product_variants")
    .select("product_id, price, compare_at_price, stock, active, sort_order")
    .in("product_id", productIds)
    .eq("active", true);

  if (error || !variants?.length) return products;

  const variantsByProduct = new Map<string, VariantRow[]>();
  for (const variant of variants as VariantRow[]) {
    const list = variantsByProduct.get(variant.product_id) ?? [];
    list.push(variant);
    variantsByProduct.set(variant.product_id, list);
  }

  return products.map((product) => {
    const productVariants = variantsByProduct.get(product.id);
    if (!productVariants?.length) return product;
    return aggregateProductFromVariants(product, productVariants);
  });
}

export async function syncParentProductFromVariants(
  supabase: SupabaseClient,
  productId: string
): Promise<void> {
  const { data: variants } = await supabase
    .from("product_variants")
    .select("product_id, price, compare_at_price, stock, active, sort_order")
    .eq("product_id", productId)
    .eq("active", true);

  if (!variants?.length) {
    await supabase
      .from("products")
      .update({
        catalog_type: "simple",
        stock: 0,
        updated_at: new Date().toISOString(),
      })
      .eq("id", productId);
    return;
  }

  const displayVariant = pickDisplayVariant(variants as VariantRow[]);
  const totalStock = variants.reduce(
    (sum, variant) => sum + Math.max(0, Number(variant.stock)),
    0
  );

  await supabase
    .from("products")
    .update({
      catalog_type: "variable",
      stock: totalStock,
      price: Number(displayVariant.price),
      compare_at_price: displayVariant.compare_at_price,
      updated_at: new Date().toISOString(),
    })
    .eq("id", productId);
}
