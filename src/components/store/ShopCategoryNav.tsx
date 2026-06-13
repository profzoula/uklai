import Link from "next/link";
import { ChevronRight, Menu } from "lucide-react";
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
  const href = (overrides: Parameters<typeof buildShopFilterHref>[1]) =>
    buildShopFilterHref(filters, overrides);

  const isAllActive =
    !activeCategory && !collectionSlug && !isDeals && !isFeatured;

  function isCategoryActive(slug: string) {
    return (
      activeCategory === slug && !isDeals && !isFeatured && !collectionSlug
    );
  }

  return (
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

          return (
            <Link
              key={cat.id}
              href={href({
                category: cat.slug,
                collection: null,
                deals: false,
                featured: false,
              })}
              aria-current={active ? "page" : undefined}
              className={cn(
                "group flex items-center gap-3 px-4 py-2.5 text-sm border-b border-slate-100 last:border-b-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset",
                active
                  ? "bg-slate-100 text-slate-900 font-semibold"
                  : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <Icon
                className={cn(
                  "w-[18px] h-[18px] shrink-0",
                  active
                    ? "text-slate-700"
                    : "text-slate-400 group-hover:text-slate-600"
                )}
                strokeWidth={1.75}
              />
              <span className="flex-1 min-w-0 truncate">{cat.name}</span>
              <ChevronRight
                className={cn(
                  "w-3.5 h-3.5 shrink-0 text-slate-400 transition-opacity",
                  active ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                )}
                aria-hidden="true"
              />
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
