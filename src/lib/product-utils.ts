import type { Product } from "@/types/database";

const galleryAngles = ["center", "top", "entropy", "edges"] as const;

export function getProductGallery(product: Product): string[] {
  if (product.gallery_urls?.length) {
    return product.gallery_urls;
  }

  const base = product.image_url;
  if (!base) return [];

  const root = base.split("?")[0];
  return galleryAngles.map(
    (crop) => `${root}?w=700&h=700&fit=crop&crop=${crop}&auto=format`
  );
}

export function getProductHighlights(product?: Product): string[] {
  if (product?.highlights?.length) {
    return product.highlights.filter(Boolean);
  }

  return [
    "High-quality material",
    "Comfortable for everyday use",
    "Available in different sizes",
  ];
}

export function getProductCategory(product: Product) {
  if (product.categories) {
    return {
      name: product.categories.name,
      slug: product.categories.slug,
    };
  }

  return null;
}
