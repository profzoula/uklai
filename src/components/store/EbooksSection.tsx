"use client";

import Link from "next/link";
import { useRef } from "react";
import { BookOpen, ChevronLeft, ChevronRight, Download } from "lucide-react";
import type { Product } from "@/types/database";
import { formatPrice } from "@/lib/utils";

const COLLECTION_SLUG = "ebook";

type Props = {
  products: Product[];
  title?: string;
  description?: string | null;
};

function EbookCard({ product }: { product: Product }) {
  const href = `/products/${product.slug}`;

  return (
    <article className="snap-start shrink-0 w-[200px] h-[280px] sm:w-[210px] sm:h-[290px] bg-white rounded-xl overflow-hidden shadow-md grid grid-rows-[140px_4.75rem_auto]">
      <Link
        href={href}
        className="row-start-1 flex items-center justify-center px-3 bg-gradient-to-b from-violet-50 to-white overflow-hidden"
      >
        {product.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.image_url}
            alt={product.name}
            className="h-full w-full object-contain"
          />
        ) : (
          <BookOpen className="w-16 h-16 text-violet-300" aria-hidden />
        )}
      </Link>

      <Link
        href={href}
        className="row-start-2 px-3 pt-2 text-sm text-slate-800 line-clamp-3 leading-[1.35] hover:text-violet-700 overflow-hidden"
        title={product.name}
      >
        {product.name}
      </Link>

      <div className="row-start-3 px-3 pb-3">
        <p className="text-base font-bold text-slate-900">
          {formatPrice(product.price)}
        </p>
        <p className="mt-0.5 inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-violet-600">
          <Download className="w-3 h-3" />
          Instant download
        </p>
      </div>
    </article>
  );
}

export function EbooksSection({
  products,
  title = "Ebooks",
  description,
}: Props) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  if (!products.length) return null;

  const blurb =
    description?.trim() ??
    "Digital reads you can download instantly after purchase — no shipping required.";

  function scrollBy(delta: number) {
    scrollerRef.current?.scrollBy({ left: delta, behavior: "smooth" });
  }

  return (
    <section className="py-10 sm:py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row rounded-2xl overflow-hidden bg-gradient-to-br from-violet-900 via-violet-800 to-indigo-900 min-h-[320px]">
          <div className="lg:w-[240px] xl:w-[280px] shrink-0 p-6 sm:p-8 flex flex-col justify-center border-b lg:border-b-0 lg:border-r border-white/10">
            <p className="inline-flex items-center gap-2 text-violet-200 text-xs font-semibold mb-4">
              <BookOpen className="w-4 h-4" />
              Digital library
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight uppercase">
              {title}
            </h2>
            <p className="mt-4 text-sm text-violet-100 leading-relaxed">{blurb}</p>
            <Link
              href={`/shop?collection=${COLLECTION_SLUG}`}
              className="mt-6 inline-flex items-center justify-center bg-white text-violet-900 font-bold text-sm px-6 py-3 rounded-lg hover:bg-violet-50 transition-colors w-fit"
            >
              Shop ebooks
            </Link>
          </div>

          <div className="relative flex-1 min-w-0 py-5 pl-4 sm:pl-5 pr-2 sm:pr-4">
            <div
              ref={scrollerRef}
              className="flex gap-3 sm:gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-2 scrollbar-none items-start"
            >
              {products.map((product) => (
                <EbookCard key={product.id} product={product} />
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
