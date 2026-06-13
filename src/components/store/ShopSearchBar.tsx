"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";

type Props = {
  defaultQuery?: string;
};

export function ShopSearchBar({ defaultQuery = "" }: Props) {
  const router = useRouter();
  const [query, setQuery] = useState(defaultQuery);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    router.push(trimmed ? `/shop?q=${encodeURIComponent(trimmed)}` : "/shop");
  }

  return (
    <form onSubmit={handleSubmit} className="relative">
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search products…"
        className="w-full h-10 pl-3.5 pr-10 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40"
      />
      <button
        type="submit"
        className="absolute right-0 top-0 h-10 w-10 flex items-center justify-center text-slate-500 hover:text-primary transition-colors"
        aria-label="Search products"
      >
        <Search className="w-4 h-4" />
      </button>
    </form>
  );
}
