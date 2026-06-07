"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Order, OrderStatus } from "@/types/database";
import { formatPrice, formatDate } from "@/lib/utils";
import Link from "next/link";
import { ChevronLeft, Truck, RefreshCw } from "lucide-react";

const statuses: OrderStatus[] = [
  "pending",
  "paid",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
];

type Props = {
  order: Order;
};

export function OrderDetailPanel({ order }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState(order.status);
  const [trackingNumber, setTrackingNumber] = useState(
    order.tracking_number ?? ""
  );
  const [trackingCarrier, setTrackingCarrier] = useState(
    order.tracking_carrier ?? "USPS"
  );
  const [adminNotes, setAdminNotes] = useState(order.admin_notes ?? "");
  const [refundAmount, setRefundAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const maxRefund =
    Number(order.total) - Number(order.refunded_amount ?? 0);

  async function saveOrder(extra?: Record<string, unknown>) {
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const res = await fetch(`/api/admin/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          tracking_number: trackingNumber,
          tracking_carrier: trackingCarrier,
          admin_notes: adminNotes,
          ...extra,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to save");
      }

      setMessage("Order updated.");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setLoading(false);
    }
  }

  async function handleRefund() {
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const res = await fetch(`/api/admin/orders/${order.id}/refund`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: refundAmount ? Number(refundAmount) : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Refund failed");
      setMessage(`Refund processed. Total refunded: $${data.refunded_amount.toFixed(2)}`);
      setStatus(data.status);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Refund failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <Link
        href="/admin/orders"
        className="inline-flex items-center gap-1 text-sm text-primary hover:text-primary-dark"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to orders
      </Link>

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Order #{order.id.slice(0, 8).toUpperCase()}
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Placed {formatDate(order.created_at)}
          </p>
        </div>
        <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-slate-100 capitalize">
          {status}
        </span>
      </header>

      {(message || error) && (
        <div
          className={`rounded-xl px-4 py-3 text-sm ${
            error
              ? "bg-red-50 text-red-700 border border-red-200"
              : "bg-green-50 text-green-700 border border-green-200"
          }`}
        >
          {error ?? message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-white rounded-2xl border border-slate-200 p-6">
            <h2 className="font-bold text-slate-900 mb-4">Items</h2>
            <ul className="divide-y divide-slate-100">
              {(order.order_items ?? []).map((item) => (
                <li key={item.id} className="py-4 flex gap-4">
                  {item.product_image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.product_image}
                      alt=""
                      className="w-16 h-16 rounded-lg object-cover border border-slate-100"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900">{item.product_name}</p>
                    <p className="text-sm text-slate-500">
                      Qty {item.quantity} · {formatPrice(item.price)} each
                      {item.product_type === "digital" && (
                        <span className="ml-2 text-primary">Digital</span>
                      )}
                    </p>
                    {item.digital_file_url && (
                      <a
                        href={item.digital_file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline mt-1 inline-block"
                      >
                        Download file
                      </a>
                    )}
                  </div>
                  <p className="font-semibold text-sm">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </li>
              ))}
            </ul>
          </section>

          <section className="bg-white rounded-2xl border border-slate-200 p-6">
            <h2 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Truck className="w-4 h-4" />
              Shipping &amp; tracking
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">
                  Carrier
                </label>
                <select
                  value={trackingCarrier}
                  onChange={(e) => setTrackingCarrier(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                >
                  {["USPS", "UPS", "FedEx", "DHL", "Other"].map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">
                  Tracking number
                </label>
                <input
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                  placeholder="9400..."
                />
              </div>
            </div>
            {order.shipping_name && (
              <p className="text-sm text-slate-600 mt-4">
                Ship to: {order.shipping_name}
                {order.shipping_address && `, ${order.shipping_address}`}
                {order.shipping_city && `, ${order.shipping_city}`}
                {order.shipping_state && ` ${order.shipping_state}`}
                {order.shipping_zip && ` ${order.shipping_zip}`}
              </p>
            )}
          </section>
        </div>

        <div className="space-y-6">
          <section className="bg-white rounded-2xl border border-slate-200 p-6">
            <h2 className="font-bold text-slate-900 mb-4">Summary</h2>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-500">Customer</dt>
                <dd>{order.customer_email ?? "Guest"}</dd>
              </div>
              {order.subtotal != null && (
                <div className="flex justify-between">
                  <dt className="text-slate-500">Subtotal</dt>
                  <dd>{formatPrice(order.subtotal)}</dd>
                </div>
              )}
              {order.discount_amount != null && order.discount_amount > 0 && (
                <div className="flex justify-between text-green-600">
                  <dt>Discount {order.coupon_code && `(${order.coupon_code})`}</dt>
                  <dd>-{formatPrice(order.discount_amount)}</dd>
                </div>
              )}
              {order.tax_amount != null && order.tax_amount > 0 && (
                <div className="flex justify-between text-sm text-slate-600">
                  <dt>Tax</dt>
                  <dd>{formatPrice(order.tax_amount)}</dd>
                </div>
              )}
              <div className="flex justify-between font-bold pt-2 border-t">
                <dt>Total</dt>
                <dd>{formatPrice(order.total)}</dd>
              </div>
              {Number(order.refunded_amount ?? 0) > 0 && (
                <div className="flex justify-between text-red-600">
                  <dt>Refunded</dt>
                  <dd>{formatPrice(order.refunded_amount!)}</dd>
                </div>
              )}
            </dl>
          </section>

          <section className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
            <h2 className="font-bold text-slate-900">Status</h2>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as OrderStatus)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm capitalize"
            >
              {statuses.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1">
                Admin notes
              </label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
              />
            </div>
            <button
              type="button"
              disabled={loading}
              onClick={() => saveOrder()}
              className="w-full bg-primary text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-primary-dark disabled:opacity-50"
            >
              Save changes
            </button>
          </section>

          {order.stripe_payment_intent_id && maxRefund > 0 && status !== "refunded" && (
            <section className="bg-white rounded-2xl border border-slate-200 p-6 space-y-3">
              <h2 className="font-bold text-slate-900 flex items-center gap-2">
                <RefreshCw className="w-4 h-4" />
                Refund
              </h2>
              <p className="text-xs text-slate-500">
                Max refundable: {formatPrice(maxRefund)}
              </p>
              <input
                type="number"
                step="0.01"
                min="0.01"
                max={maxRefund}
                value={refundAmount}
                onChange={(e) => setRefundAmount(e.target.value)}
                placeholder={`Full refund (${maxRefund.toFixed(2)})`}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
              />
              <button
                type="button"
                disabled={loading}
                onClick={handleRefund}
                className="w-full border border-red-200 text-red-600 py-2.5 rounded-xl text-sm font-semibold hover:bg-red-50 disabled:opacity-50"
              >
                Process refund
              </button>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
