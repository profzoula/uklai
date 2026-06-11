import type { Product, ProductReview } from "@/types/database";
import { ProductReviewsSummary } from "@/components/store/ProductReviewsSummary";
import { ProductReviewForm } from "@/components/store/ProductReviewForm";
import { formatDate } from "@/lib/utils";
import { Star } from "lucide-react";

type Props = {
  product: Product;
  reviews: ProductReview[];
  embedded?: boolean;
};

export function ProductReviewsSection({
  product,
  reviews,
  embedded = false,
}: Props) {
  const inner = (
      <div className={embedded ? "" : "border border-slate-200 rounded-lg p-5 sm:p-6"}>
        {!embedded && (
          <h2 className="text-base font-bold text-slate-900 mb-5">
            Customer Reviews
            {product.review_count > 0 ? ` (${product.review_count})` : ""}
          </h2>
        )}

        {product.review_count > 0 && (
          <ProductReviewsSummary product={product} embedded />
        )}

        {reviews.length > 0 && (
          <ul className={`space-y-4 ${product.review_count > 0 ? "mt-6 pt-6 border-t border-slate-100" : ""}`}>
            {reviews.map((review) => (
              <li key={review.id} className="border-b border-slate-50 pb-4 last:border-0">
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex">
                    {Array.from({ length: review.rating }).map((_, i) => (
                      <Star
                        key={i}
                        className="w-4 h-4 fill-slate-900 text-slate-900"
                        strokeWidth={0}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-semibold text-slate-900">
                    {review.customer_name}
                  </span>
                  <span className="text-xs text-slate-400">
                    {formatDate(review.created_at)}
                  </span>
                </div>
                {review.title && (
                  <p className="text-sm font-medium text-slate-800">{review.title}</p>
                )}
                {review.body && (
                  <p className="text-sm text-slate-600 mt-1">{review.body}</p>
                )}
              </li>
            ))}
          </ul>
        )}

        {product.review_count === 0 && reviews.length === 0 && (
          <p className="text-sm text-slate-500 mb-4">
            No reviews yet. Be the first to review this product.
          </p>
        )}

        <ProductReviewForm productId={product.id} productSlug={product.slug} />
      </div>
  );

  if (embedded) return inner;

  return (
    <section className="mt-10 pt-8 border-t border-slate-100">{inner}</section>
  );
}
