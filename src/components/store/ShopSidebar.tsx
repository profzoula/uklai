import Link from "next/link";
import { ShopSearchBar } from "@/components/store/ShopSearchBar";
import { ShopCategoryNav } from "@/components/store/ShopCategoryNav";
import { buildShopFilterHref, type ShopFilters } from "@/lib/shop-filter-href";
import type { Category } from "@/types/database";
import { cn } from "@/lib/utils";

type CollectionItem = {
  id: string;
  name: string;
  slug: string;
};

type Props = {
  categories: Category[];
  customCollections: CollectionItem[];
  searchQuery?: string;
  activeCategory?: string;
  collectionSlug?: string;
  isDeals: boolean;
  isFeatured: boolean;
  filters: ShopFilters;
};

function QuickLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "text-xs font-medium transition-colors",
        active
          ? "text-primary font-semibold"
          : "text-slate-500 hover:text-primary"
      )}
    >
      {children}
    </Link>
  );
}

export function ShopSidebar({
  categories,
  customCollections,
  searchQuery,
  activeCategory,
  collectionSlug,
  isDeals,
  isFeatured,
  filters,
}: Props) {
  const href = (overrides: Parameters<typeof buildShopFilterHref>[1]) =>
    buildShopFilterHref(filters, overrides);

  return (
    <aside className="relative space-y-4 lg:sticky lg:top-24 lg:pr-1 overflow-visible">
      <ShopSearchBar defaultQuery={searchQuery ?? ""} />

      {categories.length > 0 && (
        <ShopCategoryNav
          categories={categories}
          filters={filters}
          activeCategory={activeCategory}
          isDeals={isDeals}
          isFeatured={isFeatured}
          collectionSlug={collectionSlug}
        />
      )}

      <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">
          Quick links
        </p>
        <div className="flex flex-wrap gap-x-3 gap-y-2">
          <QuickLink
            href={href({ category: null, collection: "best-sellers", deals: false, featured: false })}
            active={collectionSlug === "best-sellers"}
          >
            Best Sellers
          </QuickLink>
          <QuickLink
            href={href({ category: null, collection: "new-arrivals", deals: false, featured: false })}
            active={collectionSlug === "new-arrivals"}
          >
            New Arrivals
          </QuickLink>
          <QuickLink
            href={href({ category: null, collection: "deal-of-the-day", deals: false, featured: false })}
            active={collectionSlug === "deal-of-the-day"}
          >
            Deal of the Day
          </QuickLink>
          <QuickLink
            href={href({ category: null, collection: null, deals: true, featured: false })}
            active={isDeals}
          >
            Deals
          </QuickLink>
          <QuickLink
            href={href({ category: null, collection: null, deals: false, featured: true })}
            active={isFeatured}
          >
            Featured
          </QuickLink>
        </div>

        {customCollections.length > 0 && (
          <>
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500 mt-4 mb-2">
              Collections
            </p>
            <div className="flex flex-wrap gap-x-3 gap-y-2">
              {customCollections.map((col) => (
                <QuickLink
                  key={col.id}
                  href={href({
                    category: null,
                    collection: col.slug,
                    deals: false,
                    featured: false,
                  })}
                  active={collectionSlug === col.slug}
                >
                  {col.name}
                </QuickLink>
              ))}
            </div>
          </>
        )}
      </div>
    </aside>
  );
}
