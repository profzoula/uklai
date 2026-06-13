"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  Package,
  Download,
  RotateCcw,
  Settings,
  MapPin,
  HelpCircle,
  ShoppingBag,
  LogOut,
  LayoutDashboard,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { useRouter } from "next/navigation";

const primaryLinks = [
  { href: "/account/overview", label: "Overview", icon: LayoutGrid },
  { href: "/account/orders", label: "Orders", icon: Package },
  { href: "/account/downloads", label: "Downloads", icon: Download },
  { href: "/account/returns", label: "Returns / refunds", icon: RotateCcw },
  { href: "/account/settings", label: "Settings", icon: Settings },
  { href: "/account/addresses", label: "Shipping address", icon: MapPin },
];

const secondaryLinks = [
  { href: "/contact", label: "Help center", icon: HelpCircle },
  { href: "/shop", label: "Continue shopping", icon: ShoppingBag },
];

type Props = {
  isAdmin?: boolean;
};

function NavLink({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 px-4 py-2.5 text-sm transition-colors border-l-[3px]",
        active
          ? "border-primary bg-slate-100 text-slate-900 font-semibold"
          : "border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900"
      )}
    >
      <Icon className="w-4 h-4 shrink-0 opacity-70" aria-hidden="true" />
      {label}
    </Link>
  );
}

export function AccountNav({ isAdmin = false }: Props) {
  const pathname = usePathname();
  const router = useRouter();

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  async function signOut() {
    if (isSupabaseConfigured()) {
      const supabase = createClient();
      await supabase.auth.signOut();
    }
    router.push("/");
    router.refresh();
  }

  return (
    <aside className="bg-white border border-slate-200 rounded-lg overflow-hidden lg:sticky lg:top-6 self-start">
      <div className="px-4 py-4 border-b border-slate-100">
        <h2 className="text-base font-bold text-slate-900">Account</h2>
      </div>

      <nav className="py-1">
        {isAdmin && (
          <Link
            href="/admin"
            className="mx-3 my-2 flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-semibold bg-primary text-white hover:bg-primary-dark transition-colors"
          >
            <LayoutDashboard className="w-4 h-4" />
            Admin dashboard
          </Link>
        )}

        {primaryLinks.map(({ href, label, icon }) => (
          <NavLink
            key={href}
            href={href}
            label={label}
            icon={icon}
            active={isActive(href)}
          />
        ))}

        <div className="my-2 mx-4 border-t border-slate-100" />

        {secondaryLinks.map(({ href, label, icon }) => (
          <NavLink
            key={href}
            href={href}
            label={label}
            icon={icon}
            active={false}
          />
        ))}

        <button
          type="button"
          onClick={signOut}
          className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 border-l-[3px] border-transparent transition-colors"
        >
          <LogOut className="w-4 h-4 shrink-0" aria-hidden="true" />
          Sign out
        </button>
      </nav>
    </aside>
  );
}
