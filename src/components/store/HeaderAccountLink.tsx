"use client";

import Link from "next/link";
import { User } from "lucide-react";
import { useAccountNav } from "@/hooks/useAccountNav";

export function HeaderAccountLink() {
  const { loading, href, label } = useAccountNav();

  if (loading) {
    return (
      <>
        <div
          className="md:hidden min-w-[44px] min-h-[44px] flex items-center justify-center opacity-70"
          aria-hidden
        >
          <User className="w-6 h-6" strokeWidth={1.5} />
        </div>
        <div className="hidden md:flex items-center gap-2 px-2 py-1 opacity-70">
          <span className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center">
            <User className="w-4 h-4" strokeWidth={2} />
          </span>
        </div>
      </>
    );
  }

  return (
    <>
      <Link
        href={href}
        className="md:hidden min-w-[44px] min-h-[44px] flex items-center justify-center rounded hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#fff200]"
        aria-label={label}
      >
        <User className="w-6 h-6" strokeWidth={1.5} />
      </Link>

      <Link
        href={href}
        className="hidden md:flex items-center gap-2 px-2 py-1 rounded hover:bg-white/10 transition-colors"
      >
        <span className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center shrink-0">
          <User className="w-4 h-4" strokeWidth={2} />
        </span>
        <div className="text-left leading-tight max-w-[120px]">
          <p className="text-[11px] text-white/80">Account</p>
          <p className="text-sm font-semibold truncate">{label}</p>
        </div>
      </Link>
    </>
  );
}
