"use client";

import Link from "next/link";
import { BrandLogo } from "@/components/store/BrandLogo";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  FolderOpen,
  Layers,
  SlidersHorizontal,
  Tag,
  FileText,
  LayoutGrid,
  BarChart3,
  FileBarChart,
  Settings,
  LogOut,
  Menu,
  X,
  Plus,
  Store,
  RotateCcw,
  Star,
  Mail,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
};

type NavSection = {
  title?: string;
  items: NavItem[];
};

const navSections: NavSection[] = [
  {
    items: [
      { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
      { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
      { href: "/admin/products", label: "Products", icon: Package },
      { href: "/admin/categories", label: "Categories", icon: FolderOpen },
      { href: "/admin/customers", label: "Customers", icon: Users },
    ],
  },
  {
    title: "Catalog",
    items: [
      { href: "/admin/collections", label: "Collections", icon: Layers },
      { href: "/admin/attributes", label: "Attributes", icon: SlidersHorizontal },
    ],
  },
  {
    title: "Operations",
    items: [
      { href: "/admin/returns", label: "Returns", icon: RotateCcw },
      { href: "/admin/reviews", label: "Reviews", icon: Star },
      { href: "/admin/newsletter", label: "Newsletter", icon: Mail },
    ],
  },
  {
    title: "Marketing",
    items: [
      { href: "/admin/coupons", label: "Coupons", icon: Tag },
      { href: "/admin/pages", label: "Pages", icon: FileText },
      { href: "/admin/widgets", label: "Widgets", icon: LayoutGrid },
    ],
  },
  {
    title: "Insights",
    items: [
      { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
      { href: "/admin/reports", label: "Reports", icon: FileBarChart },
    ],
  },
];

function NavLink({
  item,
  pathname,
  onNavigate,
}: {
  item: NavItem;
  pathname: string;
  onNavigate: () => void;
}) {
  const active = item.exact
    ? pathname === item.href
    : pathname === item.href || pathname.startsWith(`${item.href}/`);

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
        active
          ? "bg-slate-100 text-slate-900"
          : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
      )}
    >
      <item.icon className="w-[18px] h-[18px] shrink-0" strokeWidth={1.75} />
      {item.label}
    </Link>
  );
}

export function AdminSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <>
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white border border-slate-200 rounded-xl shadow-sm"
        onClick={() => setOpen(!open)}
      >
        {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 flex flex-col transform transition-transform lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="px-5 py-6">
          <div className="flex items-center gap-2.5">
            <BrandLogo
              href="/admin"
              size="compact"
              className="rounded overflow-hidden"
              onClick={close}
            />
            <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
              Admin
            </span>
          </div>
        </div>

        <div className="px-4 mb-2 space-y-2">
          <Link
            href="/admin/products/new"
            onClick={close}
            className="flex items-center justify-center gap-2 w-full bg-slate-900 text-white py-3 rounded-xl text-sm font-semibold hover:bg-slate-800 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add product
          </Link>
          <Link
            href="/"
            target="_blank"
            onClick={close}
            className="flex items-center justify-center gap-2 w-full border border-slate-200 text-slate-600 py-2.5 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors"
          >
            <Store className="w-4 h-4" />
            View store
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
          {navSections.map((section, i) => (
            <div key={section.title ?? `main-${i}`} className={section.title ? "pt-4" : ""}>
              {section.title && (
                <p className="px-3 pb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  {section.title}
                </p>
              )}
              <div className="space-y-0.5">
                {section.items.map((item) => (
                  <NavLink
                    key={item.href}
                    item={item}
                    pathname={pathname}
                    onNavigate={close}
                  />
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-slate-100 space-y-1">
          <NavLink
            item={{
              href: "/admin/settings",
              label: "Settings",
              icon: Settings,
            }}
            pathname={pathname}
            onNavigate={close}
          />
          <Link
            href="/"
            onClick={close}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-[18px] h-[18px]" strokeWidth={1.75} />
            Exit admin
          </Link>
        </div>
      </aside>

      {open && (
        <div
          className="fixed inset-0 bg-black/30 z-30 lg:hidden"
          onClick={close}
        />
      )}
    </>
  );
}
