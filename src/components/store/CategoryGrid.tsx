"use client";

import Link from "next/link";
import { useRef } from "react";
import { ChevronRight, Star, Tag } from "lucide-react";
import type { Category } from "@/types/database";

type Props = {
  categories: Category[];
};

function CategoryCircle({
  href,
  label,
  imageUrl,
  icon,
}: {
  href: string;
  label: string;
  imageUrl?: string | null;
  icon?: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group flex flex-col items-center gap-3 shrink-0 w-[108px] sm:w-[128px] md:w-[140px]"
    >
      <div className="w-[88px] h-[88px] sm:w-[104px] sm:h-[104px] md:w-[112px] md:h-[112px] rounded-full border-2 border-slate-200 bg-white flex items-center justify-center overflow-hidden group-hover:border-primary/30 group-hover:shadow-md transition-all">
        {icon ? (
          icon
        ) : imageUrl ? (
          <img
            src={imageUrl}
            alt={label}
            className="w-full h-full object-cover"
          />
        ) : null}
      </div>
      <span className="text-xs sm:text-sm text-slate-900 text-center leading-snug font-medium px-1 max-w-[120px]">
        {label}
      </span>
    </Link>
  );
}

export function CategoryGrid({ categories }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  function scrollNext() {
    scrollRef.current?.scrollBy({ left: 320, behavior: "smooth" });
  }

  return (
    <section className="py-10 sm:py-12 bg-white border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-6">
          Browse by Category
        </h2>

        <div className="relative">
          <div
            ref={scrollRef}
            className="flex gap-5 sm:gap-6 md:gap-8 overflow-x-auto scrollbar-hide pb-2 pr-14 sm:pr-16 scroll-smooth"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            <CategoryCircle
              href="/shop"
              label="Shop all"
              icon={
                <div className="relative">
                  <Star
                    className="w-10 h-10 sm:w-11 sm:h-11 text-amber-400 fill-amber-400"
                    strokeWidth={1.5}
                  />
                  <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-slate-900">
                    $
                  </span>
                </div>
              }
            />

            {categories.map((category) => (
              <CategoryCircle
                key={category.id}
                href={`/shop?category=${category.slug}`}
                label={category.name}
                imageUrl={category.image_url}
              />
            ))}

            <CategoryCircle
              href="/shop?deals=true"
              label="Exclusive Member Deals"
              icon={
                <div className="flex items-center gap-1">
                  <span className="text-sm sm:text-base font-bold text-primary">My</span>
                  <Tag className="w-8 h-8 sm:w-9 sm:h-9 text-amber-500 fill-amber-100" />
                </div>
              }
            />
          </div>

          <button
            type="button"
            onClick={scrollNext}
            aria-label="Scroll categories"
            className="absolute right-0 top-8 sm:top-10 md:top-11 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white border border-slate-200 shadow-md flex items-center justify-center text-slate-700 hover:bg-slate-50 hover:shadow-lg transition-all z-10"
          >
            <ChevronRight className="w-5 h-5" strokeWidth={2} />
          </button>
        </div>
      </div>
    </section>
  );
}
