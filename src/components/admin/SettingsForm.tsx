"use client";

import { useState } from "react";
import {
  Settings,
  CreditCard,
  Truck,
  Receipt,
  Bell,
  HelpCircle,
} from "lucide-react";
import type { AllStoreSettings } from "@/lib/store-settings-types";
import { US_STATES, COUNTRIES } from "@/lib/store-settings-types";

type Props = {
  initialSettings: AllStoreSettings;
};

type SettingsTab = "store" | "payment" | "shipping" | "tax" | "notifications";

const TABS: {
  id: SettingsTab;
  label: string;
  description: string;
  icon: typeof Settings;
}[] = [
  {
    id: "store",
    label: "Store setting",
    description: "Configure your store information.",
    icon: Settings,
  },
  {
    id: "payment",
    label: "Payment setting",
    description: "Configure the available payment methods.",
    icon: CreditCard,
  },
  {
    id: "shipping",
    label: "Shipping setting",
    description: "Where you ship, shipping methods and rates.",
    icon: Truck,
  },
  {
    id: "tax",
    label: "Tax setting",
    description: "Configure tax classes and tax rates.",
    icon: Receipt,
  },
  {
    id: "notifications",
    label: "Notifications",
    description: "Email & SMS notification preferences.",
    icon: Bell,
  },
];

const inputClass =
  "w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40";
const labelClass = "text-sm font-medium text-slate-700";

function RequiredLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className={`${labelClass} mb-1.5 inline-flex items-center gap-1`}>
      {children}
      <span className="text-red-500">*</span>
    </label>
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

export function SettingsForm({ initialSettings }: Props) {
  const [activeTab, setActiveTab] = useState<SettingsTab>("store");
  const [settings, setSettings] = useState<AllStoreSettings>(initialSettings);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function updateStore(patch: Partial<AllStoreSettings["store"]>) {
    setSettings((prev) => ({ ...prev, store: { ...prev.store, ...patch } }));
    setSaved(false);
  }

  function updatePayment(patch: Partial<AllStoreSettings["payment"]>) {
    setSettings((prev) => ({
      ...prev,
      payment: { ...prev.payment, ...patch },
    }));
    setSaved(false);
  }

  function updateShipping(patch: Partial<AllStoreSettings["shipping"]>) {
    setSettings((prev) => ({
      ...prev,
      shipping: { ...prev.shipping, ...patch },
    }));
    setSaved(false);
  }

  function updateTax(patch: Partial<AllStoreSettings["tax"]>) {
    setSettings((prev) => ({ ...prev, tax: { ...prev.tax, ...patch } }));
    setSaved(false);
  }

  function updateNotifications(
    patch: Partial<AllStoreSettings["notifications"]>
  ) {
    setSettings((prev) => ({
      ...prev,
      notifications: { ...prev.notifications, ...patch },
    }));
    setSaved(false);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSaved(false);

    const res = await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      setError(data.error ?? "Failed to save settings.");
      setLoading(false);
      return;
    }

    setSettings(data);
    setSaved(true);
    setLoading(false);
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-500 mt-1">
          Configure your store, payments, shipping, tax and notifications
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}
      {saved && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
          Settings saved successfully.
        </div>
      )}

      <div className="grid lg:grid-cols-[240px_1fr] gap-5 items-start">
        <nav className="space-y-2">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`w-full text-left p-4 rounded-lg border transition-colors ${
                  active
                    ? "bg-white border-slate-300 shadow-sm"
                    : "bg-slate-50 border-slate-200 hover:bg-white hover:border-slate-300"
                }`}
              >
                <div className="flex items-start gap-3">
                  <Icon
                    className={`w-5 h-5 shrink-0 mt-0.5 ${
                      active ? "text-primary" : "text-slate-400"
                    }`}
                  />
                  <div>
                    <p
                      className={`text-xs font-bold uppercase tracking-wide ${
                        active ? "text-slate-900" : "text-slate-600"
                      }`}
                    >
                      {tab.label}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                      {tab.description}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </nav>

        <form onSubmit={handleSave}>
          {activeTab === "store" && (
            <Panel
              title="Store settings"
              subtitle="Configure your store information."
            >
              <div>
                <RequiredLabel>Store name</RequiredLabel>
                <input
                  type="text"
                  required
                  value={settings.store.name}
                  onChange={(e) => updateStore({ name: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <RequiredLabel>Store description</RequiredLabel>
                <textarea
                  required
                  rows={3}
                  value={settings.store.description}
                  onChange={(e) =>
                    updateStore({ description: e.target.value })
                  }
                  className={inputClass}
                />
              </div>

              <div className="pt-2">
                <h3 className="text-sm font-semibold text-slate-900 mb-3">
                  Contact information
                </h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className={`${labelClass} mb-1.5 block`}>
                      Store phone number
                    </label>
                    <input
                      type="tel"
                      value={settings.store.phone}
                      onChange={(e) => updateStore({ phone: e.target.value })}
                      className={inputClass}
                      placeholder="(555) 123-4567"
                    />
                  </div>
                  <div>
                    <label className={`${labelClass} mb-1.5 block`}>
                      Store email
                    </label>
                    <input
                      type="email"
                      value={settings.store.email}
                      onChange={(e) => updateStore({ email: e.target.value })}
                      className={inputClass}
                      placeholder="support@briclix.com"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <h3 className="text-sm font-semibold text-slate-900 mb-3">
                  Address
                </h3>
                <div className="space-y-4">
                  <div>
                    <RequiredLabel>Country</RequiredLabel>
                    <select
                      required
                      value={settings.store.country}
                      onChange={(e) =>
                        updateStore({ country: e.target.value })
                      }
                      className={inputClass}
                    >
                      {COUNTRIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={`${labelClass} mb-1.5 block`}>
                      Address
                    </label>
                    <input
                      type="text"
                      value={settings.store.address}
                      onChange={(e) =>
                        updateStore({ address: e.target.value })
                      }
                      className={inputClass}
                    />
                  </div>
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div>
                      <label className={`${labelClass} mb-1.5 block`}>
                        City
                      </label>
                      <input
                        type="text"
                        value={settings.store.city}
                        onChange={(e) => updateStore({ city: e.target.value })}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <RequiredLabel>Province</RequiredLabel>
                      <select
                        required
                        value={settings.store.province}
                        onChange={(e) =>
                          updateStore({ province: e.target.value })
                        }
                        className={inputClass}
                      >
                        {US_STATES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={`${labelClass} mb-1.5 block`}>
                        Postal code
                      </label>
                      <input
                        type="text"
                        value={settings.store.postal_code}
                        onChange={(e) =>
                          updateStore({ postal_code: e.target.value })
                        }
                        className={inputClass}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Panel>
          )}

          {activeTab === "payment" && (
            <Panel
              title="Payment settings"
              subtitle="Configure the available payment methods."
            >
              <div>
                <RequiredLabel>Currency</RequiredLabel>
                <select
                  value={settings.payment.currency}
                  onChange={(e) =>
                    updatePayment({ currency: e.target.value })
                  }
                  className={inputClass}
                >
                  <option value="USD">USD — US Dollar</option>
                  <option value="CAD">CAD — Canadian Dollar</option>
                  <option value="EUR">EUR — Euro</option>
                  <option value="HTG">HTG — Haitian Gourde</option>
                </select>
              </div>

              <div className="space-y-3 pt-2">
                <label className="flex items-start gap-3 p-4 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
                  <input
                    type="checkbox"
                    checked={settings.payment.stripe_enabled}
                    onChange={(e) =>
                      updatePayment({ stripe_enabled: e.target.checked })
                    }
                    className="mt-0.5"
                  />
                  <div>
                    <p className="text-sm font-medium text-slate-900">Stripe</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Credit & debit cards. API keys are configured in{" "}
                      <code className="text-xs bg-slate-100 px-1 rounded">
                        .env.local
                      </code>
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-4 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
                  <input
                    type="checkbox"
                    checked={settings.payment.paypal_enabled}
                    onChange={(e) =>
                      updatePayment({ paypal_enabled: e.target.checked })
                    }
                    className="mt-0.5"
                  />
                  <div>
                    <p className="text-sm font-medium text-slate-900">PayPal</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Accept PayPal checkout (requires PayPal integration)
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-4 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
                  <input
                    type="checkbox"
                    checked={settings.payment.cod_enabled}
                    onChange={(e) =>
                      updatePayment({ cod_enabled: e.target.checked })
                    }
                    className="mt-0.5"
                  />
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      Cash on delivery
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Allow customers to pay when the order is delivered
                    </p>
                  </div>
                </label>
              </div>
            </Panel>
          )}

          {activeTab === "shipping" && (
            <Panel
              title="Shipping settings"
              subtitle="Where you ship, shipping methods and rates."
            >
              <div>
                <label className={`${labelClass} mb-1.5 block`}>
                  Origin country
                </label>
                <select
                  value={settings.shipping.origin_country}
                  onChange={(e) =>
                    updateShipping({ origin_country: e.target.value })
                  }
                  className={inputClass}
                >
                  {COUNTRIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label
                    className={`${labelClass} mb-1.5 inline-flex items-center gap-1`}
                  >
                    Flat shipping rate
                    <HelpCircle
                      className="w-3.5 h-3.5 text-slate-400"
                      aria-label="Default shipping cost per order"
                    />
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                      $
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={settings.shipping.flat_rate}
                      onChange={(e) =>
                        updateShipping({ flat_rate: e.target.value })
                      }
                      className={`${inputClass} pl-7`}
                    />
                  </div>
                </div>
                <div>
                  <label
                    className={`${labelClass} mb-1.5 inline-flex items-center gap-1`}
                  >
                    Free shipping over
                    <HelpCircle
                      className="w-3.5 h-3.5 text-slate-400"
                      aria-label="Order subtotal for free shipping"
                    />
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                      $
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={settings.shipping.free_shipping_threshold}
                      onChange={(e) =>
                        updateShipping({
                          free_shipping_threshold: e.target.value,
                        })
                      }
                      className={`${inputClass} pl-7`}
                    />
                  </div>
                </div>
              </div>

              <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.shipping.international_shipping}
                  onChange={(e) =>
                    updateShipping({
                      international_shipping: e.target.checked,
                    })
                  }
                />
                Enable international shipping
              </label>
            </Panel>
          )}

          {activeTab === "tax" && (
            <Panel
              title="Tax settings"
              subtitle="Configure tax classes and tax rates."
            >
              <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.tax.enabled}
                  onChange={(e) => updateTax({ enabled: e.target.checked })}
                />
                Enable tax calculation
              </label>

              <div>
                <label
                  className={`${labelClass} mb-1.5 inline-flex items-center gap-1`}
                >
                  Default tax rate
                  <HelpCircle
                    className="w-3.5 h-3.5 text-slate-400"
                    aria-label="Percentage applied at checkout"
                  />
                </label>
                <div className="relative max-w-xs">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={settings.tax.default_rate}
                    onChange={(e) =>
                      updateTax({ default_rate: e.target.value })
                    }
                    disabled={!settings.tax.enabled}
                    className={`${inputClass} pr-8 disabled:bg-slate-50 disabled:text-slate-400`}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                    %
                  </span>
                </div>
              </div>

              <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.tax.prices_include_tax}
                  onChange={(e) =>
                    updateTax({ prices_include_tax: e.target.checked })
                  }
                  disabled={!settings.tax.enabled}
                />
                Display product prices including tax
              </label>
            </Panel>
          )}

          {activeTab === "notifications" && (
            <Panel
              title="Notifications"
              subtitle="Email & SMS notification preferences."
            >
              <div>
                <label className={`${labelClass} mb-1.5 block`}>
                  Admin notification email
                </label>
                <input
                  type="email"
                  value={settings.notifications.admin_email}
                  onChange={(e) =>
                    updateNotifications({ admin_email: e.target.value })
                  }
                  className={inputClass}
                />
              </div>

              <div className="space-y-3 pt-1">
                <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifications.order_confirmation}
                    onChange={(e) =>
                      updateNotifications({
                        order_confirmation: e.target.checked,
                      })
                    }
                  />
                  Send order confirmation email to customer
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifications.admin_new_order}
                    onChange={(e) =>
                      updateNotifications({
                        admin_new_order: e.target.checked,
                      })
                    }
                  />
                  Notify admin when a new order is placed
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifications.shipping_updates}
                    onChange={(e) =>
                      updateNotifications({
                        shipping_updates: e.target.checked,
                      })
                    }
                  />
                  Send shipping update emails to customer
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifications.sms_updates}
                    onChange={(e) =>
                      updateNotifications({ sms_updates: e.target.checked })
                    }
                  />
                  SMS order updates (requires SMS provider)
                </label>
              </div>
            </Panel>
          )}

          <div className="mt-5">
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
    </div>
  );
}
