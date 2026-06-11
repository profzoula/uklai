import Link from "next/link";
import { Plus, Upload } from "lucide-react";
import { getAllProductsAdmin } from "@/lib/data";
import { AdminProductsTable } from "@/components/admin/AdminProductsTable";

type Props = {
  searchParams: Promise<{ q?: string }>;
};

export default async function AdminProductsPage({ searchParams }: Props) {
  const { q } = await searchParams;
  const search = q?.trim().toLowerCase();
  let products = await getAllProductsAdmin();

  if (search) {
    products = products.filter(
      (p) =>
        p.name.toLowerCase().includes(search) ||
        p.slug.toLowerCase().includes(search)
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Products</h1>
          <p className="text-slate-500 mt-1">
            {search
              ? `${products.length} results for "${q}"`
              : `Manage your product catalog (${products.length} products)`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/products/import"
            className="inline-flex items-center gap-2 border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors"
          >
            <Upload className="w-4 h-4" />
            Import CSV
          </Link>
          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary-dark transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </Link>
        </div>
      </div>

      <AdminProductsTable products={products} />
    </div>
  );
}
