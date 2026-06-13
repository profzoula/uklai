"use client";

import Link from "next/link";
import { Search, Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AdminNotifications } from "@/components/admin/AdminNotifications";

export function AdminHeader() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    router.push(
      trimmed
        ? `/admin/products?q=${encodeURIComponent(trimmed)}`
        : "/admin/products"
    );
  }

  return (
    <header className="sticky top-0 z-20 bg-slate-50/80 backdrop-blur border-b border-slate-200">
      <div className="flex items-center justify-between gap-4 px-6 lg:px-8 py-4">
        <form
          onSubmit={handleSearch}
          className="flex-1 max-w-xl ml-10 lg:ml-0"
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-slate-300"
            />
          </div>
        </form>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/admin/settings"
            className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors"
            aria-label="Settings"
          >
            <Settings className="w-5 h-5" strokeWidth={1.75} />
          </Link>

          <AdminNotifications />

          <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-slate-200">
            <div className="w-9 h-9 rounded-full bg-[#0046be] text-white flex items-center justify-center text-sm font-bold">
              A
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900 leading-tight">
                Admin
              </p>
              <p className="text-xs text-slate-500">UKLAI</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
