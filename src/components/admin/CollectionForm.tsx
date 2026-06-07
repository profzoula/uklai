"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ChevronLeft, Plus, Trash2, Search, X } from "lucide-react";
import { slugify, formatPrice } from "@/lib/utils";
import type { Collection, CollectionProductRow } from "@/lib/admin-data-types";

type Props = {
  collection?: Collection;
  initialProducts?: CollectionProductRow[];
};

type ProductOption = CollectionProductRow;

const inputClass =
  "w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40";
const labelClass = "text-sm font-medium text-slate-700";

function Panel({
  title,
  subtitle,
  action,
  children,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-white border border-slate-200 rounded-lg shadow-sm">
      <div className="px-5 py-4 border-b border-slate-100 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900">{title}</h2>
          {subtitle && (
            <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
          )}
        </div>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

function RequiredLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className={`${labelClass} mb-1.5 inline-flex items-center gap-1`}>
      {children}
      <span className="text-red-500">*</span>
    </label>
  );
}

export function CollectionForm({ collection, initialProducts = [] }: Props) {
  const router = useRouter();
  const isEdit = !!collection;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [slugTouched, setSlugTouched] = useState(isEdit);

  const [form, setForm] = useState({
    name: collection?.name ?? "",
    slug: collection?.slug ?? "",
    description: collection?.description ?? "",
    active: collection?.active ?? true,
  });

  const [assignedProducts, setAssignedProducts] =
    useState<CollectionProductRow[]>(initialProducts);
  const [catalog, setCatalog] = useState<ProductOption[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [productSearch, setProductSearch] = useState("");
  const [listSearch, setListSearch] = useState("");

  useEffect(() => {
    fetch("/api/admin/products")
      .then((res) => res.json())
      .then((data) => setCatalog(Array.isArray(data) ? data : []))
      .catch(() => setCatalog([]));
  }, []);

  useEffect(() => {
    if (!slugTouched && form.name) {
      setForm((prev) => ({ ...prev, slug: slugify(form.name) }));
    }
  }, [form.name, slugTouched]);

  const assignedIds = useMemo(
    () => new Set(assignedProducts.map((p) => p.id)),
    [assignedProducts]
  );

  const filteredAssigned = useMemo(() => {
    const q = listSearch.trim().toLowerCase();
    if (!q) return assignedProducts;
    return assignedProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q) ||
        p.sku?.toLowerCase().includes(q)
    );
  }, [assignedProducts, listSearch]);

  const pickerProducts = useMemo(() => {
    const q = productSearch.trim().toLowerCase();
    return catalog.filter((p) => {
      if (assignedIds.has(p.id)) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q) ||
        p.sku?.toLowerCase().includes(q)
      );
    });
  }, [catalog, productSearch, assignedIds]);

  function addProduct(product: ProductOption) {
    setAssignedProducts((prev) => [...prev, product]);
  }

  function removeProduct(id: string) {
    setAssignedProducts((prev) => prev.filter((p) => p.id !== id));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload = {
      name: form.name,
      slug: form.slug,
      description: form.description,
      active: form.active,
      product_ids: assignedProducts.map((p) => p.id),
    };

    const url = isEdit
      ? `/api/admin/collections/${collection!.id}`
      : "/api/admin/collections";
    const method = isEdit ? "PATCH" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to save collection");
      router.push("/admin/collections");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl">
      <Link
        href="/admin/collections"
        className="inline-flex items-center gap-1 text-sm text-primary hover:text-primary-dark mb-4"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to collections
      </Link>

      <h1 className="text-2xl font-bold text-slate-900 mb-6">
        {isEdit ? `Editing ${collection!.name}` : "New Collection"}
      </h1>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Panel
          title="General Information"
          subtitle="Manage general information about the collection."
        >
          <div className="space-y-4">
            <div>
              <RequiredLabel>Collection Name</RequiredLabel>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) =>
                  setForm({ ...form, name: e.target.value })
                }
                className={inputClass}
                placeholder="Best Sellers"
              />
            </div>
            <div>
              <RequiredLabel>Collection Code</RequiredLabel>
              <input
                type="text"
                required
                value={form.slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  setForm({
                    ...form,
                    slug: slugify(e.target.value),
                  });
                }}
                className={inputClass}
                placeholder="best-sellers"
              />
              <p className="text-xs text-slate-400 mt-1">
                Used in URLs: /shop?collection={form.slug || "code"}
              </p>
            </div>
            <div>
              <label className={`${labelClass} mb-1.5 block`}>
                Description
              </label>
              <textarea
                rows={4}
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                className={inputClass}
                placeholder="Short description for this collection"
              />
            </div>
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) =>
                  setForm({ ...form, active: e.target.checked })
                }
                className="rounded border-slate-300"
              />
              Active collection
            </label>
          </div>
        </Panel>

        <Panel
          title="Products"
          subtitle="Manage the products assigned to this collection."
          action={
            <button
              type="button"
              onClick={() => setPickerOpen(true)}
              className="text-sm font-semibold text-green-600 hover:text-green-700"
            >
              Add Products
            </button>
          }
        >
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="search"
              value={listSearch}
              onChange={(e) => setListSearch(e.target.value)}
              placeholder="Search products"
              className={`${inputClass} pl-9`}
            />
          </div>

          {filteredAssigned.length === 0 ? (
            <p className="text-sm text-slate-500 py-8 text-center border border-dashed border-slate-200 rounded-lg">
              {assignedProducts.length === 0
                ? "No product to display. 0 items"
                : "No products match your search."}
            </p>
          ) : (
            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold">
                      Product
                    </th>
                    <th className="text-left px-4 py-3 font-semibold">SKU</th>
                    <th className="text-left px-4 py-3 font-semibold">
                      Price
                    </th>
                    <th className="text-right px-4 py-3 font-semibold w-16">
                      Remove
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAssigned.map((product) => (
                    <tr
                      key={product.id}
                      className="border-t border-slate-100 hover:bg-slate-50"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden shrink-0">
                            {product.image_url && (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={product.image_url}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            )}
                          </div>
                          <span className="font-medium text-slate-900">
                            {product.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        {product.sku ?? "—"}
                      </td>
                      <td className="px-4 py-3 font-medium">
                        {formatPrice(product.price)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => removeProduct(product.id)}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"
                          aria-label={`Remove ${product.name}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <p className="text-xs text-slate-400 mt-3">
            {assignedProducts.length} item
            {assignedProducts.length !== 1 ? "s" : ""} assigned
          </p>
        </Panel>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Link
            href="/admin/collections"
            className="px-5 py-2.5 rounded-lg text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-100"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 rounded-lg text-sm font-semibold text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </form>

      {pickerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900">Add products</h3>
              <button
                type="button"
                onClick={() => {
                  setPickerOpen(false);
                  setProductSearch("");
                }}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 border-b border-slate-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="search"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Search catalog"
                  className={`${inputClass} pl-9`}
                  autoFocus
                />
              </div>
            </div>
            <ul className="overflow-y-auto flex-1 divide-y divide-slate-100">
              {pickerProducts.length === 0 ? (
                <li className="p-8 text-center text-sm text-slate-500">
                  No products available to add.
                </li>
              ) : (
                pickerProducts.slice(0, 50).map((product) => (
                  <li
                    key={product.id}
                    className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-slate-50"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded bg-slate-100 overflow-hidden shrink-0">
                        {product.image_url && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={product.image_url}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">
                          {product.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {formatPrice(product.price)}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => addProduct(product)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary-dark shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add
                    </button>
                  </li>
                ))
              )}
            </ul>
            <div className="px-5 py-3 border-t border-slate-100 text-right">
              <button
                type="button"
                onClick={() => {
                  setPickerOpen(false);
                  setProductSearch("");
                }}
                className="px-4 py-2 text-sm font-semibold bg-slate-900 text-white rounded-lg hover:bg-slate-800"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
