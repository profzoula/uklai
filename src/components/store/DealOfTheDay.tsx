"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Product } from "@/types/database";
import { formatPrice } from "@/lib/utils";
import { useCartStore } from "@/store/cart";

const COLLECTION_SLUG = "deal-of-the-day";

type Props = {
  products: Product[];
  title?: string;
};

function savingsAmount(product: Product): number | null {
  if (!product.compare_at_price || product.compare_at_price <= product.price) {
    return null;
  }
  return product.compare_at_price - product.price;
}

function useCountdown() {
  const [parts, setParts] = useState({ hrs: 0, mins: 0, secs: 0 });

  useEffect(() => {
    function endOfTodayMs() {
      const end = new Date();
      end.setHours(23, 59, 59, 999);
      return end.getTime();
    }

    function tick() {
      const diff = Math.max(0, endOfTodayMs() - Date.now());
      setParts({
        hrs: Math.floor(diff / 3_600_000),
        mins: Math.floor((diff % 3_600_000) / 60_000),
        secs: Math.floor((diff % 60_000) / 1000),
      });
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return parts;
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function DealProductCard({ product }: { product: Product }) {
  const addItem = useCartStore((s) => s.addItem);
  const save = savingsAmount(product);
  const outOfStock = product.stock <= 0;

  return (
    <article className="flex-shrink-0 w-[176px] sm:w-[196px] bg-white border border-slate-200 rounded-lg overflow-hidden flex flex-col">
      <Link href={`/products/${product.slug}`} className="relative block p-3 pb-0">
        {save !== null && (
          <span className="absolute top-2 left-2 z-10 bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-sm">
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

      <div className="px-3 pt-2 pb-3 flex flex-col flex-1">
        <Link href={`/products/${product.slug}`} className="block overflow-hidden">
          <h3
            className="text-[11px] sm:text-xs font-medium text-slate-900 line-clamp-3 leading-[1.35] h-[3.65rem] hover:text-primary"
            title={product.name}
          >
            {product.name}
          </h3>
        </Link>
        <div className="mt-2">
          <p className="text-base font-bold text-slate-900">
            {formatPrice(product.price)}
          </p>
          {product.compare_at_price && (
            <p className="text-xs text-slate-400 line-through">
              {formatPrice(product.compare_at_price)}
            </p>
          )}
        </div>
        <button
          type="button"
          disabled={outOfStock}
          onClick={() => addItem(product)}
          className="mt-auto pt-3 w-full py-2 rounded-full text-xs sm:text-sm font-bold transition-colors disabled:bg-slate-200 disabled:text-slate-500 bg-[#fff200] text-slate-900 hover:bg-yellow-300"
        >
          {outOfStock ? "Sold Out" : "Add to cart"}
        </button>
      </div>
    </article>
  );
}

export function DealOfTheDay({
  products,
  title = "Deal of the Day",
}: Props) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const countdown = useCountdown();

  if (!products.length) return null;

  function scrollBy(delta: number) {
    scrollerRef.current?.scrollBy({ left: delta, behavior: "smooth" });
  }

  return (
    <section className="py-10 sm:py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex gap-0 border border-slate-200 rounded-xl overflow-hidden bg-slate-50 shadow-sm">
          {/* Banner */}
          <div className="flex flex-col shrink-0 w-[140px] sm:w-[168px] lg:w-[180px]">
            <div className="flex-1 m-2 mb-0 rounded-lg border-4 border-[#fff200] bg-gradient-to-b from-[#0ea5e9] to-[#0046be] p-3 sm:p-4 flex flex-col justify-center text-center min-h-[200px]">
              <p className="text-[#fff200] font-extrabold text-sm sm:text-base leading-tight uppercase tracking-wide">
                Deal of
                <br />
                the Day
              </p>
              <div className="mt-4 flex items-center justify-center gap-0.5 sm:gap-1 text-white font-bold tabular-nums">
                <span className="text-lg sm:text-xl">{pad(countdown.hrs)}</span>
                <span className="text-sm opacity-80">:</span>
                <span className="text-lg sm:text-xl">{pad(countdown.mins)}</span>
                <span className="text-sm opacity-80">:</span>
                <span className="text-lg sm:text-xl">{pad(countdown.secs)}</span>
              </div>
              <div className="mt-1 flex justify-center gap-2 sm:gap-3 text-[9px] sm:text-[10px] text-white/80 uppercase">
                <span>hrs</span>
                <span>mins</span>
                <span>secs</span>
              </div>
            </div>
            <Link
              href={`/shop?collection=${COLLECTION_SLUG}`}
              className="m-2 mt-2 py-2.5 text-center text-xs sm:text-sm font-semibold bg-white border border-slate-200 rounded-lg text-slate-800 hover:bg-slate-50 transition-colors"
            >
              See all {title}
            </Link>
          </div>

          {/* Carousel */}
          <div className="relative flex-1 min-w-0 py-3 pr-2 sm:pr-3">
            <div
              ref={scrollerRef}
              className="flex gap-3 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            >
              {products.map((product) => (
                <div key={product.id} className="snap-start">
                  <DealProductCard product={product} />
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => scrollBy(360)}
              className="hidden sm:flex absolute right-1 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white border border-slate-200 shadow-md items-center justify-center text-slate-700 hover:bg-slate-50"
              aria-label="Scroll deals"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => scrollBy(-360)}
              className="hidden sm:flex absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white border border-slate-200 shadow-md items-center justify-center text-slate-700 hover:bg-slate-50"
              aria-label="Scroll deals back"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
