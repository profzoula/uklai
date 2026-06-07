import { Star, StarHalf } from "lucide-react";
import type { Product } from "@/types/database";
import { getReviewDistribution } from "@/lib/review-utils";

type Props = {
  product: Product;
  embedded?: boolean;
};

function ReviewStars({ rating }: { rating: number }) {
  const decimal = rating - Math.floor(rating);
  let fullStars = Math.floor(rating);
  let hasHalfStar = false;

  if (decimal >= 0.75) {
    fullStars += 1;
  } else if (decimal >= 0.25) {
    hasHalfStar = true;
  }

  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: fullStars }).map((_, i) => (
        <Star
          key={`full-${i}`}
          className="w-5 h-5 fill-slate-900 text-slate-900"
          strokeWidth={0}
        />
      ))}
      {hasHalfStar && (
        <StarHalf
          className="w-5 h-5 fill-slate-900 text-slate-900"
          strokeWidth={0}
        />
      )}
      {Array.from({ length: emptyStars }).map((_, i) => (
        <Star
          key={`empty-${i}`}
          className="w-5 h-5 fill-none text-slate-300"
          strokeWidth={1.5}
        />
      ))}
    </div>
  );
}

export function ProductReviewsSummary({ product, embedded }: Props) {
  if (product.review_count === 0 && !embedded) return null;

  const distribution = getReviewDistribution(
    product.rating,
    product.review_count,
    product.slug
  );
  const maxCount = Math.max(...Object.values(distribution), 1);
  const starRows = [5, 4, 3, 2, 1] as const;

  const content = (
    <>
      {!embedded && (
        <h2 className="text-base font-bold text-slate-900 mb-5">
          Customer Reviews ({product.review_count})
        </h2>
      )}

      <div className="grid sm:grid-cols-[auto_1fr] gap-6 sm:gap-10 items-start">
          <div className="sm:pr-4 sm:border-r sm:border-slate-100">
            <p className="text-4xl font-bold text-slate-900 leading-none">
              {product.rating.toFixed(1)}
            </p>
            <div className="mt-2">
              <ReviewStars rating={product.rating} />
            </div>
            <p className="text-sm text-slate-500 mt-2">
              All from verified purchases
            </p>
          </div>

          <div className="space-y-2 min-w-0">
            {starRows.map((star) => {
              const count = distribution[star];
              const width = `${(count / maxCount) * 100}%`;

              return (
                <div
                  key={star}
                  className="grid grid-cols-[52px_1fr_40px] sm:grid-cols-[60px_1fr_48px] items-center gap-2 sm:gap-3"
                >
                  <span className="text-sm text-slate-700 whitespace-nowrap">
                    {star} stars
                  </span>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-slate-900 rounded-full transition-all"
                      style={{ width }}
                    />
                  </div>
                  <span className="text-sm text-slate-700 text-right tabular-nums">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
    </>
  );

  if (embedded) return content;

  return (
    <section className="mt-10 pt-8 border-t border-slate-100">
      <div className="border border-slate-200 rounded-lg p-5 sm:p-6">{content}</div>
    </section>
  );
}
