"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Search,
  Menu,
  X,
  User,
  ShoppingCart,
  ChevronDown,
  Store,
} from "lucide-react";
import { useCartStore } from "@/store/cart";
import { HeaderAccountLink } from "@/components/store/HeaderAccountLink";
import { BrandLogo } from "@/components/store/BrandLogo";
import { cn } from "@/lib/utils";

const menuButtons = [
  { label: "Shop", href: "/shop" },
  { label: "Deals", href: "/shop?deals=true" },
  { label: "Support & Services", href: "/contact" },
  { label: "Discover", href: "/shop?featured=true" },
];

export function Header() {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [query, setQuery] = useState("");
  const itemCount = useCartStore((s) => s.getItemCount());

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    router.push(trimmed ? `/shop?q=${encodeURIComponent(trimmed)}` : "/shop");
    setMobileOpen(false);
  }

  return (
    <header className="sticky top-0 z-50 bg-[#0046be] text-white shadow-md">
      {/* Top row */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 sm:gap-4 h-14 sm:h-[60px]">
          <BrandLogo
            className="rounded overflow-hidden"
            onClick={() => setMobileOpen(false)}
          />

          <form
            onSubmit={handleSearch}
            className="hidden sm:flex flex-1 max-w-3xl mx-auto"
          >
            <div className="relative w-full">
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search UKLAI"
                className="w-full h-10 pl-4 pr-11 rounded-md bg-white text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#fff200]"
              />
              <button
                type="submit"
                className="absolute right-0 top-0 h-10 w-10 flex items-center justify-center text-slate-900 hover:text-[#0046be] transition-colors"
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>
            </div>
          </form>

          <div className="flex items-center gap-1 sm:gap-2 ml-auto">
            <Link
              href="/shop"
              className="hidden lg:flex items-center gap-2 px-2 py-1 rounded hover:bg-white/10 transition-colors"
            >
              <Store className="w-6 h-6 shrink-0" strokeWidth={1.5} />
              <div className="text-left leading-tight">
                <p className="text-[11px] text-white/80">Your store</p>
                <p className="text-sm font-semibold">UKLAI Online</p>
              </div>
            </Link>

            <HeaderAccountLink />

            <span className="hidden md:block w-px h-8 bg-white/30 mx-1" />

            <Link
              href="/cart"
              className="relative p-2 rounded hover:bg-white/10 transition-colors"
              aria-label="Cart"
            >
              <ShoppingCart className="w-6 h-6" strokeWidth={1.5} />
              {itemCount > 0 && (
                <span className="absolute top-0.5 right-0.5 min-w-[18px] h-[18px] bg-[#fff200] text-[#0046be] text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                  {itemCount}
                </span>
              )}
            </Link>

            <button
              className="md:hidden p-2 rounded hover:bg-white/10 transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
            >
              {mobileOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile search */}
        <form onSubmit={handleSearch} className="sm:hidden pb-3">
          <div className="relative">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search UKLAI"
              className="w-full h-10 pl-4 pr-11 rounded-md bg-white text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#fff200]"
            />
            <button
              type="submit"
              className="absolute right-0 top-0 h-10 w-10 flex items-center justify-center text-slate-900"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>

      {/* Bottom nav row */}
      <div className="hidden md:block border-t border-white/20">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-11 gap-2">
            {menuButtons.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="inline-flex items-center gap-1 h-8 px-3 text-sm font-medium border border-white/70 rounded-full hover:bg-white/10 transition-colors whitespace-nowrap"
              >
                {item.label}
                <ChevronDown className="w-3.5 h-3.5 opacity-80" />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={cn(
          "md:hidden border-t border-white/20 bg-[#003da5] overflow-hidden transition-all duration-200",
          mobileOpen ? "max-h-[480px]" : "max-h-0"
        )}
      >
        <nav className="px-4 py-4 flex flex-col gap-1">
          {menuButtons.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="flex items-center justify-between py-2.5 text-sm font-medium border-b border-white/10"
              onClick={() => setMobileOpen(false)}
            >
              {item.label}
              <ChevronDown className="w-4 h-4 opacity-60 -rotate-90" />
            </Link>
          ))}
          <Link
            href="/auth/login"
            className="mt-2 py-2.5 text-sm font-semibold text-[#fff200]"
            onClick={() => setMobileOpen(false)}
          >
            Sign in to your account
          </Link>
        </nav>
      </div>
    </header>
  );
}
