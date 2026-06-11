import { Star } from "lucide-react";
import type { Product } from "@/types/database";

type Props = {
  product: Product;
};

export function ProductRating({ product }: Props) {
  const filledStars = Math.round(product.rating);
  const label = `${product.rating.toFixed(1)} out of 5 stars, ${product.review_count} reviews`;

  return (
    <div className="flex items-center gap-1.5" aria-label={label} title={label}>
      <div className="flex items-center" aria-hidden="true">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`w-5 h-5 sm:w-[18px] sm:h-[18px] ${
              i < filledStars
                ? "fill-amber-400 text-amber-400"
                : "fill-none text-slate-300 stroke-slate-300"
            }`}
            strokeWidth={1.5}
          />
        ))}
      </div>
      <span className="text-base sm:text-sm font-medium text-slate-700" aria-hidden="true">
        {product.rating.toFixed(1)}
      </span>
      <span className="text-base sm:text-sm text-slate-500" aria-hidden="true">
        ({product.review_count})
      </span>
    </div>
  );
}
