"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, HelpCircle, Calendar, Plus, Trash2 } from "lucide-react";
import type {
  Coupon,
  CouponDiscountSubtype,
  CouponProductCondition,
  CouponRules,
} from "@/lib/admin-data-types";

type Props = { coupon?: Coupon };

type ProductOption = { id: string; name: string; sku?: string | null };

const inputClass =
  "w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40";
const labelClass = "text-sm font-medium text-slate-700";

const DISCOUNT_TYPES: { value: CouponDiscountSubtype; label: string }[] = [
  { value: "order_fixed", label: "Fixed discount to entire order" },
  { value: "order_percentage", label: "Percentage discount to entire order" },
  { value: "product_fixed", label: "Fixed discount to specific products" },
  {
    value: "product_percentage",
    label: "Percentage discount to specific products",
  },
  { value: "buy_x_get_y", label: "Buy X get Y" },
];

const CUSTOMER_GROUPS = [
  { value: "all", label: "All customer groups" },
  { value: "registered", label: "Registered customers" },
  { value: "new", label: "New customers" },
  { value: "vip", label: "VIP customers" },
];

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

function parseRules(rules?: CouponRules) {
  return {
    free_shipping: rules?.free_shipping ?? false,
    discount_subtype: rules?.discount_subtype ?? "order_percentage",
    min_purchase_amount: rules?.min_purchase_amount?.toString() ?? "0",
    min_purchase_qty: rules?.min_purchase_qty?.toString() ?? "0",
    product_conditions: rules?.product_conditions ?? [],
    customer_group: rules?.customer_group ?? "all",
    customer_emails: (rules?.customer_emails ?? []).join(", "),
    min_customer_orders: rules?.min_customer_orders?.toString() ?? "0",
  };
}

function subtypeToType(subtype: CouponDiscountSubtype): Coupon["type"] {
  if (subtype === "order_fixed" || subtype === "product_fixed") return "fixed";
  return "percentage";
}

export function CouponForm({ coupon }: Props) {
  const router = useRouter();
  const isEdit = !!coupon;
  const parsed = parseRules(coupon?.rules);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<ProductOption[]>([]);

  const [form, setForm] = useState({
    code: coupon?.code ?? "",
    description: coupon?.description ?? "",
    status: coupon?.active === false ? "disabled" : "enabled",
    value: coupon?.value?.toString() ?? "",
    starts_at: coupon?.starts_at?.slice(0, 10) ?? "",
    expires_at: coupon?.expires_at?.slice(0, 10) ?? "",
    free_shipping: parsed.free_shipping,
    discount_subtype: parsed.discount_subtype as CouponDiscountSubtype,
    min_purchase_amount: parsed.min_purchase_amount,
    min_purchase_qty: parsed.min_purchase_qty,
    product_conditions: parsed.product_conditions as CouponProductCondition[],
    customer_group: parsed.customer_group,
    customer_emails: parsed.customer_emails,
    min_customer_orders: parsed.min_customer_orders,
  });

  useEffect(() => {
    fetch("/api/admin/products")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setProducts(data);
      })
      .catch(() => {});
  }, []);

  function buildPayload() {
    const rules: CouponRules = {
      free_shipping: form.free_shipping,
      discount_subtype: form.discount_subtype,
      min_purchase_amount: parseFloat(form.min_purchase_amount) || 0,
      min_purchase_qty: parseInt(form.min_purchase_qty) || 0,
      product_conditions: form.product_conditions,
      customer_group: form.customer_group,
      customer_emails: form.customer_emails
        .split(/[,;\s]+/)
        .map((e) => e.trim())
        .filter(Boolean),
      min_customer_orders: parseInt(form.min_customer_orders) || 0,
    };

    return {
      code: form.code.trim().toUpperCase(),
      description: form.description.trim(),
      type: subtypeToType(form.discount_subtype),
      value: parseFloat(form.value),
      active: form.status === "enabled",
      starts_at: form.starts_at ? `${form.starts_at}T00:00:00.000Z` : null,
      expires_at: form.expires_at ? `${form.expires_at}T23:59:59.000Z` : null,
      rules,
      ...(isEdit ? {} : { usage_count: 0, usage_limit: null }),
    };
  }

  async function persistCoupon(
    payload: ReturnType<typeof buildPayload>,
    mode: "insert" | "update"
  ) {
    const url =
      mode === "update"
        ? `/api/admin/coupons/${coupon!.id}`
        : "/api/admin/coupons";
    const res = await fetch(url, {
      method: mode === "update" ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { message: data.error ?? "Failed to save coupon." } as {
        message: string;
      };
    }
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const saveError = await persistCoupon(
      buildPayload(),
      isEdit ? "update" : "insert"
    );

    if (saveError) {
      setError(saveError.message);
      setLoading(false);
      return;
    }

    router.push("/admin/coupons");
    router.refresh();
  }

  function addProductCondition() {
    const first = products[0];
    if (!first) {
      alert("No products available. Create a product first.");
      return;
    }
    setForm((prev) => ({
      ...prev,
      product_conditions: [
        ...prev.product_conditions,
        {
          productId: first.id,
          productName: first.name,
          operator: "is",
          value: first.sku || first.name,
          minQty: 1,
        },
      ],
    }));
  }

  function updateProductCondition(
    index: number,
    patch: Partial<CouponProductCondition>
  ) {
    setForm((prev) => ({
      ...prev,
      product_conditions: prev.product_conditions.map((row, i) =>
        i === index ? { ...row, ...patch } : row
      ),
    }));
  }

  function removeProductCondition(index: number) {
    setForm((prev) => ({
      ...prev,
      product_conditions: prev.product_conditions.filter((_, i) => i !== index),
    }));
  }

  function onProductSelect(index: number, productId: string) {
    const product = products.find((p) => p.id === productId);
    if (!product) return;
    updateProductCondition(index, {
      productId: product.id,
      productName: product.name,
      value: product.sku || product.name,
    });
  }

  const showProductConditions =
    form.discount_subtype === "product_fixed" ||
    form.discount_subtype === "product_percentage" ||
    form.discount_subtype === "buy_x_get_y";

  return (
    <div className="max-w-5xl pb-10">
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/admin/coupons"
          className="inline-flex items-center gap-1 text-sm text-primary hover:text-primary-dark font-medium"
        >
          <ChevronLeft className="w-4 h-4" />
        </Link>
        <h1 className="text-xl font-bold text-slate-900">
          {isEdit ? "Edit coupon" : "Create a new coupon"}
        </h1>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <Panel title="General information">
          <div>
            <RequiredLabel>Coupon code</RequiredLabel>
            <input
              type="text"
              required
              value={form.code}
              onChange={(e) =>
                setForm({ ...form, code: e.target.value.toUpperCase() })
              }
              className={`${inputClass} font-mono uppercase`}
              placeholder="SAVE10"
            />
          </div>

          <div>
            <RequiredLabel>Description</RequiredLabel>
            <textarea
              required
              rows={3}
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              className={inputClass}
              placeholder="Describe this promotion for your team..."
            />
          </div>

          <div>
            <RequiredLabel>Status</RequiredLabel>
            <div className="flex gap-6">
              <RadioRow
                name="status"
                value="enabled"
                checked={form.status === "enabled"}
                onChange={(v) =>
                  setForm({ ...form, status: v as "enabled" | "disabled" })
                }
                label="Enabled"
              />
              <RadioRow
                name="status"
                value="disabled"
                checked={form.status === "disabled"}
                onChange={(v) =>
                  setForm({ ...form, status: v as "enabled" | "disabled" })
                }
                label="Disabled"
              />
            </div>
          </div>

          <div>
            <RequiredLabel>Discount amount</RequiredLabel>
            <input
              type="number"
              step="0.01"
              min="0"
              required
              value={form.value}
              onChange={(e) => setForm({ ...form, value: e.target.value })}
              className={inputClass}
              placeholder={
                form.discount_subtype.includes("percentage") ||
                form.discount_subtype === "buy_x_get_y"
                  ? "10"
                  : "15.00"
              }
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className={`${labelClass} mb-1.5 block`}>Start date</label>
              <div className="relative">
                <input
                  type="date"
                  value={form.starts_at}
                  onChange={(e) =>
                    setForm({ ...form, starts_at: e.target.value })
                  }
                  className={inputClass}
                />
                <Calendar className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className={`${labelClass} mb-1.5 block`}>End date</label>
              <div className="relative">
                <input
                  type="date"
                  value={form.expires_at}
                  onChange={(e) =>
                    setForm({ ...form, expires_at: e.target.value })
                  }
                  className={inputClass}
                />
                <Calendar className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={form.free_shipping}
              onChange={(e) =>
                setForm({ ...form, free_shipping: e.target.checked })
              }
            />
            Free shipping?
          </label>
        </Panel>

        <Panel title="Discount type">
          <div className="space-y-2">
            {DISCOUNT_TYPES.map((opt) => (
              <RadioRow
                key={opt.value}
                name="discount_subtype"
                value={opt.value}
                checked={form.discount_subtype === opt.value}
                onChange={(v) =>
                  setForm({
                    ...form,
                    discount_subtype: v as CouponDiscountSubtype,
                  })
                }
                label={opt.label}
              />
            ))}
          </div>
        </Panel>

        <div className="grid lg:grid-cols-2 gap-5">
          <Panel
            title="Order conditions"
            subtitle="Conditions the cart must meet for this coupon to apply."
          >
            <div>
              <label
                className={`${labelClass} mb-1.5 inline-flex items-center gap-1`}
              >
                Minimum purchase amount
                <HelpCircle
                  className="w-3.5 h-3.5 text-slate-400"
                  aria-label="Minimum order subtotal required"
                />
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.min_purchase_amount}
                onChange={(e) =>
                  setForm({ ...form, min_purchase_amount: e.target.value })
                }
                className={inputClass}
              />
            </div>

            <div>
              <label
                className={`${labelClass} mb-1.5 inline-flex items-center gap-1`}
              >
                Minimum purchase qty
                <HelpCircle
                  className="w-3.5 h-3.5 text-slate-400"
                  aria-label="Minimum total item quantity in cart"
                />
              </label>
              <input
                type="number"
                min="0"
                value={form.min_purchase_qty}
                onChange={(e) =>
                  setForm({ ...form, min_purchase_qty: e.target.value })
                }
                className={inputClass}
              />
            </div>

            {showProductConditions && (
              <div>
                <p className="text-xs text-slate-600 mb-3">
                  Order must contain products matched below conditions (All)
                </p>
                {form.product_conditions.length > 0 && (
                  <div className="overflow-x-auto border border-slate-200 rounded-lg mb-3">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50 text-slate-600">
                        <tr>
                          <th className="text-left px-3 py-2 font-medium">
                            Key
                          </th>
                          <th className="text-left px-3 py-2 font-medium">
                            Operator
                          </th>
                          <th className="text-left px-3 py-2 font-medium">
                            Value
                          </th>
                          <th className="text-left px-3 py-2 font-medium">
                            Min qty
                          </th>
                          <th className="w-10" />
                        </tr>
                      </thead>
                      <tbody>
                        {form.product_conditions.map((row, index) => (
                          <tr
                            key={index}
                            className="border-t border-slate-100"
                          >
                            <td className="px-3 py-2">
                              <select
                                value={row.productId}
                                onChange={(e) =>
                                  onProductSelect(index, e.target.value)
                                }
                                className="w-full min-w-[120px] px-2 py-1 border border-slate-200 rounded text-sm"
                              >
                                {products.map((p) => (
                                  <option key={p.id} value={p.id}>
                                    {p.name}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td className="px-3 py-2">
                              <select
                                value={row.operator}
                                onChange={(e) =>
                                  updateProductCondition(index, {
                                    operator: e.target.value,
                                  })
                                }
                                className="w-full px-2 py-1 border border-slate-200 rounded text-sm"
                              >
                                <option value="is">is</option>
                                <option value="is_not">is not</option>
                              </select>
                            </td>
                            <td className="px-3 py-2">
                              <input
                                type="text"
                                value={row.value}
                                onChange={(e) =>
                                  updateProductCondition(index, {
                                    value: e.target.value,
                                  })
                                }
                                className="w-full min-w-[80px] px-2 py-1 border border-slate-200 rounded text-sm"
                              />
                            </td>
                            <td className="px-3 py-2">
                              <input
                                type="number"
                                min="1"
                                value={row.minQty}
                                onChange={(e) =>
                                  updateProductCondition(index, {
                                    minQty: parseInt(e.target.value) || 1,
                                  })
                                }
                                className="w-16 px-2 py-1 border border-slate-200 rounded text-sm"
                              />
                            </td>
                            <td className="px-2 py-2">
                              <button
                                type="button"
                                onClick={() => removeProductCondition(index)}
                                className="p-1 text-red-500 hover:bg-red-50 rounded"
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
                <button
                  type="button"
                  onClick={addProductCondition}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-primary border border-primary/30 rounded-lg hover:bg-primary-light/30"
                >
                  <Plus className="w-4 h-4" />
                  Add product
                </button>
              </div>
            )}
          </Panel>

          <Panel title="Customer conditions">
            <div>
              <label className={`${labelClass} mb-1.5 block`}>
                Customer groups
              </label>
              <select
                value={form.customer_group}
                onChange={(e) =>
                  setForm({ ...form, customer_group: e.target.value })
                }
                className={inputClass}
              >
                {CUSTOMER_GROUPS.map((g) => (
                  <option key={g.value} value={g.value}>
                    {g.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={`${labelClass} mb-1.5 block`}>
                Customer emails
              </label>
              <input
                type="text"
                value={form.customer_emails}
                onChange={(e) =>
                  setForm({ ...form, customer_emails: e.target.value })
                }
                placeholder="email@example.com, another@example.com"
                className={inputClass}
              />
              <p className="text-xs text-slate-500 mt-1">
                Leave empty to allow any customer. Separate multiple emails with
                commas.
              </p>
            </div>

            <div>
              <label
                className={`${labelClass} mb-1.5 inline-flex items-center gap-1`}
              >
                Customer&apos;s purchase
                <HelpCircle
                  className="w-3.5 h-3.5 text-slate-400"
                  aria-label="Minimum number of completed orders by the customer"
                />
              </label>
              <input
                type="number"
                min="0"
                value={form.min_customer_orders}
                onChange={(e) =>
                  setForm({ ...form, min_customer_orders: e.target.value })
                }
                className={inputClass}
              />
            </div>
          </Panel>
        </div>

        <div className="flex items-center justify-between pt-2">
          <Link
            href="/admin/coupons"
            className="px-6 py-2.5 text-sm font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-2.5 bg-emerald-700 text-white text-sm font-semibold rounded-lg hover:bg-emerald-800 disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}
