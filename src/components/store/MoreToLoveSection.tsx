"use client";

import { useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Product } from "@/types/database";
import { ProductCard } from "@/components/store/ProductCard";

type Props = {
  products: Product[];
};

export function MoreToLoveSection({ products }: Props) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  if (!products.length) return null;

  function scrollBy(delta: number) {
    scrollerRef.current?.scrollBy({ left: delta, behavior: "smooth" });
  }

  return (
    <section
      className="mt-6 bg-white border border-slate-200 rounded-lg overflow-hidden"
      aria-labelledby="more-to-love-heading"
    >
      <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-slate-100">
        <h2
          id="more-to-love-heading"
          className="text-lg font-bold text-slate-900"
        >
          More to love
        </h2>
        <Link
          href="/shop"
          className="text-sm font-semibold text-primary hover:text-primary-dark"
        >
          View all
        </Link>
      </div>

      <div className="relative px-2 sm:px-4 py-4">
        <div
          ref={scrollerRef}
          className="flex gap-3 sm:gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        >
          {products.map((product) => (
            <div
              key={product.id}
              className="snap-start shrink-0 w-[180px] sm:w-[200px]"
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => scrollBy(-400)}
          className="hidden sm:flex absolute left-1 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white border border-slate-200 shadow-md items-center justify-center text-slate-700 hover:bg-slate-50"
          aria-label="Scroll back"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={() => scrollBy(400)}
          className="hidden sm:flex absolute right-1 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white border border-slate-200 shadow-md items-center justify-center text-slate-700 hover:bg-slate-50"
          aria-label="Scroll forward"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </section>
  );
}
