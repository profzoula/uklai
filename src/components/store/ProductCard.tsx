"use client";

import Link from "next/link";
import { Star, ShoppingCart } from "lucide-react";
import type { Product } from "@/types/database";
import { getDisplayPrices } from "@/lib/product-pricing";
import { formatPrice } from "@/lib/utils";
import { useCartStore } from "@/store/cart";

type Props = {
  product: Product;
};

export function ProductCard({ product }: Props) {
  const addItem = useCartStore((s) => s.addItem);
  const outOfStock = product.stock <= 0;
  const prices = getDisplayPrices(product.price, product.compare_at_price);
  const ratingLabel = `${product.rating} out of 5 stars, ${product.review_count} reviews`;

  return (
    <article className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 h-full flex flex-col">
      <Link
        href={`/products/${product.slug}`}
        className="block relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset rounded-t-2xl"
      >
        <div className="aspect-square overflow-hidden bg-gradient-to-b from-slate-50 to-white">
          {product.image_url && (
            <div className="flex h-full w-full items-center justify-center p-2 sm:p-4">
              <img
                src={product.image_url}
                alt={product.name}
                className="max-h-full max-w-full object-contain transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
            </div>
          )}
        </div>
        {product.badge && (
          <span className="absolute top-2 left-2 lg:top-3 lg:left-3 bg-primary text-white text-xs lg:text-sm font-semibold px-2.5 py-1 lg:px-3 lg:py-1 rounded-full">
            {product.badge}
          </span>
        )}
      </Link>

      <div className="p-3 sm:p-4 flex flex-col flex-1">
        <Link
          href={`/products/${product.slug}`}
          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
        >
          <h3 className="text-base lg:text-lg font-semibold text-slate-900 group-hover:text-primary transition-colors line-clamp-2 min-h-[2.75rem]">
            {product.name}
          </h3>
        </Link>

        <div
          className="flex items-center gap-1 mt-2"
          aria-label={ratingLabel}
          title={ratingLabel}
        >
          <Star className="w-4 h-4 sm:w-4 sm:h-4 fill-amber-400 text-amber-400" aria-hidden="true" />
          <span className="text-base sm:text-sm font-medium text-slate-700" aria-hidden="true">
            {product.rating}
          </span>
          <span className="text-base sm:text-sm text-slate-400" aria-hidden="true">
            ({product.review_count})
          </span>
        </div>

        <div className="flex items-center justify-between mt-auto pt-3 gap-2">
          <div className="flex flex-col min-w-0">
            <span className="text-base lg:text-lg font-bold text-slate-900">
              {formatPrice(prices.currentPrice)}
            </span>
            {prices.onSale && prices.regularPrice != null && (
              <span className="text-sm text-slate-400 line-through">
                {formatPrice(prices.regularPrice)}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => addItem(product)}
            disabled={outOfStock}
            className="min-w-[44px] min-h-[44px] p-2.5 bg-primary-light text-primary rounded-lg hover:bg-primary hover:text-white transition-colors shrink-0 disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            aria-label={
              outOfStock
                ? `${product.name} is out of stock`
                : `Add ${product.name} to cart`
            }
          >
            <ShoppingCart className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </article>
  );
}
