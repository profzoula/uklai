import Link from "next/link";
import {
  Plus,
  Package,
  ShoppingCart,
  Tag,
  FolderOpen,
  AlertTriangle,
} from "lucide-react";

const actions = [
  {
    label: "Add product",
    href: "/admin/products/new",
    icon: Plus,
    description: "Create a new catalog item",
  },
  {
    label: "View orders",
    href: "/admin/orders",
    icon: ShoppingCart,
    description: "Track and update orders",
  },
  {
    label: "Manage coupons",
    href: "/admin/coupons",
    icon: Tag,
    description: "Discount codes & promos",
  },
  {
    label: "Categories",
    href: "/admin/categories",
    icon: FolderOpen,
    description: "Organize your catalog",
  },
];

export function DashboardQuickActions() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {actions.map((action) => (
        <Link
          key={action.href}
          href={action.href}
          className="group bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:border-slate-300 hover:shadow-md transition-all"
        >
          <action.icon className="w-5 h-5 text-primary mb-3 group-hover:text-primary-dark transition-colors" strokeWidth={1.75} />
          <p className="font-semibold text-slate-900 text-sm">{action.label}</p>
          <p className="text-xs text-slate-500 mt-1">{action.description}</p>
        </Link>
      ))}
    </div>
  );
}

type StockProps = {
  products: Array<{ id: string; name: string; stock: number; slug: string }>;
  title: string;
  variant: "low" | "out";
};

export function StockAlertPanel({ products, title, variant }: StockProps) {
  if (products.length === 0) return null;

  const isOut = variant === "out";

  return (
    <section
      className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
      aria-labelledby={`stock-alert-${variant}`}
    >
      <div className="flex items-center gap-2 px-6 py-4 border-b border-slate-100">
        <AlertTriangle
          className={`w-5 h-5 ${isOut ? "text-red-500" : "text-amber-500"}`}
          aria-hidden="true"
        />
        <h2 id={`stock-alert-${variant}`} className="text-lg font-bold text-slate-900">
          {title}
        </h2>
        <span className="ml-auto text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
          {products.length}
        </span>
      </div>
      <ul className="divide-y divide-slate-100">
        {products.slice(0, 5).map((product) => (
          <li key={product.id}>
            <Link
              href={`/admin/products/${product.id}`}
              className="flex items-center justify-between px-6 py-3.5 hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <Package className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="text-sm font-medium text-slate-900 truncate">
                  {product.name}
                </span>
              </div>
              <span
                className={`text-sm font-semibold shrink-0 ml-3 ${
                  isOut ? "text-red-500" : "text-amber-600"
                }`}
              >
                {product.stock} left
              </span>
            </Link>
          </li>
        ))}
      </ul>
      {products.length > 5 && (
        <div className="px-6 py-3 border-t border-slate-100">
          <Link
            href="/admin/products"
            className="text-sm font-medium text-primary hover:text-primary-dark"
          >
            View all products →
          </Link>
        </div>
      )}
    </section>
  );
}
