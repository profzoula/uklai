import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { Product } from "@/types/database";

type Props = {
  product: Product;
  categoryName?: string;
  categorySlug?: string;
};

export function ProductBreadcrumbs({
  product,
  categoryName,
  categorySlug,
}: Props) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="flex flex-wrap items-center gap-1 text-sm mb-6 lg:mb-8"
    >
      <Link
        href="/"
        className="text-primary hover:text-primary-dark transition-colors"
      >
        Home
      </Link>
      <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
      <Link
        href="/shop"
        className="text-primary hover:text-primary-dark transition-colors"
      >
        Products
      </Link>
      {categoryName && categorySlug && (
        <>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          <Link
            href={`/shop?category=${categorySlug}`}
            className="text-primary hover:text-primary-dark transition-colors"
          >
            {categoryName}
          </Link>
        </>
      )}
      <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
      <span className="text-primary font-medium truncate max-w-[200px] sm:max-w-none">
        {product.name}
      </span>
    </nav>
  );
}
