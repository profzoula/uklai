"use client";

import { CreditCard, Wallet, Banknote, GripVertical } from "lucide-react";
import type { PaymentSettings } from "@/lib/store-settings-types";
import { getPaymentProviderStatus } from "@/lib/payment-methods";

type Props = {
  payment: PaymentSettings;
  storeCountry: string;
  stripeConfigured: boolean;
  onChange: (patch: Partial<PaymentSettings>) => void;
};

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
        checked ? "bg-primary" : "bg-slate-300"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}

function StatusBadge({
  tone,
  children,
}: {
  tone: "active" | "warning" | "muted";
  children: React.ReactNode;
}) {
  const styles = {
    active: "bg-emerald-50 text-emerald-700 border-emerald-200",
    warning: "bg-amber-50 text-amber-800 border-amber-200",
    muted: "bg-slate-100 text-slate-600 border-slate-200",
  }[tone];

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold ${styles}`}
    >
      {children}
    </span>
  );
}

function ProviderRow({
  icon,
  title,
  badges,
  description,
  extra,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  badges?: React.ReactNode;
  description: string;
  extra?: React.ReactNode;
  action: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 sm:gap-4 p-4 sm:p-5 border border-slate-200 rounded-xl bg-white hover:border-slate-300 transition-colors">
      <GripVertical
        className="w-4 h-4 text-slate-300 mt-1 shrink-0 hidden sm:block"
        aria-hidden="true"
      />
      <div className="shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
          {badges}
        </div>
        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
          {description}
        </p>
        {extra}
      </div>
      <div className="shrink-0 pt-0.5">{action}</div>
    </div>
  );
}

export function PaymentProvidersPanel({
  payment,
  storeCountry,
  stripeConfigured,
  onChange,
}: Props) {
  const status = getPaymentProviderStatus(payment, stripeConfigured);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Payment providers</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Enable methods customers can use at checkout.
          </p>
        </div>
        <p className="text-xs text-slate-500 sm:text-right">
          Business location:{" "}
          <span className="font-medium text-slate-700">{storeCountry}</span>
        </p>
      </div>

      <div>
        <label className="text-sm font-medium text-slate-700 mb-1.5 block">
          Currency <span className="text-red-500">*</span>
        </label>
        <select
          value={payment.currency}
          onChange={(e) => onChange({ currency: e.target.value })}
          className="w-full max-w-xs px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40"
        >
          <option value="USD">USD — US Dollar</option>
          <option value="CAD">CAD — Canadian Dollar</option>
          <option value="EUR">EUR — Euro</option>
          <option value="HTG">HTG — Haitian Gourde</option>
        </select>
      </div>

      <div className="space-y-3">
        <ProviderRow
          icon={
            <div className="w-11 h-11 rounded-lg bg-[#635bff] text-white flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
          }
          title="Stripe"
          badges={
            <>
              {status.stripe.active && (
                <StatusBadge tone="active">Active</StatusBadge>
              )}
              {status.stripe.needsSetup && (
                <StatusBadge tone="warning">Action needed</StatusBadge>
              )}
              <StatusBadge tone="muted">Official</StatusBadge>
            </>
          }
          description="Credit/debit cards, Apple Pay, Google Pay, and more."
          extra={
            <div className="flex flex-wrap items-center gap-1.5 mt-3">
              {["Visa", "Mastercard", "Amex", "Discover", "Apple Pay", "Google Pay"].map(
                (brand) => (
                  <span
                    key={brand}
                    className="text-[10px] font-medium text-slate-500 bg-slate-100 border border-slate-200 rounded px-1.5 py-0.5"
                  >
                    {brand}
                  </span>
                )
              )}
            </div>
          }
          action={
            <Toggle
              checked={payment.stripe_enabled}
              onChange={(checked) => onChange({ stripe_enabled: checked })}
              label="Enable Stripe"
            />
          }
        />

        {!stripeConfigured && payment.stripe_enabled && (
          <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 -mt-1">
            Add <code className="bg-white px-1 rounded">STRIPE_SECRET_KEY</code>{" "}
            and <code className="bg-white px-1 rounded">NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY</code>{" "}
            in Railway environment variables to activate Stripe checkout.
          </p>
        )}

        <ProviderRow
          icon={
            <div className="w-11 h-11 rounded-lg bg-[#0fa4e8] text-white flex items-center justify-center text-[10px] font-extrabold tracking-tight">
              affirm
            </div>
          }
          title="Affirm"
          badges={
            <>
              {status.affirm.active && (
                <StatusBadge tone="active">Active</StatusBadge>
              )}
              {payment.affirm_enabled && (
                <StatusBadge tone="muted">Via Stripe</StatusBadge>
              )}
            </>
          }
          description="Buy now, pay later in installments. Enable in Stripe Dashboard → Settings → Payment methods, then toggle on here."
          extra={
            <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
              US only · USD · typical range $50–$30,000 · domestic customers
            </p>
          }
          action={
            <Toggle
              checked={payment.affirm_enabled}
              onChange={(checked) => onChange({ affirm_enabled: checked })}
              label="Enable Affirm"
            />
          }
        />

        <ProviderRow
          icon={
            <div className="w-11 h-11 rounded-lg bg-[#b2fce4] text-[#00453a] flex items-center justify-center text-[9px] font-extrabold tracking-tight">
              Afterpay
            </div>
          }
          title="Afterpay"
          badges={
            <>
              {status.afterpay.active && (
                <StatusBadge tone="active">Active</StatusBadge>
              )}
              {payment.afterpay_enabled && (
                <StatusBadge tone="muted">Via Stripe</StatusBadge>
              )}
            </>
          }
          description="Split payments into 4 interest-free installments. Enable in Stripe Dashboard, then toggle on here."
          extra={
            <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
              US · USD · order limits apply · shown at Stripe Checkout when eligible
            </p>
          }
          action={
            <Toggle
              checked={payment.afterpay_enabled}
              onChange={(checked) => onChange({ afterpay_enabled: checked })}
              label="Enable Afterpay"
            />
          }
        />

        <ProviderRow
          icon={
            <div className="w-11 h-11 rounded-lg bg-[#003087] text-white flex items-center justify-center text-xs font-bold">
              PP
            </div>
          }
          title="PayPal"
          badges={
            <>
              {status.paypal.needsSetup && (
                <StatusBadge tone="warning">Setup needed</StatusBadge>
              )}
              <StatusBadge tone="muted">Official</StatusBadge>
            </>
          }
          description="Pay via PayPal. Integration coming soon — toggle to prepare your store."
          action={
            <Toggle
              checked={payment.paypal_enabled}
              onChange={(checked) => onChange({ paypal_enabled: checked })}
              label="Enable PayPal"
            />
          }
        />

        <ProviderRow
          icon={
            <div className="w-11 h-11 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center border border-slate-200">
              <Banknote className="w-5 h-5" />
            </div>
          }
          title="Cash on delivery"
          badges={
            status.cod.active ? (
              <StatusBadge tone="active">Active</StatusBadge>
            ) : null
          }
          description="Accept payments offline when the order is delivered. Useful for testing or local delivery."
          action={
            <Toggle
              checked={payment.cod_enabled}
              onChange={(checked) => onChange({ cod_enabled: checked })}
              label="Enable cash on delivery"
            />
          }
        />

        <ProviderRow
          icon={
            <div className="w-11 h-11 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center border border-slate-200">
              <Wallet className="w-5 h-5" />
            </div>
          }
          title="Offline payments"
          description="Bank transfer and other manual methods can be added in a future update."
          action={
            <span className="text-xs text-slate-400 font-medium">Soon</span>
          }
        />
      </div>
    </div>
  );
}
