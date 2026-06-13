"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin } from "lucide-react";
import type { SavedShippingAddress } from "@/types/database";
import { US_STATES } from "@/lib/store-settings-types";

type Props = {
  initial: SavedShippingAddress;
  savedOnProfile: boolean;
};

const inputClass =
  "w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary min-h-[44px]";

const labelClass = "block text-sm font-medium text-slate-700 mb-1.5";

export function ShippingAddressForm({ initial, savedOnProfile }: Props) {
  const router = useRouter();
  const [form, setForm] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  function updateField<K extends keyof SavedShippingAddress>(
    key: K,
    value: SavedShippingAddress[K]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSuccess(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const res = await fetch("/api/account/address", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Could not save address.");
      }

      if (data.address) {
        setForm({
          shipping_name: data.address.shipping_name ?? "",
          shipping_address: data.address.shipping_address ?? "",
          shipping_city: data.address.shipping_city ?? "",
          shipping_state: data.address.shipping_state ?? "",
          shipping_zip: data.address.shipping_zip ?? "",
          shipping_country: data.address.shipping_country ?? "US",
        });
      }

      setSuccess(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save address.");
    } finally {
      setLoading(false);
    }
  }

  const hasDisplayAddress =
    savedOnProfile &&
    form.shipping_name &&
    form.shipping_address &&
    form.shipping_city;

  return (
    <div className="max-w-xl space-y-6">
      {hasDisplayAddress && (
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-slate-900">
                Saved address
              </p>
              <address className="not-italic text-sm text-slate-600 mt-1 leading-relaxed">
                <span className="block">{form.shipping_name}</span>
                <span className="block">{form.shipping_address}</span>
                <span className="block">
                  {form.shipping_city}, {form.shipping_state}{" "}
                  {form.shipping_zip}
                </span>
                <span className="block">
                  {form.shipping_country === "US"
                    ? "United States"
                    : form.shipping_country}
                </span>
              </address>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-sm text-slate-600">
          {savedOnProfile
            ? "Update your default shipping address below."
            : "Add your shipping address for faster checkout."}
        </p>

        <div>
          <label htmlFor="shipping_name" className={labelClass}>
            Full name
          </label>
          <input
            id="shipping_name"
            type="text"
            autoComplete="name"
            required
            value={form.shipping_name}
            onChange={(e) => updateField("shipping_name", e.target.value)}
            className={inputClass}
            placeholder="John Smith"
          />
        </div>

        <div>
          <label htmlFor="shipping_address" className={labelClass}>
            Street address
          </label>
          <input
            id="shipping_address"
            type="text"
            autoComplete="street-address"
            required
            value={form.shipping_address}
            onChange={(e) => updateField("shipping_address", e.target.value)}
            className={inputClass}
            placeholder="123 Main St, Apt 4"
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="shipping_city" className={labelClass}>
              City
            </label>
            <input
              id="shipping_city"
              type="text"
              autoComplete="address-level2"
              required
              value={form.shipping_city}
              onChange={(e) => updateField("shipping_city", e.target.value)}
              className={inputClass}
              placeholder="Miami"
            />
          </div>
          <div>
            <label htmlFor="shipping_state" className={labelClass}>
              State
            </label>
            <select
              id="shipping_state"
              required
              value={form.shipping_state}
              onChange={(e) => updateField("shipping_state", e.target.value)}
              className={inputClass}
            >
              <option value="">Select state</option>
              {US_STATES.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="shipping_zip" className={labelClass}>
              ZIP code
            </label>
            <input
              id="shipping_zip"
              type="text"
              autoComplete="postal-code"
              required
              value={form.shipping_zip}
              onChange={(e) => updateField("shipping_zip", e.target.value)}
              className={inputClass}
              placeholder="33101"
            />
          </div>
          <div>
            <label htmlFor="shipping_country" className={labelClass}>
              Country
            </label>
            <select
              id="shipping_country"
              value={form.shipping_country}
              onChange={(e) => updateField("shipping_country", e.target.value)}
              className={inputClass}
            >
              <option value="US">United States</option>
            </select>
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
            {error}
          </p>
        )}

        {success && (
          <p className="text-sm text-green-700 bg-green-50 px-3 py-2 rounded-lg">
            Address saved successfully.
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="inline-flex min-h-[48px] items-center justify-center bg-primary text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50"
        >
          {loading ? "Saving..." : savedOnProfile ? "Update address" : "Save address"}
        </button>
      </form>
    </div>
  );
}
