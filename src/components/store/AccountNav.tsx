"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Package, Download, LogOut, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { useRouter } from "next/navigation";

const links = [
  { href: "/account/orders", label: "Orders", icon: Package },
  { href: "/account/downloads", label: "Downloads", icon: Download },
];

type Props = {
  isAdmin?: boolean;
};

export function AccountNav({ isAdmin = false }: Props) {
  const pathname = usePathname();
  const router = useRouter();

  async function signOut() {
    if (isSupabaseConfigured()) {
      const supabase = createClient();
      await supabase.auth.signOut();
    }
    router.push("/");
    router.refresh();
  }

  return (
    <nav className="space-y-1">
      {isAdmin && (
        <Link
          href="/admin"
          className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold bg-primary text-white hover:bg-primary-dark transition-colors mb-2"
        >
          <LayoutDashboard className="w-4 h-4" />
          Admin dashboard
        </Link>
      )}
      {links.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          className={cn(
            "flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
            pathname === href || pathname.startsWith(`${href}/`)
              ? "bg-primary/10 text-primary"
              : "text-slate-600 hover:bg-slate-50"
          )}
        >
          <Icon className="w-4 h-4" />
          {label}
        </Link>
      ))}
      <button
        type="button"
        onClick={signOut}
        className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 w-full"
      >
        <LogOut className="w-4 h-4" />
        Sign out
      </button>
    </nav>
  );
}
