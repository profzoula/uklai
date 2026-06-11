import Link from "next/link";
import type { Product } from "@/types/database";
import { ProductCard } from "@/components/store/ProductCard";

type Props = {
  products: Product[];
  categoryName?: string;
  categorySlug?: string;
};

export function RelatedProductsSection({
  products,
  categoryName,
  categorySlug,
}: Props) {
  if (!products.length) return null;

  return (
    <section
      className="mt-12 pt-10 border-t border-slate-100"
      aria-labelledby="related-products-heading"
    >
      <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
        <div>
          <h2
            id="related-products-heading"
            className="text-xl sm:text-2xl font-bold text-slate-900"
          >
            You may also like
          </h2>
          {categoryName && (
            <p className="text-base sm:text-sm text-slate-500 mt-1">
              More from {categoryName}
            </p>
          )}
        </div>
        {categorySlug && (
          <Link
            href={`/shop?category=${categorySlug}`}
            className="text-sm font-semibold text-primary hover:text-primary-dark transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded"
          >
            View all in {categoryName ?? "category"}
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 min-[420px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
