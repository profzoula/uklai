"use client";

import { useState } from "react";
import { SlidersHorizontal, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  children: React.ReactNode;
  activeCount?: number;
};

export function ShopMobileFilterShell({ children, activeCount = 0 }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="lg:contents">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="lg:hidden flex w-full items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3.5 min-h-[48px] text-sm font-semibold text-slate-900 shadow-sm"
        aria-expanded={open}
      >
        <span className="inline-flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-primary" aria-hidden="true" />
          Filters &amp; categories
          {activeCount > 0 && (
            <span className="inline-flex min-w-[1.25rem] h-5 px-1.5 items-center justify-center rounded-full bg-primary text-white text-[10px] font-bold">
              {activeCount}
            </span>
          )}
        </span>
        <ChevronDown
          className={cn(
            "w-5 h-5 text-slate-400 transition-transform",
            open && "rotate-180"
          )}
          aria-hidden="true"
        />
      </button>

      <div className={cn(open ? "block mt-3" : "hidden", "lg:block lg:mt-0")}>
        {children}
      </div>
    </div>
  );
}
