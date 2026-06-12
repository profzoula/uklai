import type { Product, ProductVariant } from "@/types/database";

export function cartLineKey(productId: string, variantId?: string | null): string {
  return variantId ? `${productId}:${variantId}` : productId;
}

export function productWithVariant(
  product: Product,
  variant: ProductVariant
): Product {
  return {
    ...product,
    price: variant.price,
    compare_at_price: variant.compare_at_price,
    stock: variant.stock,
    image_url: variant.image_url || product.image_url,
    sku: variant.sku || product.sku,
    color: variant.color || product.color,
  };
}

export function activeVariants(variants: ProductVariant[]): ProductVariant[] {
  return variants.filter((v) => v.active !== false);
}
