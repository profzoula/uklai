import Link from "next/link";
import {
  Link2,
  Tag,
  Hash,
  Gift,
  FileText,
  Puzzle,
} from "lucide-react";

const resources = [
  {
    href: "/admin/categories",
    label: "Categories",
    icon: Link2,
    description: "Organize products by category",
  },
  {
    href: "/admin/collections",
    label: "Collections",
    icon: Tag,
    description: "Curated product groups",
  },
  {
    href: "/admin/attributes",
    label: "Attributes",
    icon: Hash,
    description: "Color, size, and variants",
  },
  {
    href: "/admin/coupons",
    label: "Coupons",
    icon: Gift,
    description: "Discount codes and promotions",
  },
  {
    href: "/admin/pages",
    label: "Pages",
    icon: FileText,
    description: "CMS static content",
  },
  {
    href: "/admin/widgets",
    label: "Widgets",
    icon: Puzzle,
    description: "Homepage layout blocks",
  },
];

export default function ResourcesPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Resources</h1>
        <p className="text-slate-500 mt-1">
          Manage catalog, promotions, and content resources
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {resources.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="bg-white rounded-2xl border border-slate-200 p-6 hover:border-slate-300 hover:shadow-sm transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center mb-4 group-hover:bg-slate-900 group-hover:text-white transition-colors">
              <item.icon className="w-5 h-5 text-slate-600 group-hover:text-white" />
            </div>
            <h3 className="font-semibold text-slate-900">{item.label}</h3>
            <p className="text-sm text-slate-500 mt-1">{item.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
