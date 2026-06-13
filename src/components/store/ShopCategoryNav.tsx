"use client";

import Link from "next/link";
import { useCallback, useRef, useState } from "react";
import { ChevronRight, Menu } from "lucide-react";
import { getCategoryIcon } from "@/lib/category-icons";
import { getDisplayPrices } from "@/lib/product-pricing";
import { buildShopFilterHref, type ShopFilters } from "@/lib/shop-filter-href";
import type { Category } from "@/types/database";
import { cn, formatPrice } from "@/lib/utils";

type PreviewProduct = {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
  price: number;
  compare_at_price: number | null;
};

type Props = {
  categories: Category[];
  filters: ShopFilters;
  activeCategory?: string;
  isDeals: boolean;
  isFeatured: boolean;
  collectionSlug?: string;
};

function PreviewSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="aspect-square rounded-lg bg-slate-100" />
          <div className="mt-2 h-3 rounded bg-slate-100" />
          <div className="mt-1.5 h-4 w-16 rounded bg-slate-100" />
        </div>
      ))}
    </div>
  );
}

export function ShopCategoryNav({
  categories,
  filters,
  activeCategory,
  isDeals,
  isFeatured,
  collectionSlug,
}: Props) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [previewProducts, setPreviewProducts] = useState<PreviewProduct[]>([]);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const cacheRef = useRef<Map<string, PreviewProduct[]>>(new Map());

  const href = (overrides: Parameters<typeof buildShopFilterHref>[1]) =>
    buildShopFilterHref(filters, overrides);

  const hoveredCategory =
    categories.find((cat) => cat.id === hoveredId) ?? null;

  const isAllActive =
    !activeCategory && !collectionSlug && !isDeals && !isFeatured;

  function isCategoryActive(slug: string) {
    return (
      activeCategory === slug && !isDeals && !isFeatured && !collectionSlug
    );
  }

  const loadPreview = useCallback(async (slug: string) => {
    const cached = cacheRef.current.get(slug);
    if (cached) {
      setPreviewProducts(cached);
      setLoadingPreview(false);
      return;
    }

    setLoadingPreview(true);
    try {
      const res = await fetch(
        `/api/shop/category-preview?slug=${encodeURIComponent(slug)}`
      );
      const data = (await res.json()) as { products?: PreviewProduct[] };
      const products = data.products ?? [];
      cacheRef.current.set(slug, products);
      setPreviewProducts(products);
    } catch {
      setPreviewProducts([]);
    } finally {
      setLoadingPreview(false);
    }
  }, []);

  function handleCategoryHover(categoryId: string, slug: string) {
    setHoveredId(categoryId);
    const cached = cacheRef.current.get(slug);
    if (cached) {
      setPreviewProducts(cached);
      setLoadingPreview(false);
    } else {
      setPreviewProducts([]);
      void loadPreview(slug);
    }
  }

  return (
    <div
      className="relative overflow-visible"
      onMouseLeave={() => {
        setHoveredId(null);
        setLoadingPreview(false);
      }}
    >
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <Link
          href={href({
            category: null,
            collection: null,
            deals: false,
            featured: false,
          })}
          className={cn(
            "flex items-center gap-2.5 px-4 py-3 border-b border-slate-200 text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset",
            isAllActive
              ? "bg-primary-light text-primary"
              : "text-slate-900 hover:bg-slate-50"
          )}
          onMouseEnter={() => setHoveredId(null)}
        >
          <Menu className="w-4 h-4 shrink-0" strokeWidth={2.25} />
          All Categories
        </Link>

        <nav
          aria-label="Categories"
          className="max-h-[min(520px,55vh)] overflow-y-auto overscroll-contain"
        >
          {categories.map((cat) => {
            const Icon = getCategoryIcon(cat.slug, cat.name);
            const active = isCategoryActive(cat.slug);
            const hovered = hoveredId === cat.id;

            return (
              <Link
                key={cat.id}
                href={href({
                  category: cat.slug,
                  collection: null,
                  deals: false,
                  featured: false,
                })}
                onMouseEnter={() => handleCategoryHover(cat.id, cat.slug)}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 px-4 py-2.5 text-sm border-b border-slate-100 last:border-b-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset",
                  active || hovered
                    ? "bg-slate-100 text-slate-900 font-semibold"
                    : "text-slate-700 hover:bg-slate-50"
                )}
              >
                <Icon
                  className={cn(
                    "w-[18px] h-[18px] shrink-0",
                    active || hovered ? "text-slate-700" : "text-slate-400"
                  )}
                  strokeWidth={1.75}
                />
                <span className="flex-1 min-w-0 truncate">{cat.name}</span>
                <ChevronRight
                  className={cn(
                    "w-3.5 h-3.5 shrink-0 transition-opacity",
                    hovered ? "opacity-100 text-slate-500" : "opacity-0"
                  )}
                  aria-hidden="true"
                />
              </Link>
            );
          })}
        </nav>
      </div>

      {hoveredCategory && (
        <div
          className="hidden lg:block absolute left-full top-0 z-50 ml-2 w-[min(560px,calc(100vw-320px))] max-h-[min(520px,55vh)] overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-xl p-4"
          onMouseEnter={() => setHoveredId(hoveredCategory.id)}
        >
          <div className="flex items-center justify-between gap-3 mb-4">
            <h3 className="text-base font-bold text-slate-900">
              {hoveredCategory.name}
            </h3>
            <Link
              href={href({
                category: hoveredCategory.slug,
                collection: null,
                deals: false,
                featured: false,
              })}
              className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:text-primary-dark shrink-0"
            >
              View all
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {loadingPreview ? (
            <PreviewSkeleton />
          ) : previewProducts.length === 0 ? (
            <p className="text-sm text-slate-500 py-8 text-center">
              No products in this category yet.
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {previewProducts.map((product) => {
                const { currentPrice } = getDisplayPrices(
                  product.price,
                  product.compare_at_price
                );

                return (
                  <Link
                    key={product.id}
                    href={`/products/${product.slug}`}
                    className="group rounded-lg border border-slate-100 p-2 hover:border-primary/30 hover:bg-slate-50/80 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    <div className="aspect-square rounded-md bg-slate-50 overflow-hidden flex items-center justify-center p-1.5">
                      {product.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <span className="text-[10px] text-slate-400 text-center px-1">
                          No image
                        </span>
                      )}
                    </div>
                    <p className="mt-2 text-xs text-slate-700 line-clamp-2 leading-snug min-h-[2rem]">
                      {product.name}
                    </p>
                    <p className="mt-1 text-sm font-bold text-slate-900">
                      {formatPrice(currentPrice)}
                    </p>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
