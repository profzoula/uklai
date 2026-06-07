import Link from "next/link";
import { Plus } from "lucide-react";
import { getAllCategoriesAdmin } from "@/lib/data";
import { AdminRowActions } from "@/components/admin/AdminRowActions";
import { AdminClickableRow } from "@/components/admin/AdminClickableRow";
import { CategorySortButtons } from "@/components/admin/CategorySortButtons";

export default async function AdminCategoriesPage() {
  const categories = await getAllCategoriesAdmin();

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Categories</h1>
          <p className="text-slate-500 mt-1">
            Organize products — drag order with arrows ({categories.length}{" "}
            categories)
          </p>
        </div>
        <Link
          href="/admin/categories/new"
          className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary-dark transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Category
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-4 w-16">
                  Order
                </th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">
                  Category
                </th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">
                  Slug
                </th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">
                  Sort #
                </th>
                <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {categories.map((category, index) => (
                <AdminClickableRow
                  key={category.id}
                  href={`/admin/categories/${category.id}`}
                >
                  <td className="px-4 py-4">
                    <CategorySortButtons
                      id={category.id}
                      canMoveUp={index > 0}
                      canMoveDown={index < categories.length - 1}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                        {category.image_url && (
                          <img
                            src={category.image_url}
                            alt={category.name}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-sm text-slate-900">
                          {category.name}
                        </p>
                        <p className="text-xs text-slate-400 line-clamp-1 max-w-xs">
                          {category.description}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {category.slug}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-700">
                    {category.sort_order}
                  </td>
                  <td className="px-6 py-4">
                    <AdminRowActions
                      deleteUrl={`/api/admin/categories/${category.id}`}
                      label={category.name}
                    />
                  </td>
                </AdminClickableRow>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
