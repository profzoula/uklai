import Link from "next/link";
import { ShopSearchBar } from "@/components/store/ShopSearchBar";
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

function SidebarLink({
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
        "block rounded-lg px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        active
          ? "bg-primary-light text-primary font-semibold"
          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
      )}
    >
      {children}
    </Link>
  );
}

function SidebarSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">
        {title}
      </h2>
      <nav className="space-y-0.5">{children}</nav>
    </div>
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
  const isAllActive =
    !activeCategory && !collectionSlug && !isDeals && !isFeatured && !searchQuery;

  const href = (overrides: Parameters<typeof buildShopFilterHref>[1]) =>
    buildShopFilterHref(filters, overrides);

  return (
    <aside className="space-y-4 lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto lg:pr-1">
      <ShopSearchBar defaultQuery={searchQuery ?? ""} />

      <SidebarSection title="Browse">
        <SidebarLink href={href({ category: null, collection: null, deals: false, featured: false })} active={isAllActive}>
          All products
        </SidebarLink>
        <SidebarLink
          href={href({ category: null, collection: "best-sellers", deals: false, featured: false })}
          active={collectionSlug === "best-sellers"}
        >
          Best Sellers
        </SidebarLink>
        <SidebarLink
          href={href({ category: null, collection: "new-arrivals", deals: false, featured: false })}
          active={collectionSlug === "new-arrivals"}
        >
          New Arrivals
        </SidebarLink>
        <SidebarLink
          href={href({ category: null, collection: "deal-of-the-day", deals: false, featured: false })}
          active={collectionSlug === "deal-of-the-day"}
        >
          Deal of the Day
        </SidebarLink>
        <SidebarLink
          href={href({ category: null, collection: null, deals: true, featured: false })}
          active={isDeals}
        >
          Deals
        </SidebarLink>
        <SidebarLink
          href={href({ category: null, collection: null, deals: false, featured: true })}
          active={isFeatured}
        >
          Featured
        </SidebarLink>
      </SidebarSection>

      {categories.length > 0 && (
        <SidebarSection title="Categories">
          {categories.map((cat) => {
            const active =
              activeCategory === cat.slug &&
              !isDeals &&
              !isFeatured &&
              !collectionSlug;

            return (
              <SidebarLink
                key={cat.id}
                href={href({
                  category: cat.slug,
                  collection: null,
                  deals: false,
                  featured: false,
                })}
                active={active}
              >
                {cat.name}
              </SidebarLink>
            );
          })}
        </SidebarSection>
      )}

      {customCollections.length > 0 && (
        <SidebarSection title="Collections">
          {customCollections.map((col) => (
            <SidebarLink
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
            </SidebarLink>
          ))}
        </SidebarSection>
      )}
    </aside>
  );
}
