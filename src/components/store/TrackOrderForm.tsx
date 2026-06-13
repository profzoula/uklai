"use client";

import { useState } from "react";
import Link from "next/link";
import { PackageSearch, Truck } from "lucide-react";
import { formatDate, formatPrice } from "@/lib/utils";

type TrackResult = {
  id: string;
  shortId: string;
  status: string;
  total: number;
  createdAt: string;
  trackingNumber: string | null;
  trackingCarrier: string | null;
  shippingName: string | null;
  shippingCity: string | null;
  shippingState: string | null;
  items: Array<{ product_name: string; quantity: number }>;
  statusSteps: Array<{
    key: string;
    label: string;
    done: boolean;
    active: boolean;
  }>;
};

export function TrackOrderForm() {
  const [orderId, setOrderId] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<TrackResult | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/orders/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, email }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Could not find order.");
      }

      setResult(data.order);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not find order.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto">
      <form
        onSubmit={handleSubmit}
        className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-4"
      >
        <div>
          <label htmlFor="track-order-id" className="block text-sm font-medium text-slate-700 mb-1.5">
            Order number
          </label>
          <input
            id="track-order-id"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            placeholder="e.g. C818B19 or full order ID"
            required
            className="w-full min-h-[44px] px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
        </div>
        <div>
          <label htmlFor="track-email" className="block text-sm font-medium text-slate-700 mb-1.5">
            Email used at checkout
          </label>
          <input
            id="track-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full min-h-[44px] px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full min-h-[48px] bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark disabled:opacity-50"
        >
          {loading ? "Searching..." : "Track order"}
        </button>
      </form>

      {result && (
        <div className="mt-6 bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm text-slate-500">Order #{result.shortId}</p>
              <p className="text-lg font-bold text-slate-900 capitalize">
                {result.status}
              </p>
              <p className="text-sm text-slate-500 mt-1">
                {formatDate(result.createdAt)} · {formatPrice(result.total)}
              </p>
            </div>
            <Link
              href={`/invoice/${result.id}`}
              className="text-sm font-semibold text-primary hover:text-primary-dark"
            >
              View invoice
            </Link>
          </div>

          {result.trackingNumber && (
            <div className="flex items-start gap-3 rounded-lg bg-slate-50 border border-slate-200 p-4">
              <Truck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-slate-900">Tracking</p>
                <p className="text-sm text-slate-600">
                  {result.trackingCarrier ?? "Carrier"}: {result.trackingNumber}
                </p>
              </div>
            </div>
          )}

          <div>
            <p className="text-sm font-semibold text-slate-900 mb-3">Progress</p>
            <ol className="space-y-2">
              {result.statusSteps.map((step) => (
                <li
                  key={step.key}
                  className={`flex items-center gap-2 text-sm capitalize ${
                    step.done ? "text-slate-900" : "text-slate-400"
                  }`}
                >
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      step.active
                        ? "bg-primary"
                        : step.done
                          ? "bg-green-500"
                          : "bg-slate-300"
                    }`}
                  />
                  {step.label}
                </li>
              ))}
            </ol>
          </div>

          {result.items.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-slate-900 mb-2">Items</p>
              <ul className="text-sm text-slate-600 space-y-1">
                {result.items.map((item, i) => (
                  <li key={`${item.product_name}-${i}`}>
                    {item.product_name} × {item.quantity}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {(result.shippingName || result.shippingCity) && (
            <div className="flex items-start gap-3 text-sm text-slate-600">
              <PackageSearch className="w-5 h-5 text-slate-400 shrink-0" />
              <span>
                Ship to {result.shippingName}
                {result.shippingCity ? `, ${result.shippingCity}` : ""}
                {result.shippingState ? ` ${result.shippingState}` : ""}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
