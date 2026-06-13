"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronRight, Menu, Tag } from "lucide-react";
import { getCategoryIcon } from "@/lib/category-icons";
import { buildShopFilterHref, type ShopFilters } from "@/lib/shop-filter-href";
import type { Category } from "@/types/database";
import { cn } from "@/lib/utils";

type Props = {
  categories: Category[];
  filters: ShopFilters;
  activeCategory?: string;
  isDeals: boolean;
  isFeatured: boolean;
  collectionSlug?: string;
};

export function ShopCategoryNav({
  categories,
  filters,
  activeCategory,
  isDeals,
  isFeatured,
  collectionSlug,
}: Props) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

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

  return (
    <div
      className="relative"
      onMouseLeave={() => setHoveredId(null)}
    >
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <Link
          href={href({ category: null, collection: null, deals: false, featured: false })}
          className={cn(
            "flex items-center gap-2.5 px-4 py-3 border-b border-slate-200 text-sm font-bold transition-colors",
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
                onMouseEnter={() => setHoveredId(cat.id)}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 px-4 py-2.5 text-sm border-b border-slate-100 last:border-b-0 transition-colors",
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
          className="hidden lg:block absolute left-full top-0 z-40 ml-1 w-[280px] rounded-xl border border-slate-200 bg-white shadow-lg p-4"
          onMouseEnter={() => setHoveredId(hoveredCategory.id)}
        >
          <p className="text-base font-bold text-slate-900">
            {hoveredCategory.name}
          </p>
          {hoveredCategory.description && (
            <p className="mt-1.5 text-sm text-slate-500 line-clamp-3">
              {hoveredCategory.description}
            </p>
          )}
          <div className="mt-4 space-y-1">
            <Link
              href={href({
                category: hoveredCategory.slug,
                collection: null,
                deals: false,
                featured: false,
              })}
              className="flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-primary hover:bg-primary-light transition-colors"
            >
              Shop all
              <ChevronRight className="w-4 h-4" />
            </Link>
            <Link
              href={href({
                category: hoveredCategory.slug,
                collection: null,
                deals: true,
                featured: false,
              })}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <Tag className="w-4 h-4 text-red-500" />
              Deals in {hoveredCategory.name}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
