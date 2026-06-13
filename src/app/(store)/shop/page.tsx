import Link from "next/link";
import {
  getProducts,
  getCategories,
  getProductsByCollectionSlug,
  getCollectionBySlug,
  getStoreCollections,
} from "@/lib/data";
import { ProductCard } from "@/components/store/ProductCard";
import { ShopSidebar } from "@/components/store/ShopSidebar";
import { ShopMobileFilterShell } from "@/components/store/ShopMobileFilterShell";

type Props = {
  searchParams: Promise<{
    category?: string;
    collection?: string;
    deals?: string;
    featured?: string;
    q?: string;
  }>;
};

export const dynamic = "force-dynamic";

const BUILT_IN_COLLECTION_SLUGS = new Set([
  "best-sellers",
  "new-arrivals",
  "deal-of-the-day",
]);

export default async function ShopPage({ searchParams }: Props) {
  const params = await searchParams;
  const isDeals = params.deals === "true";
  const isFeatured = params.featured === "true";
  const searchQuery = params.q?.trim();
  const collectionSlug = params.collection?.trim();

  const [categories, collectionMeta, storeCollections] = await Promise.all([
    getCategories(),
    collectionSlug ? getCollectionBySlug(collectionSlug) : Promise.resolve(null),
    getStoreCollections(),
  ]);

  const customCollections = storeCollections.filter(
    (c) => !BUILT_IN_COLLECTION_SLUGS.has(c.slug) && c.slug !== "featured"
  );

  const products = collectionSlug
    ? await getProductsByCollectionSlug(collectionSlug, 50)
    : await getProducts({
        categorySlug: params.category,
        featured: isFeatured && !isDeals,
        deals: isDeals,
        search: searchQuery,
      });

  const activeCategory = categories.find((c) => c.slug === params.category);

  const pageTitle = searchQuery
    ? `Results for "${searchQuery}"`
    : collectionMeta
      ? collectionMeta.name
      : isDeals
        ? "Top Deals"
        : isFeatured
          ? "Featured Products"
          : activeCategory
            ? activeCategory.name
            : "All Products";

  const pageDescription = searchQuery
    ? `${products.length} product${products.length === 1 ? "" : "s"} found`
    : collectionMeta?.description
      ? collectionMeta.description
      : isDeals
        ? "Save big on products with exclusive discounts."
        : activeCategory?.description ??
          "Browse our full collection of premium products.";

  const shopFilters = {
    category: params.category,
    collection: collectionSlug,
    deals: isDeals,
    featured: isFeatured,
    q: searchQuery,
  };

  const activeFilterCount = [
    params.category,
    collectionSlug,
    isDeals,
    isFeatured,
    searchQuery,
  ].filter(Boolean).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      <div className="grid lg:grid-cols-[260px_minmax(0,1fr)] gap-4 lg:gap-8 items-start">
        <div className="relative z-30 min-w-0">
          <ShopMobileFilterShell activeCount={activeFilterCount}>
            <ShopSidebar
            categories={categories}
            customCollections={customCollections}
            searchQuery={searchQuery}
            activeCategory={params.category}
            collectionSlug={collectionSlug}
            isDeals={isDeals}
            isFeatured={isFeatured}
            filters={shopFilters}
          />
          </ShopMobileFilterShell>
        </div>

        <div className="relative z-0 min-w-0">
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
              {pageTitle}
            </h1>
            <p className="mt-2 text-slate-600">{pageDescription}</p>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-16 sm:py-20">
              <p className="text-slate-500 mb-4">No products found.</p>
              <Link
                href="/shop"
                className="inline-flex items-center text-sm font-semibold text-primary hover:text-primary-dark"
              >
                View all products
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3 sm:gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
