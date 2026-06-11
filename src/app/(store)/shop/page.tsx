import Link from "next/link";
import {
  getProducts,
  getCategories,
  getProductsByCollectionSlug,
  getCollectionBySlug,
} from "@/lib/data";
import { ProductCard } from "@/components/store/ProductCard";

type Props = {
  searchParams: Promise<{
    category?: string;
    collection?: string;
    deals?: string;
    featured?: string;
    q?: string;
  }>;
};

export default async function ShopPage({ searchParams }: Props) {
  const params = await searchParams;
  const isDeals = params.deals === "true";
  const isFeatured = params.featured === "true";
  const searchQuery = params.q?.trim();
  const collectionSlug = params.collection?.trim();

  const [categories, collectionMeta] = await Promise.all([
    getCategories(),
    collectionSlug ? getCollectionBySlug(collectionSlug) : Promise.resolve(null),
  ]);

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

  function filterHref(overrides: {
    category?: string | null;
    collection?: string | null;
    deals?: boolean;
    featured?: boolean;
  }) {
    const next = new URLSearchParams();
    const category =
      overrides.category !== undefined ? overrides.category : params.category;
    const collection =
      overrides.collection !== undefined
        ? overrides.collection
        : params.collection;
    const deals =
      overrides.deals !== undefined ? overrides.deals : isDeals;
    const featured =
      overrides.featured !== undefined ? overrides.featured : isFeatured;

    if (category) next.set("category", category);
    if (collection) next.set("collection", collection);
    if (deals) next.set("deals", "true");
    if (featured) next.set("featured", "true");
    if (searchQuery) next.set("q", searchQuery);

    const qs = next.toString();
    return qs ? `/shop?${qs}` : "/shop";
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
      <div className="mb-8 sm:mb-10">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900">
          {pageTitle}
        </h1>
        <p className="mt-2 text-slate-600">{pageDescription}</p>
      </div>

      <nav
        aria-label="Product filters"
        className="flex gap-2 mb-6 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide sm:flex-wrap sm:overflow-visible"
      >
        <Link
          href={filterHref({
            category: null,
            collection: null,
            deals: false,
            featured: false,
          })}
          aria-current={
            !params.category && !collectionSlug && !isDeals && !isFeatured
              ? "page"
              : undefined
          }
          className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
            !params.category && !collectionSlug && !isDeals && !isFeatured
              ? "bg-primary text-white"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          All
        </Link>
        <Link
          href={filterHref({
            category: null,
            collection: "best-sellers",
            deals: false,
            featured: false,
          })}
          aria-current={collectionSlug === "best-sellers" ? "page" : undefined}
          className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
            collectionSlug === "best-sellers"
              ? "bg-primary text-white"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          Best Sellers
        </Link>
        <Link
          href={filterHref({
            category: null,
            collection: "new-arrivals",
            deals: false,
            featured: false,
          })}
          aria-current={collectionSlug === "new-arrivals" ? "page" : undefined}
          className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
            collectionSlug === "new-arrivals"
              ? "bg-primary text-white"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          New Arrivals
        </Link>
        <Link
          href={filterHref({
            category: null,
            collection: "deal-of-the-day",
            deals: false,
            featured: false,
          })}
          aria-current={
            collectionSlug === "deal-of-the-day" ? "page" : undefined
          }
          className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
            collectionSlug === "deal-of-the-day"
              ? "bg-primary text-white"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          Deal of the Day
        </Link>
        <Link
          href={filterHref({
            category: null,
            collection: null,
            deals: true,
            featured: false,
          })}
          aria-current={isDeals ? "page" : undefined}
          className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
            isDeals
              ? "bg-primary text-white"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          Deals
        </Link>
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={filterHref({
              category: cat.slug,
              collection: null,
              deals: false,
              featured: false,
            })}
            aria-current={
              params.category === cat.slug &&
              !isDeals &&
              !isFeatured &&
              !collectionSlug
                ? "page"
                : undefined
            }
            className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
              params.category === cat.slug &&
              !isDeals &&
              !isFeatured &&
              !collectionSlug
                ? "bg-primary text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {cat.name}
          </Link>
        ))}
      </nav>

      {products.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-slate-500 mb-4">No products found.</p>
          <Link
            href="/shop"
            className="inline-flex items-center text-sm font-semibold text-primary hover:text-primary-dark"
          >
            View all products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
