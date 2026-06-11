"use client";

import Link from "next/link";
import { useRef } from "react";
import { ChevronLeft, ChevronRight, Sparkles, Tag } from "lucide-react";
import type { Product } from "@/types/database";
import { formatPrice } from "@/lib/utils";

const COLLECTION_SLUG = "new-arrivals";

type Props = {
  products: Product[];
  title?: string;
  description?: string | null;
};

function formatDropDate(iso: string): string {
  const d = new Date(iso);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${mm}/${dd}`;
}

function NewArrivalCard({ product }: { product: Product }) {
  const dropDate = formatDropDate(product.created_at);
  const href = `/products/${product.slug}`;

  return (
    <article className="snap-start shrink-0 w-[168px] h-[260px] bg-white rounded-xl overflow-hidden shadow-md grid grid-rows-[36px_140px_1fr_auto]">
      <div className="bg-slate-100 px-3 flex items-center gap-2 border-b border-slate-200 row-start-1">
        <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
        <p className="text-xs text-slate-600 truncate">
          New <span className="font-bold text-slate-900">{dropDate}</span>
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
        className="row-start-3 px-3 pt-2 text-xs sm:text-sm text-slate-800 line-clamp-2 leading-5 hover:text-primary overflow-hidden"
      >
        {product.name}
      </Link>

      <p className="row-start-4 px-3 pb-3 text-sm font-bold text-slate-900">
        {formatPrice(product.price)}
      </p>
    </article>
  );
}

export function NewArrivalsSection({
  products,
  title = "New Arrivals",
  description,
}: Props) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  if (!products.length) return null;

  const blurb =
    description?.trim() ??
    "Fresh picks just landed — be the first to shop the latest products at UKLAI.";

  function scrollBy(delta: number) {
    scrollerRef.current?.scrollBy({ left: delta, behavior: "smooth" });
  }

  return (
    <section className="py-10 sm:py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row rounded-2xl overflow-hidden bg-black min-h-[320px]">
          {/* Sidebar */}
          <div className="lg:w-[240px] xl:w-[280px] shrink-0 p-6 sm:p-8 flex flex-col justify-center border-b lg:border-b-0 lg:border-r border-white/10">
            <p className="inline-flex items-center gap-2 text-[#fff200] text-xs font-semibold mb-4">
              <Sparkles className="w-4 h-4" />
              Just landed
            </p>
            <h2 className="flex items-center gap-2 text-3xl sm:text-4xl font-extrabold text-white tracking-tight uppercase">
              <Tag className="w-8 h-8 text-[#fff200] shrink-0" />
              {title}
            </h2>
            <p className="mt-4 text-sm text-slate-300 leading-relaxed">{blurb}</p>
            <Link
              href={`/shop?collection=${COLLECTION_SLUG}`}
              className="mt-6 inline-flex items-center justify-center bg-[#fff200] text-slate-900 font-bold text-sm px-6 py-3 rounded-lg hover:bg-yellow-300 transition-colors w-fit"
            >
              Shop now
            </Link>
          </div>

          {/* Carousel */}
          <div className="relative flex-1 min-w-0 py-5 pl-4 sm:pl-5 pr-2 sm:pr-4">
            <div
              ref={scrollerRef}
              className="flex gap-3 sm:gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-2 scrollbar-none items-start"
            >
              {products.map((product) => (
                <NewArrivalCard key={product.id} product={product} />
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
