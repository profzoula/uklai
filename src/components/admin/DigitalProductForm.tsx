"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  Download,
  HelpCircle,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Link2,
  Image as ImageIcon,
  Trash2,
  ExternalLink,
  Upload,
  FileText,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { slugify } from "@/lib/utils";
import {
  dbPricesToFormFields,
  formFieldsToDbPrices,
  validateFormPrices,
} from "@/lib/product-pricing";
import type { Attribute } from "@/lib/admin-data-types";
import type { Category, Product } from "@/types/database";
import { ProductMediaGallery } from "@/components/admin/ProductMediaGallery";

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

function fileLabelFromUrl(url: string) {
  try {
    const path = new URL(url).pathname;
    const name = path.split("/").pop();
    return name || url;
  } catch {
    return url.split("/").pop() || url;
  }
}

export function DigitalProductForm({ product }: Props) {
  const router = useRouter();
  const isEdit = !!product;
  const slugEdited = useRef(isEdit);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [fileLinkMode, setFileLinkMode] = useState(
    !!product?.digital_file_url
  );

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
    tax_class: product?.tax_class ?? "none",
    description: product?.description ?? "",
    meta_title: product?.meta_title ?? product?.name ?? "",
    meta_description: product?.meta_description ?? "",
    image_url: product?.image_url ?? "",
    gallery_urls: parseArray(product?.gallery_urls).length
      ? parseArray(product?.gallery_urls)
      : [],
    digital_file_url: product?.digital_file_url ?? "",
    status: product?.active === false ? "disabled" : "enabled",
    visibility:
      product?.active === false ? "not_visible" : "catalog_search",
    no_shipping_required: product?.no_shipping_required ?? true,
    weight: product?.weight?.toString() ?? "",
    color: product?.color ?? "",
    size: product?.size ?? "",
    featured: product?.featured ?? false,
  });

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
  }, []);

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

    const { price, compare_at_price } = formFieldsToDbPrices(
      form.regular_price,
      form.sale_price
    );

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
      stock: 9999,
      tax_class: form.tax_class,
      meta_title: form.meta_title.trim() || form.name.trim(),
      meta_description: form.meta_description.trim() || null,
      weight: null,
      no_shipping_required: true,
      color: form.color || null,
      size: form.size || null,
      featured: form.featured,
      active,
      product_type: "digital" as const,
      digital_file_url: form.digital_file_url.trim() || null,
      rating: product?.rating ?? 4.5,
      review_count: product?.review_count ?? 0,
      badge: product?.badge ?? null,
      highlights: product?.highlights ?? [
        "Instant download after purchase",
        "Lifetime access",
      ],
      updated_at: new Date().toISOString(),
    };
  }

  async function persistProduct(
    payload: ReturnType<typeof buildPayload>,
    mode: "insert" | "update"
  ) {
    const supabase = createClient();
    const query =
      mode === "update"
        ? supabase.from("products").update(payload).eq("id", product!.id)
        : supabase.from("products").insert(payload);

    let { error: saveError } = await query;

    if (saveError && /column/i.test(saveError.message)) {
      const {
        highlights,
        gallery_urls,
        sku,
        product_type,
        digital_file_url,
        meta_title,
        meta_description,
        tax_class,
        weight,
        no_shipping_required,
        color,
        size,
        ...legacyPayload
      } = payload;
      const fallback =
        mode === "update"
          ? supabase.from("products").update(legacyPayload).eq("id", product!.id)
          : supabase.from("products").insert(legacyPayload);
      ({ error: saveError } = await fallback);
    }

    return saveError;
  }

  const salePriceError = validateFormPrices(
    form.regular_price,
    form.sale_price
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.digital_file_url.trim()) {
      setError("Please add a download file link for this digital product.");
      setFileLinkMode(true);
      return;
    }

    const priceError = validateFormPrices(
      form.regular_price,
      form.sale_price
    );
    if (priceError) {
      setError(priceError);
      return;
    }

    setLoading(true);
    setError(null);
    const saveError = await persistProduct(
      buildPayload(),
      isEdit ? "update" : "insert"
    );
    if (saveError) {
      setError(saveError.message);
      setLoading(false);
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

  function handleFileInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 100 * 1024 * 1024) {
      alert("File must be 100 MB or smaller. Host it externally and use Add link instead.");
      e.target.value = "";
      return;
    }
    setFileLinkMode(true);
    alert(
      `Selected: ${file.name}\n\nPaste the public URL where this file is hosted (CDN, Google Drive direct link, etc.) in the link field below.`
    );
    e.target.value = "";
  }

  return (
    <div className="max-w-6xl">
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
            <div className="w-9 h-9 rounded-lg bg-sky-100 flex items-center justify-center">
              <Download className="w-5 h-5 text-sky-600" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">
              {isEdit ? "Edit digital product" : "Add digital product"}
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
            form="digital-product-form"
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

      <form id="digital-product-form" onSubmit={handleSubmit}>
        <div className="grid lg:grid-cols-3 gap-5 items-start">
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
                    <p className="mt-1.5 text-xs text-red-600">{salePriceError}</p>
                  )}
                </div>
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
                  <option value="none">None</option>
                  <option value="taxable">Taxable goods</option>
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

            <Panel
              title="Digital product"
              subtitle="Customers will receive an email with a link to download their file after purchase."
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.zip,.mp3,.mp4,.epub,.doc,.docx"
                className="hidden"
                onChange={handleFileInputChange}
              />

              {!fileLinkMode ? (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full min-h-[180px] border-2 border-dashed border-slate-200 rounded-lg flex flex-col items-center justify-center gap-3 hover:border-primary hover:bg-primary-light/20 transition-colors p-6"
                >
                  <Upload className="w-12 h-12 text-slate-400" />
                  <div className="text-center">
                    <p className="text-sm font-medium text-slate-700">
                      Drop file here or click to browse
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      PDF, ZIP, MP3, MP4 and more — up to 100 MB
                    </p>
                  </div>
                </button>
              ) : form.digital_file_url ? (
                <div className="flex items-center gap-3 p-4 border border-slate-200 rounded-lg bg-slate-50">
                  <FileText className="w-10 h-10 text-primary shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {fileLabelFromUrl(form.digital_file_url)}
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                      {form.digital_file_url}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setForm((prev) => ({ ...prev, digital_file_url: "" }))
                    }
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div>
                  <RequiredLabel>Download file URL</RequiredLabel>
                  <input
                    type="url"
                    value={form.digital_file_url}
                    onChange={(e) =>
                      setForm({ ...form, digital_file_url: e.target.value })
                    }
                    placeholder="https://example.com/files/my-product.zip"
                    className={inputClass}
                  />
                </div>
              )}

              <button
                type="button"
                onClick={() => {
                  if (fileLinkMode && !form.digital_file_url) {
                    setFileLinkMode(false);
                  } else {
                    setFileLinkMode(true);
                  }
                }}
                className="text-sm text-primary font-medium hover:underline"
              >
                {fileLinkMode && !form.digital_file_url
                  ? "Upload file instead"
                  : "Add link instead"}
              </button>
            </Panel>

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
                  placeholder="e.g. my-product-name"
                  className={inputClass}
                />
                <p className="text-xs text-slate-500 mt-1">
                  Auto-generated from product name. Only lowercase letters,
                  numbers and hyphens.
                </p>
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

            <Panel title="Shipping">
              <label className="flex items-center gap-2 text-sm text-slate-700 cursor-default">
                <input
                  type="checkbox"
                  checked={form.no_shipping_required}
                  disabled
                  readOnly
                  className="opacity-70"
                />
                No shipping required?
              </label>
              <div>
                <label className={`${labelClass} mb-1.5 block text-slate-400`}>
                  Weight
                </label>
                <div className="relative">
                  <input
                    type="number"
                    disabled
                    value={form.weight}
                    placeholder="—"
                    className={`${inputClass} pr-10 bg-slate-50 text-slate-400 cursor-not-allowed`}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-300">
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
