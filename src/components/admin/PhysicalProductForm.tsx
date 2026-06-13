"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  Package,
  HelpCircle,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Link2,
  Image as ImageIcon,
  Trash2,
  Copy,
  ExternalLink,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { slugify } from "@/lib/utils";
import {
  dbPricesToFormFields,
  formFieldsToDbPrices,
  validateFormPrices,
} from "@/lib/product-pricing";
import type { Attribute } from "@/lib/admin-data-types";
import type { CatalogType, Category, Product } from "@/types/database";
import { ProductMediaGallery } from "@/components/admin/ProductMediaGallery";
import { ProductVariantsPanel } from "@/components/admin/ProductVariantsPanel";

type Props = {
  product?: Product;
};

const inputClass =
  "w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40";
const labelClass = "text-sm font-medium text-slate-700";

function RequiredLabel({
  children,
  hint,
}: {
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="mb-1.5">
      <label className={`${labelClass} inline-flex items-center gap-1`}>
        {children}
        <span className="text-red-500">*</span>
        {hint && (
          <HelpCircle className="w-3.5 h-3.5 text-slate-400" aria-label={hint} />
        )}
      </label>
    </div>
  );
}

function Panel({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-white border border-slate-200 rounded-lg shadow-sm">
      <div className="px-5 py-4 border-b border-slate-100">
        <h2 className="text-sm font-bold text-slate-900">{title}</h2>
        {subtitle && (
          <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
        )}
      </div>
      <div className="p-5 space-y-4">{children}</div>
    </section>
  );
}

function RadioRow({
  name,
  value,
  checked,
  onChange,
  label,
}: {
  name: string;
  value: string;
  checked: boolean;
  onChange: (v: string) => void;
  label: string;
}) {
  return (
    <label className="inline-flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={() => onChange(value)}
        className="text-primary focus:ring-primary"
      />
      {label}
    </label>
  );
}

function parseArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter((v) => typeof v === "string");
  return [];
}

function autoSku(name: string) {
  const base = slugify(name).toUpperCase().replace(/-/g, "").slice(0, 8);
  return base ? `NB-${base}` : `NB-${Date.now().toString(36).toUpperCase()}`;
}

function resolveCatalogType(
  product: Product | undefined,
  variantCount: number
): CatalogType {
  if (product?.catalog_type === "variable" || product?.catalog_type === "simple") {
    return product.catalog_type;
  }
  return variantCount > 0 ? "variable" : "simple";
}

export function PhysicalProductForm({ product }: Props) {
  const router = useRouter();
  const isEdit = !!product;
  const slugEdited = useRef(isEdit);

  const [categories, setCategories] = useState<Category[]>([]);
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  const initialPrices = dbPricesToFormFields(
    product?.price ?? 0,
    product?.compare_at_price
  );

  const [form, setForm] = useState({
    name: product?.name ?? "",
    slug: product?.slug ?? "",
    sku: product?.sku ?? "",
    regular_price: initialPrices.regular_price,
    sale_price: initialPrices.sale_price,
    category_id: product?.category_id ?? "",
    tax_class: product?.tax_class ?? "taxable",
    description: product?.description ?? "",
    meta_title: product?.meta_title ?? product?.name ?? "",
    meta_description: product?.meta_description ?? "",
    image_url: product?.image_url ?? "",
    gallery_urls: parseArray(product?.gallery_urls).length
      ? parseArray(product?.gallery_urls)
      : [],
    status: product?.active === false ? "disabled" : "enabled",
    visibility:
      product?.active === false ? "not_visible" : "catalog_search",
    manage_stock: "yes" as "yes" | "no",
    stock_availability:
      (product?.stock ?? 0) > 0 ? "in_stock" : "out_of_stock",
    quantity: product?.stock?.toString() ?? "0",
    free_shipping: product?.free_shipping ?? false,
    weight: product?.weight?.toString() ?? "",
    color: product?.color ?? "",
    size: product?.size ?? "",
    featured: product?.featured ?? false,
    catalog_type: resolveCatalogType(product, 0),
  });

  const isVariable = form.catalog_type === "variable";

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/categories").then((r) => r.json()),
      fetch("/api/admin/attributes").then((r) => r.json()),
    ])
      .then(([cats, attrs]) => {
        setCategories(cats);
        setAttributes(attrs);
      })
      .catch(() => {});

    if (isEdit && product?.id) {
      fetch(`/api/admin/products/${product.id}/variants`)
        .then((r) => r.json())
        .then((data) => {
          const count = Array.isArray(data.variants) ? data.variants.length : 0;
          setForm((prev) => ({
            ...prev,
            catalog_type: resolveCatalogType(product, count),
          }));
        })
        .catch(() => {});
    }
  }, [isEdit, product]);

  const colorAttr = attributes.find((a) => a.slug === "color");
  const sizeAttr = attributes.find((a) => a.slug === "size");

  function updateName(name: string) {
    setForm((prev) => ({
      ...prev,
      name,
      slug: slugEdited.current ? prev.slug : slugify(name),
      meta_title: prev.meta_title || name,
    }));
  }

  function buildPayload() {
    const gallery = form.gallery_urls.map((u) => u.trim()).filter(Boolean);
    const active =
      form.status === "enabled" && form.visibility === "catalog_search";

    let stock = parseInt(form.quantity) || 0;
    if (form.manage_stock === "no") stock = 9999;
    if (form.stock_availability === "out_of_stock") stock = 0;
    if (form.catalog_type === "variable") stock = 0;

    const { price, compare_at_price } =
      form.catalog_type === "variable"
        ? { price: parseFloat(form.regular_price) || 0, compare_at_price: null }
        : formFieldsToDbPrices(form.regular_price, form.sale_price);

    return {
      name: form.name.trim(),
      slug: form.slug.trim() || slugify(form.name),
      sku: form.sku.trim() || autoSku(form.name),
      description: form.description.trim() || null,
      price,
      compare_at_price,
      image_url: form.image_url.trim() || gallery[0] || null,
      gallery_urls: gallery,
      category_id: form.category_id || null,
      stock,
      tax_class: form.tax_class,
      meta_title: form.meta_title.trim() || form.name.trim(),
      meta_description: form.meta_description.trim() || null,
      weight: form.weight ? parseFloat(form.weight) : null,
      no_shipping_required: false,
      free_shipping: form.free_shipping,
      color: form.color || null,
      size: form.size || null,
      featured: form.featured,
      active,
      product_type: "physical" as const,
      catalog_type: form.catalog_type,
      digital_file_url: null,
      rating: product?.rating ?? 4.5,
      review_count: product?.review_count ?? 0,
      badge: product?.badge ?? null,
      highlights: product?.highlights ?? [],
      updated_at: new Date().toISOString(),
    };
  }

  async function persistProduct(
    payload: ReturnType<typeof buildPayload>,
    mode: "insert" | "update"
  ): Promise<{ error: { message: string } | null; id?: string }> {
    const supabase = createClient();
    const query =
      mode === "update"
        ? supabase.from("products").update(payload).eq("id", product!.id)
        : supabase.from("products").insert(payload).select("id").single();

    let { data, error: saveError } = await query;

    if (saveError && /column/i.test(saveError.message)) {
      const {
        highlights,
        gallery_urls,
        sku,
        product_type,
        catalog_type,
        digital_file_url,
        meta_title,
        meta_description,
        tax_class,
        weight,
        no_shipping_required,
        free_shipping,
        color,
        size,
        ...legacyPayload
      } = payload;
      const fallback =
        mode === "update"
          ? supabase.from("products").update(legacyPayload).eq("id", product!.id)
          : supabase.from("products").insert(legacyPayload).select("id").single();
      ({ data, error: saveError } = await fallback);
    }

    return {
      error: saveError,
      id: mode === "update" ? product!.id : (data as { id: string } | null)?.id,
    };
  }

  const salePriceError = validateFormPrices(
    form.regular_price,
    form.sale_price
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const saveError = validateFormPrices(
      form.regular_price,
      form.sale_price
    );
    if (!isVariable && saveError) {
      setError(saveError);
      setLoading(false);
      return;
    }

    const { error: persistError, id: savedId } = await persistProduct(
      buildPayload(),
      isEdit ? "update" : "insert"
    );
    if (persistError) {
      setError(persistError.message);
      setLoading(false);
      return;
    }

    if (!isEdit && form.catalog_type === "variable" && savedId) {
      router.push(`/admin/products/${savedId}`);
      router.refresh();
      return;
    }

    router.push("/admin/products");
    router.refresh();
  }

  async function handleCreateCategory() {
    if (!newCategoryName.trim()) return;
    const supabase = createClient();
    const { data, error: catError } = await supabase
      .from("categories")
      .insert({
        name: newCategoryName.trim(),
        slug: slugify(newCategoryName),
      })
      .select()
      .single();

    if (catError) {
      alert(catError.message);
      return;
    }

    setCategories((prev) => [...prev, data]);
    setForm((prev) => ({ ...prev, category_id: data.id }));
    setNewCategoryName("");
    setShowNewCategory(false);
  }

  function handleMediaChange(nextImageUrl: string, nextGallery: string[]) {
    setForm((prev) => ({
      ...prev,
      image_url: nextImageUrl,
      gallery_urls: nextGallery,
    }));
  }

  return (
    <div className="max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          {!isEdit && (
            <Link
              href="/admin/products/new"
              className="inline-flex items-center gap-1 text-sm text-primary hover:text-primary-dark font-medium"
            >
              <ChevronLeft className="w-4 h-4" />
              Change type
            </Link>
          )}
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-violet-100 flex items-center justify-center">
              <Package className="w-5 h-5 text-violet-600" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">
              {isEdit ? "Edit physical product" : "Add physical product"}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isEdit && form.slug && (
            <Link
              href={`/products/${form.slug}`}
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50"
            >
              <ExternalLink className="w-4 h-4" />
              Preview
            </Link>
          )}
          <button
            type="submit"
            form="physical-product-form"
            disabled={loading}
            className="px-5 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary-dark disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save product"}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mb-5 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <span className="text-sm font-bold text-slate-900">Product data</span>
        <span className="text-slate-400" aria-hidden="true">
          —
        </span>
        <select
          value={form.catalog_type}
          onChange={(e) =>
            setForm({
              ...form,
              catalog_type: e.target.value as CatalogType,
            })
          }
          className="min-w-[11rem] px-3 py-1.5 border border-primary/30 rounded-md text-sm font-medium text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="simple">Simple product</option>
          <option value="variable">Variable product</option>
        </select>
        <p className="text-xs text-slate-500 w-full sm:w-auto sm:ml-auto">
          {isVariable
            ? "Set price, color, photo, and stock on each variant."
            : "One price and stock level for the whole product."}
        </p>
      </div>

      <form id="physical-product-form" onSubmit={handleSubmit}>
        <div className="grid lg:grid-cols-3 gap-5 items-start">
          {/* Main column */}
          <div className="lg:col-span-2 space-y-5">
            <Panel title="General information">
              <div>
                <RequiredLabel>Product name</RequiredLabel>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => updateName(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={`${labelClass} mb-1.5 block`}>
                  SKU
                  <span className="text-slate-400 font-normal ml-1">
                    (auto-generated if empty)
                  </span>
                </label>
                <input
                  type="text"
                  value={form.sku}
                  onChange={(e) => setForm({ ...form, sku: e.target.value })}
                  placeholder={form.name ? autoSku(form.name) : "Auto"}
                  className={inputClass}
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {isVariable ? (
                  <div className="sm:col-span-2 rounded-lg bg-slate-50 border border-slate-200 px-4 py-3 text-sm text-slate-600">
                    Pricing is managed in the{" "}
                    <span className="font-medium text-slate-800">
                      Product variants
                    </span>{" "}
                    section — each color or option can have its own regular and
                    sale price.
                  </div>
                ) : (
                  <>
                    <div>
                      <RequiredLabel>Regular price</RequiredLabel>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          required
                          value={form.regular_price}
                          onChange={(e) =>
                            setForm({ ...form, regular_price: e.target.value })
                          }
                          className={`${inputClass} pr-12`}
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                          USD
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className={`${labelClass} mb-1.5 block`}>
                        Special price (sale)
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={form.sale_price}
                          onChange={(e) =>
                            setForm({ ...form, sale_price: e.target.value })
                          }
                          aria-invalid={!!salePriceError}
                          className={`${inputClass} pr-12 ${
                            salePriceError
                              ? "border-red-300 focus:border-red-400 focus:ring-red-200"
                              : ""
                          }`}
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                          USD
                        </span>
                      </div>
                      {salePriceError && (
                        <p className="mt-1.5 text-xs text-red-600">
                          {salePriceError}
                        </p>
                      )}
                    </div>
                  </>
                )}
              </div>

              <div>
                <label className={`${labelClass} mb-1.5 block`}>Category</label>
                <div className="flex flex-wrap gap-2">
                  <select
                    value={form.category_id}
                    onChange={(e) =>
                      setForm({ ...form, category_id: e.target.value })
                    }
                    className={`${inputClass} max-w-xs`}
                  >
                    <option value="">Select category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setShowNewCategory(!showNewCategory)}
                    className="text-sm text-primary font-medium hover:underline px-2"
                  >
                    + Create new category
                  </button>
                </div>
                {showNewCategory && (
                  <div className="flex gap-2 mt-2">
                    <input
                      type="text"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      placeholder="Category name"
                      className={inputClass}
                    />
                    <button
                      type="button"
                      onClick={handleCreateCategory}
                      className="px-3 py-2 bg-slate-900 text-white text-sm rounded-lg shrink-0"
                    >
                      Add
                    </button>
                  </div>
                )}
              </div>

              <div>
                <RequiredLabel>Tax class</RequiredLabel>
                <select
                  value={form.tax_class}
                  onChange={(e) =>
                    setForm({ ...form, tax_class: e.target.value })
                  }
                  className={inputClass}
                >
                  <option value="taxable">Taxable goods</option>
                  <option value="none">None</option>
                </select>
              </div>

              <div>
                <label className={`${labelClass} mb-1.5 block`}>
                  Description
                </label>
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 bg-slate-50 border-b border-slate-200">
                    {[Bold, Italic, Underline, List, ListOrdered, Link2, ImageIcon].map(
                      (Icon, i) => (
                        <button
                          key={i}
                          type="button"
                          className="p-1.5 rounded hover:bg-slate-200 text-slate-600"
                        >
                          <Icon className="w-4 h-4" />
                        </button>
                      )
                    )}
                  </div>
                  <textarea
                    rows={6}
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm focus:outline-none resize-y min-h-[120px]"
                    placeholder="Product description..."
                  />
                </div>
              </div>
            </Panel>

            <Panel
              title="Media"
              subtitle="Manage product images and gallery. Drag and drop to reorder images."
            >
              <ProductMediaGallery
                imageUrl={form.image_url}
                galleryUrls={form.gallery_urls}
                onChange={handleMediaChange}
              />
            </Panel>

            {isVariable &&
              (isEdit && product?.id ? (
                <ProductVariantsPanel
                  productId={product.id}
                  colorOptions={colorAttr?.values ?? []}
                  defaultPrice={form.regular_price}
                />
              ) : (
                <Panel
                  title="Product variants"
                  subtitle="SKU, color, photo, price, and stock per variant."
                >
                  <p className="text-sm text-slate-500">
                    Save the product first — you&apos;ll return to this page to
                    add color variants (e.g. White, Black) with their own SKU,
                    image, price, and stock.
                  </p>
                </Panel>
              ))}

            <Panel title="SEO">
              <div>
                <RequiredLabel hint="Auto-generated from product name">
                  URL key
                </RequiredLabel>
                <input
                  type="text"
                  required
                  value={form.slug}
                  onChange={(e) => {
                    slugEdited.current = true;
                    setForm({ ...form, slug: slugify(e.target.value) });
                  }}
                  className={inputClass}
                />
              </div>
              <div>
                <RequiredLabel>Meta title</RequiredLabel>
                <input
                  type="text"
                  required
                  value={form.meta_title}
                  onChange={(e) =>
                    setForm({ ...form, meta_title: e.target.value })
                  }
                  className={inputClass}
                />
              </div>
              <div>
                <label className={`${labelClass} mb-1.5 block`}>
                  Meta description
                </label>
                <textarea
                  rows={3}
                  value={form.meta_description}
                  onChange={(e) =>
                    setForm({ ...form, meta_description: e.target.value })
                  }
                  className={inputClass}
                />
              </div>
            </Panel>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            <Panel title="Product status">
              <div>
                <label className={`${labelClass} mb-2 block`}>Status</label>
                <div className="flex flex-col gap-2">
                  <RadioRow
                    name="status"
                    value="disabled"
                    checked={form.status === "disabled"}
                    onChange={(v) =>
                      setForm({ ...form, status: v as "disabled" | "enabled" })
                    }
                    label="Disabled"
                  />
                  <RadioRow
                    name="status"
                    value="enabled"
                    checked={form.status === "enabled"}
                    onChange={(v) =>
                      setForm({ ...form, status: v as "disabled" | "enabled" })
                    }
                    label="Enabled"
                  />
                </div>
              </div>
              <div>
                <label className={`${labelClass} mb-2 block`}>Visibility</label>
                <div className="flex flex-col gap-2">
                  <RadioRow
                    name="visibility"
                    value="not_visible"
                    checked={form.visibility === "not_visible"}
                    onChange={(v) =>
                      setForm({
                        ...form,
                        visibility: v as "not_visible" | "catalog_search",
                      })
                    }
                    label="Not visible individually"
                  />
                  <RadioRow
                    name="visibility"
                    value="catalog_search"
                    checked={form.visibility === "catalog_search"}
                    onChange={(v) =>
                      setForm({
                        ...form,
                        visibility: v as "not_visible" | "catalog_search",
                      })
                    }
                    label="Catalog, Search"
                  />
                </div>
              </div>
            </Panel>

            <Panel title="Inventory">
              {isVariable ? (
                <p className="text-sm text-slate-500">
                  Stock is managed per variant in the Product variants section.
                </p>
              ) : (
                <>
                  <div>
                    <label className={`${labelClass} mb-2 block`}>
                      Manage stock
                    </label>
                    <div className="flex flex-col gap-2">
                      <RadioRow
                        name="manage_stock"
                        value="yes"
                        checked={form.manage_stock === "yes"}
                        onChange={(v) =>
                          setForm({
                            ...form,
                            manage_stock: v as "yes" | "no",
                          })
                        }
                        label="Yes"
                      />
                      <RadioRow
                        name="manage_stock"
                        value="no"
                        checked={form.manage_stock === "no"}
                        onChange={(v) =>
                          setForm({
                            ...form,
                            manage_stock: v as "yes" | "no",
                          })
                        }
                        label="No"
                      />
                    </div>
                  </div>
                  {form.manage_stock === "yes" && (
                    <>
                      <div>
                        <label className={`${labelClass} mb-2 block`}>
                          Stock availability
                        </label>
                        <div className="flex flex-col gap-2">
                          <RadioRow
                            name="stock_availability"
                            value="in_stock"
                            checked={form.stock_availability === "in_stock"}
                            onChange={(v) =>
                              setForm({
                                ...form,
                                stock_availability: v as
                                  | "in_stock"
                                  | "out_of_stock",
                              })
                            }
                            label="In stock"
                          />
                          <RadioRow
                            name="stock_availability"
                            value="out_of_stock"
                            checked={form.stock_availability === "out_of_stock"}
                            onChange={(v) =>
                              setForm({
                                ...form,
                                stock_availability: v as
                                  | "in_stock"
                                  | "out_of_stock",
                              })
                            }
                            label="Out of stock"
                          />
                        </div>
                      </div>
                      <div>
                        <RequiredLabel>Quantity</RequiredLabel>
                        <input
                          type="number"
                          min="0"
                          required
                          value={form.quantity}
                          onChange={(e) =>
                            setForm({ ...form, quantity: e.target.value })
                          }
                          className={inputClass}
                        />
                      </div>
                    </>
                  )}
                </>
              )}
            </Panel>

            <Panel title="Shipping">
              <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.free_shipping}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      free_shipping: e.target.checked,
                    })
                  }
                />
                Free shipping on this product
              </label>
              <p className="mt-1 text-xs text-slate-500">
                Orders with only free-shipping products pay $0 delivery. Light
                items without a weight can also qualify for free shipping when
                the order total exceeds the store threshold. Products with a
                weight (laptops, monitors, chairs, etc.) always use the flat
                shipping rate.
              </p>
              <div className="mt-4">
                <RequiredLabel>Weight</RequiredLabel>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.weight}
                    onChange={(e) =>
                      setForm({ ...form, weight: e.target.value })
                    }
                    className={`${inputClass} pr-10`}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                    lb
                  </span>
                </div>
              </div>
            </Panel>

            <Panel title="Attribute group">
              <div>
                <label className={`${labelClass} mb-1.5 block`}>
                  Attribute group
                </label>
                <select className={inputClass} defaultValue="default">
                  <option value="default">Default</option>
                </select>
              </div>
              {colorAttr && (
                <div>
                  <label className={`${labelClass} mb-1.5 block`}>Color</label>
                  <select
                    value={form.color}
                    onChange={(e) =>
                      setForm({ ...form, color: e.target.value })
                    }
                    className={inputClass}
                  >
                    <option value="">Select an option</option>
                    {colorAttr.values.map((v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              {sizeAttr && (
                <div>
                  <label className={`${labelClass} mb-1.5 block`}>Size</label>
                  <select
                    value={form.size}
                    onChange={(e) =>
                      setForm({ ...form, size: e.target.value })
                    }
                    className={inputClass}
                  >
                    <option value="">Select an option</option>
                    {sizeAttr.values.map((v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </Panel>
          </div>
        </div>

        <div className="mt-6 flex gap-3 pb-8">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary-dark disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save product"}
          </button>
          <Link
            href="/admin/products"
            className="px-6 py-2.5 text-sm font-medium border border-slate-200 rounded-lg hover:bg-slate-50"
          >
            Cancel
          </Link>
          {isEdit && (
            <button
              type="button"
              onClick={async () => {
                if (!confirm("Delete this product?")) return;
                setDeleting(true);
                const res = await fetch(`/api/admin/products/${product!.id}`, {
                  method: "DELETE",
                });
                if (res.ok) router.push("/admin/products");
                else setDeleting(false);
              }}
              disabled={deleting}
              className="ml-auto inline-flex items-center gap-1.5 px-4 py-2.5 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50 disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
