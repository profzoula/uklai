"use client";

import { cn, formatPrice } from "@/lib/utils";
import type { ProductVariant } from "@/types/database";

type Props = {
  variants: ProductVariant[];
  selectedId: string;
  onSelect: (variant: ProductVariant) => void;
};

export function ProductVariantSelector({
  variants,
  selectedId,
  onSelect,
}: Props) {
  const selected = variants.find((v) => v.id === selectedId) ?? variants[0];

  if (variants.length <= 1) return null;

  const label = selected?.color?.trim() || "Option";

  return (
    <div className="mt-5 border-t border-slate-100 pt-5">
      <p className="text-base sm:text-sm text-slate-600 mb-3">
        Color:{" "}
        <span className="font-semibold text-slate-900">{label}</span>
      </p>
      <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-none snap-x snap-mandatory">
        {variants.map((variant) => {
          const isSelected = variant.id === selectedId;
          const thumb = variant.image_url;
          const displayLabel = variant.color?.trim() || variant.sku || "Option";

          return (
            <button
              key={variant.id}
              type="button"
              onClick={() => onSelect(variant)}
              className={cn(
                "snap-start shrink-0 w-[5.5rem] sm:w-24 rounded-lg border-2 bg-white overflow-hidden text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                isSelected
                  ? "border-primary shadow-sm"
                  : "border-slate-200 hover:border-slate-300"
              )}
              aria-pressed={isSelected}
              aria-label={`${displayLabel}, ${formatPrice(variant.price)}`}
            >
              <div className="aspect-square flex items-center justify-center p-2 bg-slate-50">
                {thumb ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={thumb}
                    alt={displayLabel}
                    className="max-h-full max-w-full object-contain"
                  />
                ) : (
                  <span className="text-xs text-slate-400 text-center px-1">
                    {displayLabel}
                  </span>
                )}
              </div>
              <div className="border-t border-slate-100 px-2 py-1.5 text-center">
                <p className="text-sm font-bold text-slate-900">
                  {formatPrice(variant.price)}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
