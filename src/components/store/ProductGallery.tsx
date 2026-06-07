"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

type Props = {
  images: string[];
  productName: string;
};

export function ProductGallery({ images, productName }: Props) {
  const gallery = images.length > 0 ? images : [];
  const [activeIndex, setActiveIndex] = useState(0);

  if (gallery.length === 0) {
    return (
      <div className="aspect-square rounded-lg border border-slate-200 bg-slate-50" />
    );
  }

  return (
    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
      {/* Thumbnails — horizontal on mobile, vertical on desktop */}
      <div className="flex sm:flex-col gap-2 sm:gap-3 order-2 sm:order-1 overflow-x-auto sm:overflow-visible pb-1 sm:pb-0">
        {gallery.map((src, index) => (
          <button
            key={`${src}-${index}`}
            type="button"
            onClick={() => setActiveIndex(index)}
            className={cn(
              "w-14 h-14 sm:w-[72px] sm:h-[72px] rounded-md overflow-hidden border bg-white shrink-0 transition-all",
              activeIndex === index
                ? "border-primary ring-1 ring-primary"
                : "border-slate-200 hover:border-slate-300"
            )}
          >
            <img
              src={src}
              alt={`${productName} view ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>

      {/* Main image */}
      <div className="flex-1 order-1 sm:order-2">
        <div className="aspect-square rounded-lg border border-slate-200 bg-white overflow-hidden">
          <img
            src={gallery[activeIndex]}
            alt={productName}
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
  );
}
