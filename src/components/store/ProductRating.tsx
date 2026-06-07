import { Star } from "lucide-react";
import type { Product } from "@/types/database";

type Props = {
  product: Product;
};

export function ProductRating({ product }: Props) {
  const filledStars = Math.round(product.rating);

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`w-[18px] h-[18px] ${
              i < filledStars
                ? "fill-amber-400 text-amber-400"
                : "fill-none text-slate-300 stroke-slate-300"
            }`}
            strokeWidth={1.5}
          />
        ))}
      </div>
      <span className="text-sm font-medium text-slate-700">
        {product.rating.toFixed(1)}
      </span>
      <span className="text-sm text-slate-500">
        ({product.review_count})
      </span>
    </div>
  );
}
