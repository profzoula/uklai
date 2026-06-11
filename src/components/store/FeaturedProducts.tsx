"use client";

import Link from "next/link";
import { useRef } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import type { Product } from "@/types/database";
import { formatPrice } from "@/lib/utils";

const VIEW_ALL_HREF = "/shop?collection=featured";

type Props = {
  products: Product[];
  title?: string;
  description?: string | null;
};

function FeaturedCard({ product }: { product: Product }) {
  const href = `/products/${product.slug}`;

  return (
    <article className="snap-start shrink-0 w-[176px] h-[272px] bg-white rounded-xl overflow-hidden shadow-md grid grid-rows-[36px_130px_4.5rem_auto]">
      <div className="bg-slate-100 px-3 flex items-center gap-2 border-b border-slate-200 row-start-1">
        <Star className="w-3 h-3 text-[#fff200] fill-[#fff200] shrink-0" />
        <p className="text-xs text-slate-600 truncate">
          <span className="font-bold text-slate-900">Featured</span>
        </p>
      </div>

      <Link
        href={href}
        className="row-start-2 flex items-center justify-center px-3 bg-white overflow-hidden"
      >
        {product.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.image_url}
            alt={product.name}
            className="h-full w-full object-contain"
          />
        ) : (
          <div className="h-full w-full bg-slate-100 rounded-lg" aria-hidden />
        )}
      </Link>

      <Link
        href={href}
        className="row-start-3 px-3 pt-2 text-[11px] sm:text-xs text-slate-800 line-clamp-3 leading-[1.35] hover:text-primary overflow-hidden"
        title={product.name}
      >
        {product.name}
      </Link>

      <p className="row-start-4 px-3 pb-3 text-sm font-bold text-slate-900">
        {formatPrice(product.price)}
      </p>
    </article>
  );
}

export function FeaturedProducts({
  products,
  title = "Featured Products",
  description,
}: Props) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  if (!products.length) return null;

  const blurb =
    description?.trim() ??
    "Discover premium products at unbeatable prices curated for quality, comfort and style.";

  function scrollBy(delta: number) {
    scrollerRef.current?.scrollBy({ left: delta, behavior: "smooth" });
  }

  return (
    <section className="py-10 sm:py-12 bg-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row rounded-2xl overflow-hidden bg-slate-200 border border-slate-300 min-h-[320px]">
          {/* Sidebar */}
          <div className="lg:w-[240px] xl:w-[280px] shrink-0 p-6 sm:p-8 flex flex-col justify-center bg-slate-300 border-b lg:border-b-0 lg:border-r border-slate-400/60">
            <p className="inline-flex items-center gap-2 text-slate-700 text-xs font-semibold mb-4">
              <Star className="w-4 h-4 text-primary fill-primary" />
              Curated for you
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight uppercase">
              {title}
            </h2>
            <p className="mt-4 text-sm text-slate-600 leading-relaxed">{blurb}</p>
            <Link
              href={VIEW_ALL_HREF}
              className="mt-6 inline-flex items-center justify-center bg-primary text-white font-bold text-sm px-6 py-3 rounded-lg hover:bg-primary-dark transition-colors w-fit"
            >
              Shop now
            </Link>
          </div>

          {/* Carousel */}
          <div className="relative flex-1 min-w-0 py-5 pl-4 sm:pl-5 pr-2 sm:pr-4 bg-slate-100">
            <div
              ref={scrollerRef}
              className="flex gap-3 sm:gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-2 scrollbar-none items-start"
            >
              {products.map((product) => (
                <FeaturedCard key={product.id} product={product} />
              ))}
            </div>

            <button
              type="button"
              onClick={() => scrollBy(-360)}
              className="hidden sm:flex absolute left-1 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-lg items-center justify-center text-slate-700 hover:bg-slate-50"
              aria-label="Scroll back"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => scrollBy(360)}
              className="hidden sm:flex absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-lg items-center justify-center text-slate-700 hover:bg-slate-50"
              aria-label="Scroll more"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
