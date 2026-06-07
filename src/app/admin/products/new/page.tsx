import Link from "next/link";
import { ArrowLeft, ChevronRight, Download, Package } from "lucide-react";

const productTypes = [
  {
    type: "physical",
    title: "Physical product",
    description: "Products that require shipping or pick up",
    icon: Package,
    iconBg: "bg-violet-100",
    iconColor: "text-violet-600",
  },
  {
    type: "digital",
    title: "Digital product",
    description:
      "Products that could be downloaded via link after purchase",
    icon: Download,
    iconBg: "bg-slate-100",
    iconColor: "text-slate-600",
  },
] as const;

export default function NewProductTypePage() {
  return (
    <div className="max-w-3xl mx-auto">
      <Link
        href="/admin/products"
        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-primary mb-8"
      >
        <span className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50">
          <ArrowLeft className="w-4 h-4" />
        </span>
        Create a new product
      </Link>

      <div className="text-center mb-10">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
          What do you want to sell?
        </h1>
      </div>

      <div className="space-y-4">
        {productTypes.map((item) => (
          <Link
            key={item.type}
            href={`/admin/products/new/${item.type}`}
            className="group flex items-center gap-4 sm:gap-5 p-5 sm:p-6 bg-white border border-slate-200 rounded-2xl hover:border-slate-300 hover:shadow-md transition-all"
          >
            <div
              className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl ${item.iconBg} flex items-center justify-center shrink-0`}
            >
              <item.icon className={`w-7 h-7 sm:w-8 sm:h-8 ${item.iconColor}`} />
            </div>
            <div className="flex-1 text-left min-w-0">
              <p className="text-base sm:text-lg font-bold text-slate-900">
                {item.title}
              </p>
              <p className="text-sm text-slate-500 mt-0.5">{item.description}</p>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-slate-600 shrink-0" />
          </Link>
        ))}
      </div>
    </div>
  );
}
