import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Product } from "@/types/database";
import { ProductCard } from "./ProductCard";

type Props = {
  products: Product[];
  title?: string;
  subtitle?: string;
  viewAllHref?: string;
  viewAllLabel?: string;
  variant?: "light" | "muted";
};

export function FeaturedProducts({
  products,
  title = "Featured Products",
  subtitle = "Discover premium products at unbeatable prices curated for quality, comfort and style.",
  viewAllHref = "/shop",
  viewAllLabel = "View All Products",
  variant = "muted",
}: Props) {
  if (!products.length) return null;

  return (
    <section
      className={`py-16 sm:py-20 ${variant === "muted" ? "bg-slate-50" : "bg-white"}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10 sm:mb-12">
          <div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900">
              {title}
            </h2>
            {subtitle && (
              <p className="mt-2 sm:mt-3 text-slate-600 max-w-2xl">{subtitle}</p>
            )}
          </div>
          <Link
            href={viewAllHref}
            className="inline-flex items-center gap-2 text-primary font-semibold hover:text-primary-dark transition-colors shrink-0"
          >
            {viewAllLabel}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
