"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Camera, Loader2, Plus, Trash2 } from "lucide-react";
import { uploadProductImage, resolveImageMime } from "@/lib/upload-product-image";
import {
  dbPricesToFormFields,
  formFieldsToDbPrices,
  validateFormPrices,
} from "@/lib/product-pricing";

export type VariantDraft = {
  key: string;
  sku: string;
  color: string;
  image_url: string;
  regular_price: string;
  sale_price: string;
  stock: string;
};

type Props = {
  productId: string;
  colorOptions?: string[];
  defaultPrice?: string;
};

const inputClass =
  "w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40";

function emptyVariant(defaultPrice = ""): VariantDraft {
  return {
    key: crypto.randomUUID(),
    sku: "",
    color: "",
    image_url: "",
    regular_price: defaultPrice,
    sale_price: "",
    stock: "0",
  };
}

export function ProductVariantsPanel({
  productId,
  colorOptions = [],
  defaultPrice = "",
}: Props) {
  const [variants, setVariants] = useState<VariantDraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const loadVariants = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/products/${productId}/variants`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not load variants.");
        setVariants([]);
        return;
      }
      const rows = (data.variants ?? []) as Array<{
        sku: string | null;
        color: string | null;
        image_url: string | null;
        price: number;
        compare_at_price: number | null;
        stock: number;
      }>;
      setVariants(
        rows.length
          ? rows.map((row) => {
              const prices = dbPricesToFormFields(row.price, row.compare_at_price);
              return {
                key: crypto.randomUUID(),
                sku: row.sku ?? "",
                color: row.color ?? "",
                image_url: row.image_url ?? "",
                regular_price: prices.regular_price,
                sale_price: prices.sale_price,
                stock: String(row.stock ?? 0),
              };
            })
          : [emptyVariant(defaultPrice)]
      );
    } catch {
      setError("Could not load variants.");
    } finally {
      setLoading(false);
    }
  }, [productId, defaultPrice]);

  useEffect(() => {
    loadVariants();
  }, [loadVariants]);

  function updateVariant(key: string, patch: Partial<VariantDraft>) {
    setVariants((prev) =>
      prev.map((row) => (row.key === key ? { ...row, ...patch } : row))
    );
  }

  function addVariant() {
    setVariants((prev) => [...prev, emptyVariant(defaultPrice)]);
  }

  function removeVariant(key: string) {
    setVariants((prev) =>
      prev.length <= 1 ? prev : prev.filter((row) => row.key !== key)
    );
  }

  async function uploadImage(key: string, file: File) {
    if (!file.type.startsWith("image/") && !resolveImageMime(file)) {
      setError("Please choose a JPEG, PNG, WebP, or GIF image.");
      return;
    }
    setUploadingKey(key);
    setError(null);
    try {
      const url = await uploadProductImage(file);
      updateVariant(key, { image_url: url });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploadingKey(null);
    }
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSuccess(null);

    const filledRows = variants.filter(
      (row) =>
        row.color.trim() ||
        row.sku.trim() ||
        row.image_url.trim() ||
        row.regular_price.trim()
    );

    for (let i = 0; i < filledRows.length; i++) {
      const row = filledRows[i];
      const priceError = validateFormPrices(row.regular_price, row.sale_price);
      if (priceError) {
        const label = row.color.trim() || row.sku.trim() || `Variant ${i + 1}`;
        setError(`${label}: ${priceError}`);
        setSaving(false);
        return;
      }
    }

    const payload = filledRows.map((row, index) => {
        const { price, compare_at_price } = formFieldsToDbPrices(
          row.regular_price,
          row.sale_price
        );
        return {
          sku: row.sku.trim() || null,
          color: row.color.trim() || null,
          image_url: row.image_url.trim() || null,
          price,
          compare_at_price,
          stock: parseInt(row.stock, 10) || 0,
          sort_order: index,
        };
      });

    if (
      payload.some(
        (row) => Number.isNaN(row.price) || row.price < 0
      )
    ) {
      setError("Each variant needs a valid regular price.");
      setSaving(false);
      return;
    }

    try {
      const res = await fetch(`/api/admin/products/${productId}/variants`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variants: payload }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not save variants.");
        setSaving(false);
        return;
      }
      setSuccess(
        payload.length
          ? `Saved ${payload.length} variant${payload.length !== 1 ? "s" : ""}.`
          : "Variants cleared."
      );
      await loadVariants();
    } catch {
      setError("Could not save variants.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="bg-white border border-slate-200 rounded-lg shadow-sm">
      <div className="px-5 py-4 border-b border-slate-100 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Product variants</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            SKU, color, photo, price, and stock per variant (WooCommerce-style).
          </p>
        </div>
        <button
          type="button"
          onClick={addVariant}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium border border-slate-200 rounded-lg hover:bg-slate-50"
        >
          <Plus className="w-4 h-4" />
          Add variant
        </button>
      </div>

      <div className="p-5 space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error}
          </div>
        )}
        {success && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-emerald-800">
            {success}
          </div>
        )}

        {loading ? (
          <div className="flex items-center gap-2 text-sm text-slate-500 py-6">
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading variants…
          </div>
        ) : (
          <div className="overflow-x-auto -mx-1">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-slate-500 border-b border-slate-200">
                  <th className="pb-3 pr-3 font-semibold w-[72px]">Photo</th>
                  <th className="pb-3 pr-3 font-semibold min-w-[120px]">Color</th>
                  <th className="pb-3 pr-3 font-semibold min-w-[120px]">SKU</th>
                  <th className="pb-3 pr-3 font-semibold w-[100px]">Regular</th>
                  <th className="pb-3 pr-3 font-semibold w-[100px]">Sale</th>
                  <th className="pb-3 pr-3 font-semibold w-[80px]">Stock</th>
                  <th className="pb-3 font-semibold w-[44px]" aria-label="Actions" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {variants.map((row) => (
                  <tr key={row.key} className="align-middle">
                    <td className="py-3 pr-3">
                      <div className="relative w-14 h-14 rounded-lg border border-slate-200 bg-slate-50 overflow-hidden">
                        {row.image_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={row.image_url}
                            alt={row.color || "Variant"}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300">
                            <Camera className="w-5 h-5" />
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => fileRefs.current[row.key]?.click()}
                          disabled={uploadingKey === row.key}
                          className="absolute inset-0 bg-black/0 hover:bg-black/5 flex items-center justify-center"
                          aria-label="Upload variant image"
                        >
                          {uploadingKey === row.key && (
                            <Loader2 className="w-4 h-4 animate-spin text-primary" />
                          )}
                        </button>
                        <input
                          ref={(el) => {
                            fileRefs.current[row.key] = el;
                          }}
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/gif"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) uploadImage(row.key, file);
                            e.target.value = "";
                          }}
                        />
                      </div>
                    </td>
                    <td className="py-3 pr-3">
                      {colorOptions.length > 0 ? (
                        <select
                          value={row.color}
                          onChange={(e) =>
                            updateVariant(row.key, { color: e.target.value })
                          }
                          className={inputClass}
                        >
                          <option value="">Select color</option>
                          {colorOptions.map((color) => (
                            <option key={color} value={color}>
                              {color}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          value={row.color}
                          onChange={(e) =>
                            updateVariant(row.key, { color: e.target.value })
                          }
                          placeholder="White, Black…"
                          className={inputClass}
                        />
                      )}
                    </td>
                    <td className="py-3 pr-3">
                      <input
                        type="text"
                        value={row.sku}
                        onChange={(e) =>
                          updateVariant(row.key, { sku: e.target.value })
                        }
                        placeholder="SKU-001"
                        className={inputClass}
                      />
                    </td>
                    <td className="py-3 pr-3">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={row.regular_price}
                        onChange={(e) =>
                          updateVariant(row.key, { regular_price: e.target.value })
                        }
                        className={inputClass}
                      />
                    </td>
                    <td className="py-3 pr-3">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={row.sale_price}
                        onChange={(e) =>
                          updateVariant(row.key, {
                            sale_price: e.target.value,
                          })
                        }
                        placeholder="Optional"
                        className={inputClass}
                      />
                    </td>
                    <td className="py-3 pr-3">
                      <input
                        type="number"
                        min="0"
                        value={row.stock}
                        onChange={(e) =>
                          updateVariant(row.key, { stock: e.target.value })
                        }
                        className={inputClass}
                      />
                    </td>
                    <td className="py-3">
                      <button
                        type="button"
                        onClick={() => removeVariant(row.key)}
                        disabled={variants.length <= 1}
                        className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 disabled:opacity-30"
                        aria-label="Remove variant"
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

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <p className="text-xs text-slate-500">
            Save variants separately from the main product form.
          </p>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || loading}
            className="px-4 py-2 bg-slate-900 text-white text-sm font-semibold rounded-lg hover:bg-slate-800 disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save variants"}
          </button>
        </div>
      </div>
    </section>
  );
}
