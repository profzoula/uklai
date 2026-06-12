"use client";

import Link from "next/link";
import { useRef } from "react";
import { ChevronLeft, ChevronRight, ChevronRight as ChevronSm } from "lucide-react";
import type { Product } from "@/types/database";
import { getDisplayPrices } from "@/lib/product-pricing";
import { formatPrice } from "@/lib/utils";
import { useCartStore } from "@/store/cart";

const COLLECTION_SLUG = "best-sellers";

type Props = {
  products: Product[];
  title?: string;
  headline?: string | null;
};

function savingsAmount(product: Product): number | null {
  const { onSale, currentPrice, regularPrice } = getDisplayPrices(
    product.price,
    product.compare_at_price
  );
  if (!onSale || regularPrice == null) return null;
  return regularPrice - currentPrice;
}

function BestSellerCard({ product }: { product: Product }) {
  const addItem = useCartStore((s) => s.addItem);
  const save = savingsAmount(product);
  const outOfStock = product.stock <= 0;

  return (
    <article className="shrink-0 w-[200px] sm:w-[210px] bg-white rounded-lg overflow-hidden flex flex-col shadow-sm">
      <Link href={`/products/${product.slug}`} className="relative block p-3 pb-0">
        {save !== null && (
          <span className="absolute top-2 left-2 z-10 bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-sm">
            Save {formatPrice(save)}
          </span>
        )}
        <div className="aspect-square flex items-center justify-center">
          {product.image_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.image_url}
              alt={product.name}
              className="max-h-full max-w-full object-contain"
            />
          )}
        </div>
      </Link>

      <div className="px-3 pt-2 pb-3 flex flex-col flex-1 text-left">
        <Link href={`/products/${product.slug}`}>
          <h3
            className="text-sm font-medium text-primary line-clamp-3 leading-[1.35] min-h-[3.75rem] overflow-hidden hover:underline"
            title={product.name}
          >
            {product.name}
          </h3>
        </Link>
        <p className="mt-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">
          Top seller
        </p>
        <div className="mt-1">
          {(() => {
            const prices = getDisplayPrices(
              product.price,
              product.compare_at_price
            );
            return (
              <>
                <p className="text-base font-bold text-slate-900">
                  {formatPrice(prices.currentPrice)}
                </p>
                {prices.onSale && prices.regularPrice != null && (
                  <p className="text-xs text-slate-400 line-through">
                    {formatPrice(prices.regularPrice)}
                  </p>
                )}
              </>
            );
          })()}
        </div>
        {save !== null && (
          <button
            type="button"
            className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-slate-700 bg-amber-50 border border-amber-100 rounded-full px-2.5 py-1 w-fit"
          >
            + 1 offer for you
            <ChevronSm className="w-3 h-3" />
          </button>
        )}
        <button
          type="button"
          disabled={outOfStock}
          onClick={() => addItem(product)}
          className="mt-auto pt-3 w-full py-2.5 rounded-full text-sm font-bold transition-colors disabled:bg-slate-200 disabled:text-slate-500 bg-[#fff200] text-slate-900 hover:bg-yellow-300"
        >
          {outOfStock ? "Sold Out" : "Add to cart"}
        </button>
      </div>
    </article>
  );
}

export function BestSellersSection({
  products,
  title = "Best Sellers",
  headline,
}: Props) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  if (!products.length) return null;

  const featured = products[0];
  const minPrice = Math.min(...products.map((p) => p.price));
  const bannerText =
    headline?.trim() ||
    `Customer favorites starting at ${formatPrice(minPrice)} — shop what everyone's buying.`;

  function scrollBy(delta: number) {
    scrollerRef.current?.scrollBy({ left: delta, behavior: "smooth" });
  }

  return (
    <section className="py-10 sm:py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-xl overflow-hidden border border-slate-200 shadow-sm">
          {/* Promo banner */}
          <div className="relative bg-gradient-to-r from-[#0ea5e9] via-[#0046be] to-[#4338ca] px-6 sm:px-10 py-8 sm:py-10 min-h-[180px] sm:min-h-[200px] flex items-center overflow-hidden">
            <div className="relative z-10 max-w-lg">
              <p className="text-xs sm:text-sm font-bold uppercase tracking-widest text-white/80 mb-2">
                {title}
              </p>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight">
                {bannerText}
              </h2>
              <Link
                href={`/shop?collection=${COLLECTION_SLUG}`}
                className="inline-flex mt-5 sm:mt-6 bg-white text-slate-900 px-6 py-2.5 rounded-md text-sm font-bold hover:bg-slate-100 transition-colors"
              >
                Shop now
              </Link>
            </div>

            {featured.image_url && (
              <div className="absolute right-4 sm:right-10 top-1/2 -translate-y-1/2 w-[140px] sm:w-[200px] lg:w-[240px] pointer-events-none">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={featured.image_url}
                  alt={featured.name}
                  className="w-full h-auto object-contain drop-shadow-2xl"
                />
              </div>
            )}
          </div>

          {/* Carousel */}
          <div className="relative bg-[#002d7a] px-3 sm:px-4 py-4 sm:py-5">
            <div
              ref={scrollerRef}
              className="flex gap-3 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-1 scrollbar-none"
            >
              {products.map((product) => (
                <div key={product.id} className="snap-start">
                  <BestSellerCard product={product} />
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => scrollBy(-380)}
              className="hidden sm:flex absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/95 border border-slate-200 shadow-md items-center justify-center text-slate-700 hover:bg-white"
              aria-label="Scroll back"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => scrollBy(380)}
              className="hidden sm:flex absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/95 border border-slate-200 shadow-md items-center justify-center text-slate-700 hover:bg-white"
              aria-label="Scroll more"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            <div className="mt-4 text-center sm:text-right">
              <Link
                href={`/shop?collection=${COLLECTION_SLUG}`}
                className="text-sm font-semibold text-white/90 hover:text-white underline-offset-2 hover:underline"
              >
                See all {title}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
