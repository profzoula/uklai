"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Category, Product, ProductVariant } from "@/types/database";
import {
  activeVariants,
  productWithVariant,
} from "@/lib/product-variant-utils";
import { getDisplayPrices } from "@/lib/product-pricing";
import { ProductGallery } from "@/components/store/ProductGallery";
import { ProductRating } from "@/components/store/ProductRating";
import { ProductPriceBlock } from "@/components/store/ProductPriceBlock";
import { ProductVariantSelector } from "@/components/store/ProductVariantSelector";
import { ProductActions } from "@/components/store/ProductActions";
import { ProductDetailAccordion } from "@/components/store/ProductDetailAccordion";
import { ProductShareRow } from "@/components/store/ProductShareRow";
import type { AllStoreSettings } from "@/lib/store-settings-types";

type Props = {
  product: Product;
  variants: ProductVariant[];
  gallery: string[];
  category: Category | null;
  highlightPreview?: string[];
  settings: AllStoreSettings;
};

export function ProductDetailMain({
  product,
  variants,
  gallery,
  category,
  highlightPreview = [],
  settings,
}: Props) {
  const availableVariants = useMemo(() => activeVariants(variants), [variants]);
  const [selectedVariantId, setSelectedVariantId] = useState(
    () => availableVariants[0]?.id ?? ""
  );

  const selectedVariant =
    availableVariants.find((v) => v.id === selectedVariantId) ??
    availableVariants[0] ??
    null;

  const displayProduct = useMemo(
    () =>
      selectedVariant
        ? productWithVariant(product, selectedVariant)
        : product,
    [product, selectedVariant]
  );

  const displayGallery = useMemo(() => {
    const variantImage = selectedVariant?.image_url;
    if (!variantImage) return gallery;
    const rest = gallery.filter((url) => url !== variantImage);
    return [variantImage, ...rest];
  }, [gallery, selectedVariant?.image_url]);

  const { currentPrice, regularPrice, onSale } = getDisplayPrices(
    displayProduct.price,
    displayProduct.compare_at_price
  );
  const discountPercent =
    onSale && regularPrice != null
      ? Math.round(((regularPrice - currentPrice) / regularPrice) * 100)
      : null;

  return (
    <div className="grid lg:grid-cols-2 gap-8 lg:gap-10 items-start">
      <ProductGallery
        images={displayGallery}
        productName={product.name}
        discountPercent={discountPercent}
        preferredImage={selectedVariant?.image_url}
      />

      <div className="lg:pt-1">
        {category && (
          <Link
            href={`/shop?category=${category.slug}`}
            className="inline-flex text-sm font-semibold text-primary bg-primary-light px-3.5 py-1.5 rounded-full hover:bg-primary/15 transition-colors mb-3"
          >
            {category.name}
          </Link>
        )}

        <h1 className="text-[1.65rem] leading-snug sm:text-[1.75rem] lg:text-3xl font-bold text-slate-900 tracking-tight">
          {product.name}
        </h1>

        <div className="mt-3">
          <ProductRating product={product} />
        </div>

        <div className="mt-5">
          <ProductPriceBlock product={displayProduct} />
        </div>

        {availableVariants.length > 1 && (
          <ProductVariantSelector
            variants={availableVariants}
            selectedId={selectedVariant?.id ?? ""}
            onSelect={(variant) => setSelectedVariantId(variant.id)}
          />
        )}

        {highlightPreview.length > 0 && (
          <ul className="mt-5 space-y-1.5 border-t border-slate-100 pt-5">
            {highlightPreview.map((item) => (
              <li
                key={item}
                className="text-base sm:text-sm text-slate-600 pl-1 leading-relaxed"
              >
                {item}
              </li>
            ))}
          </ul>
        )}

        <div className="mt-6">
          <ProductActions
            product={displayProduct}
            variantId={selectedVariant?.id}
            variantLabel={selectedVariant?.color}
            requireVariant={
              availableVariants.length > 1 && !selectedVariant
            }
          />
        </div>

        <ProductDetailAccordion settings={settings} />

        <ProductShareRow
          sku={displayProduct.sku}
          productName={product.name}
        />
      </div>
    </div>
  );
}
