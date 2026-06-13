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
  detailsSection?: React.ReactNode;
};

export function ProductDetailMain({
  product,
  variants,
  gallery,
  category,
  highlightPreview = [],
  settings,
  detailsSection,
}: Props) {
  const availableVariants = useMemo(() => activeVariants(variants), [variants]);
  const isVariableProduct =
    product.catalog_type === "variable" ||
    (product.catalog_type !== "simple" && availableVariants.length > 0);
  const [selectedVariantId, setSelectedVariantId] = useState(
    () => availableVariants[0]?.id ?? ""
  );

  const selectedVariant =
    availableVariants.find((v) => v.id === selectedVariantId) ??
    availableVariants[0] ??
    null;

  const displayProduct = useMemo(
    () =>
      isVariableProduct && selectedVariant
        ? productWithVariant(product, selectedVariant)
        : product,
    [product, selectedVariant, isVariableProduct]
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
    <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-10 items-start pb-20 lg:pb-0">
      <div className="order-1 min-w-0">
        <ProductGallery
          images={displayGallery}
          productName={product.name}
          discountPercent={discountPercent}
          preferredImage={selectedVariant?.image_url}
        />
      </div>

      <div className="order-2 lg:row-span-2 lg:col-start-2 lg:row-start-1 lg:pt-1 min-w-0">
        {category && (
          <Link
            href={`/shop?category=${category.slug}`}
            className="inline-flex text-sm font-semibold text-primary bg-primary-light px-3.5 py-1.5 rounded-full hover:bg-primary/15 transition-colors mb-3"
          >
            {category.name}
          </Link>
        )}

        <h1 className="text-xl leading-snug sm:text-[1.75rem] lg:text-3xl font-bold text-slate-900 tracking-tight">
          {product.name}
        </h1>

        <div className="mt-3">
          <ProductRating product={product} />
        </div>

        <div className="mt-5">
          <ProductPriceBlock product={displayProduct} />
        </div>

        {isVariableProduct && availableVariants.length > 0 && (
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

        <div className="mt-6 hidden lg:block">
          <ProductActions
            product={displayProduct}
            variantId={selectedVariant?.id}
            variantLabel={selectedVariant?.color}
            requireVariant={
              isVariableProduct &&
              availableVariants.length > 0 &&
              !selectedVariant
            }
          />
        </div>

        <ProductDetailAccordion settings={settings} />

        <ProductShareRow
          sku={displayProduct.sku}
          productName={product.name}
        />
      </div>

      {detailsSection && (
        <div className="order-3 lg:order-none lg:col-start-1 lg:row-start-2 min-w-0">
          {detailsSection}
        </div>
      )}

      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur-sm safe-bottom safe-x shadow-[0_-4px_20px_rgba(0,0,0,0.08)] px-4 py-3">
        <ProductActions
          product={displayProduct}
          variantId={selectedVariant?.id}
          variantLabel={selectedVariant?.color}
          requireVariant={
            isVariableProduct &&
            availableVariants.length > 0 &&
            !selectedVariant
          }
          compact
        />
      </div>
    </div>
  );
}
