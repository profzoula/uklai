"use client";

import Link from "next/link";
import { Star, ShoppingCart } from "lucide-react";
import type { Product } from "@/types/database";
import { formatPrice } from "@/lib/utils";
import { useCartStore } from "@/store/cart";

type Props = {
  product: Product;
};

export function ProductCard({ product }: Props) {
  const addItem = useCartStore((s) => s.addItem);
  const outOfStock = product.stock <= 0;

  return (
    <div className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300">
      <Link href={`/products/${product.slug}`} className="block relative">
        <div className="aspect-square overflow-hidden bg-slate-100">
          {product.image_url && (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          )}
        </div>
        {product.badge && (
          <span className="absolute top-2 left-2 lg:top-3 lg:left-3 bg-primary text-white text-[10px] lg:text-xs font-semibold px-2 py-0.5 lg:px-3 lg:py-1 rounded-full">
            {product.badge}
          </span>
        )}
      </Link>

      <div className="p-3 sm:p-4">
        <Link href={`/products/${product.slug}`}>
          <h3 className="text-sm lg:text-base font-semibold text-slate-900 group-hover:text-primary transition-colors line-clamp-2">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center gap-1 mt-2">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span className="text-xs sm:text-sm font-medium text-slate-700">
            {product.rating}
          </span>
          <span className="text-xs sm:text-sm text-slate-400">
            ({product.review_count})
          </span>
        </div>

        <div className="flex items-center justify-between mt-3 gap-2">
          <div className="flex flex-col min-w-0">
            <span className="text-sm lg:text-lg font-bold text-slate-900">
              {formatPrice(product.price)}
            </span>
            {product.compare_at_price && (
              <span className="text-xs text-slate-400 line-through">
                {formatPrice(product.compare_at_price)}
              </span>
            )}
          </div>

          <button
            onClick={() => addItem(product)}
            disabled={outOfStock}
            className="p-2 bg-primary-light text-primary rounded-lg hover:bg-primary hover:text-white transition-colors shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label={outOfStock ? "Out of stock" : "Add to cart"}
          >
            <ShoppingCart className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
