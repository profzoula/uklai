"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

type Props = {
  images: string[];
  productName: string;
  discountPercent?: number | null;
};

const THUMB_CLASS =
  "relative w-16 h-16 sm:w-[4.5rem] sm:h-[4.5rem] rounded-lg overflow-hidden border-2 bg-white shrink-0 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2";

export function ProductGallery({
  images,
  productName,
  discountPercent,
}: Props) {
  const gallery = images.length > 0 ? images : [];
  const [activeIndex, setActiveIndex] = useState(0);

  if (gallery.length === 0) {
    return (
      <div className="aspect-square rounded-xl border border-slate-200 bg-slate-50" />
    );
  }

  const activeSrc = gallery[activeIndex];

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      {/* Main image */}
      <div className="flex-1 order-1 sm:order-2 min-w-0">
        <div className="relative aspect-square rounded-xl border border-slate-200 bg-gradient-to-b from-slate-50 to-white overflow-hidden">
          {discountPercent != null && discountPercent > 0 && (
            <span className="absolute top-3 left-3 z-10 bg-red-600 text-white text-xs font-bold px-2.5 py-1 rounded-md shadow-sm">
              -{discountPercent}%
            </span>
          )}
          <div className="flex h-full w-full items-center justify-center p-4 sm:p-6 lg:p-8">
            <img
              src={activeSrc}
              alt={productName}
              className="max-h-full max-w-full object-contain"
            />
          </div>
        </div>
      </div>

      {/* Thumbnails */}
      {gallery.length > 1 && (
        <div
          className="order-2 sm:order-1 flex sm:flex-col gap-2 sm:gap-2.5 overflow-x-auto sm:overflow-y-auto sm:max-h-[min(520px,100%)] pb-1 sm:pb-0 sm:pr-0.5 scrollbar-hide"
          role="tablist"
          aria-label={`${productName} images`}
        >
          {gallery.map((src, index) => {
            const isActive = activeIndex === index;
            return (
              <button
                key={`${src}-${index}`}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-label={`View image ${index + 1} of ${gallery.length}`}
                onClick={() => setActiveIndex(index)}
                className={cn(
                  THUMB_CLASS,
                  isActive
                    ? "border-primary shadow-sm"
                    : "border-slate-200 hover:border-slate-300"
                )}
              >
                <span className="absolute inset-0 flex items-center justify-center p-1.5 bg-slate-50">
                  <img
                    src={src}
                    alt=""
                    aria-hidden="true"
                    className="max-h-full max-w-full object-contain"
                  />
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
