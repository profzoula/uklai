"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Product } from "@/types/database";
import { formatPrice } from "@/lib/utils";
import { AdminRowActions } from "@/components/admin/AdminRowActions";

type Props = {
  products: Product[];
};

export function AdminProductsTable({ products }: Props) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  const allSelected = products.length > 0 && selected.size === products.length;
  const someSelected = selected.size > 0 && !allSelected;

  const selectedProducts = useMemo(
    () => products.filter((p) => selected.has(p.id)),
    [products, selected]
  );

  function toggleAll() {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(products.map((p) => p.id)));
    }
  }

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function runBulkAction(action: "deactivate" | "activate" | "delete") {
    const ids = [...selected];
    if (!ids.length) return;

    const labels = {
      deactivate: "deactivate",
      activate: "activate",
      delete: "permanently delete",
    };

    if (
      !confirm(
        `${labels[action].charAt(0).toUpperCase() + labels[action].slice(1)} ${ids.length} product${ids.length === 1 ? "" : "s"}?`
      )
    ) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/admin/products/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids, action }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        alert(data.error ?? "Action failed.");
        return;
      }

      setSelected(new Set());
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  const hasInactive = selectedProducts.some((p) => !p.active);
  const hasActive = selectedProducts.some((p) => p.active);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      {selected.size > 0 && (
        <div className="flex flex-wrap items-center gap-3 px-6 py-3 border-b border-slate-200 bg-primary/5">
          <span className="text-sm font-medium text-slate-700">
            {selected.size} selected
          </span>
          {hasActive && (
            <button
              type="button"
              disabled={loading}
              onClick={() => runBulkAction("deactivate")}
              className="text-sm font-semibold px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              Deactivate
            </button>
          )}
          {hasInactive && (
            <button
              type="button"
              disabled={loading}
              onClick={() => runBulkAction("activate")}
              className="text-sm font-semibold px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              Activate
            </button>
          )}
          <button
            type="button"
            disabled={loading}
            onClick={() => runBulkAction("delete")}
            className="text-sm font-semibold px-3 py-1.5 rounded-lg border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-50"
          >
            Delete
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => setSelected(new Set())}
            className="text-sm text-slate-500 hover:text-slate-700 ml-auto"
          >
            Clear selection
          </button>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="w-12 px-4 py-4">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = someSelected;
                  }}
                  onChange={toggleAll}
                  aria-label="Select all products"
                  className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary/30"
                />
              </th>
              <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">
                Product
              </th>
              <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">
                Price
              </th>
              <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">
                Stock
              </th>
              <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">
                Status
              </th>
              <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">
                Badge
              </th>
              <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {products.map((product) => (
              <tr
                key={product.id}
                onClick={() => router.push(`/admin/products/${product.id}`)}
                className={`hover:bg-slate-50 cursor-pointer ${
                  selected.has(product.id) ? "bg-primary/5" : ""
                }`}
              >
                <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={selected.has(product.id)}
                    onChange={() => toggleOne(product.id)}
                    aria-label={`Select ${product.name}`}
                    className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary/30"
                  />
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                      {product.image_url && (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-sm text-slate-900">
                        {product.name}
                      </p>
                      <p className="text-xs text-slate-400">{product.slug}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm font-semibold">
                    {formatPrice(product.price)}
                  </p>
                  {product.compare_at_price && (
                    <p className="text-xs text-slate-400 line-through">
                      {formatPrice(product.compare_at_price)}
                    </p>
                  )}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`text-sm font-medium ${
                      product.stock > 10
                        ? "text-green-600"
                        : product.stock > 0
                          ? "text-amber-600"
                          : "text-red-500"
                    }`}
                  >
                    {product.stock}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                      product.active
                        ? "bg-green-50 text-green-600"
                        : "bg-red-50 text-red-500"
                    }`}
                  >
                    {product.active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {product.badge ? (
                    <span className="text-xs font-medium bg-primary-light text-primary px-2.5 py-1 rounded-full">
                      {product.badge}
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400">—</span>
                  )}
                </td>
                <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                  <AdminRowActions
                    deleteUrl={`/api/admin/products/${product.id}`}
                    label={product.name}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {products.length === 0 && (
        <p className="text-center text-sm text-slate-500 py-12">
          No products found.
        </p>
      )}
    </div>
  );
}
