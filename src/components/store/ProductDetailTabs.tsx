"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

type Props = {
  reviewCount: number;
  descriptionPanel: React.ReactNode;
  reviewsPanel: React.ReactNode;
};

export function ProductDetailTabs({
  reviewCount,
  descriptionPanel,
  reviewsPanel,
}: Props) {
  const [tab, setTab] = useState<"description" | "reviews">("description");

  return (
    <div>
      <div
        role="tablist"
        aria-label="Product details"
        className="flex gap-6 border-b border-slate-200"
      >
        <button
          type="button"
          role="tab"
          aria-selected={tab === "description"}
          onClick={() => setTab("description")}
          className={cn(
            "pb-3 text-base sm:text-sm font-semibold transition-colors border-b-2 -mb-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-t",
            tab === "description"
              ? "border-primary text-primary"
              : "border-transparent text-slate-500 hover:text-slate-800"
          )}
        >
          Description
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "reviews"}
          onClick={() => setTab("reviews")}
          className={cn(
            "pb-3 text-base sm:text-sm font-semibold transition-colors border-b-2 -mb-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-t",
            tab === "reviews"
              ? "border-primary text-primary"
              : "border-transparent text-slate-500 hover:text-slate-800"
          )}
        >
          Reviews ({reviewCount})
        </button>
      </div>

      <div className="pt-6" role="tabpanel">
        {tab === "description" ? descriptionPanel : reviewsPanel}
      </div>
    </div>
  );
}
