import Image from "next/image";
import type { Order } from "@/types/database";
import type { AllStoreSettings } from "@/lib/store-settings-types";
import { formatPrice } from "@/lib/utils";
import { PrintInvoiceButton } from "@/components/store/PrintInvoiceButton";

type Props = {
  order: Order;
  store: AllStoreSettings;
};

function formatInvoiceDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
}

function paymentLabel(method?: string | null) {
  if (method === "cod") return "Cash on delivery";
  if (method === "stripe") return "Credit / debit card (Stripe)";
  return "Online payment";
}

export function OrderInvoice({ order, store }: Props) {
  const items = order.order_items ?? [];
  const lineSubtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const subtotal = order.subtotal ?? lineSubtotal;
  const discount = order.discount_amount ?? 0;
  const tax = order.tax_amount ?? 0;
  const shipping = Math.max(0, order.total - subtotal + discount - tax);
  const invoiceNumber = order.id.slice(0, 8).toUpperCase();
  const paymentMethod = order.payment_method;

  const storeLines = [
    store.store.address,
    [store.store.city, store.store.province, store.store.postal_code]
      .filter(Boolean)
      .join(", "),
    store.store.country,
  ].filter(Boolean);

  const shipLines = [
    order.shipping_name,
    order.shipping_address,
    [order.shipping_city, order.shipping_state, order.shipping_zip]
      .filter(Boolean)
      .join(", "),
    order.shipping_country,
  ].filter(Boolean);

  return (
    <div className="invoice-root max-w-3xl mx-auto">
      <div className="no-print flex flex-wrap items-center justify-between gap-3 mb-6">
        <p className="text-sm text-slate-500">
          Preview your receipt. Use print to save as PDF.
        </p>
        <PrintInvoiceButton className="bg-primary text-white px-4 py-2.5 hover:bg-primary-dark" />
      </div>

      <article className="invoice-sheet bg-white border border-slate-200 rounded-2xl p-6 sm:p-10 shadow-sm print:shadow-none print:border-0 print:rounded-none print:p-0">
        <header className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6 pb-8 border-b border-slate-200">
          <div>
            <Image
              src="/media/uklai-logo.png"
              alt={store.store.name}
              width={120}
              height={36}
              className="h-8 w-auto object-contain"
            />
            <p className="mt-4 text-sm font-bold text-slate-900">
              {store.store.name}
            </p>
            {storeLines.map((line) => (
              <p key={line} className="text-sm text-slate-500">
                {line}
              </p>
            ))}
            {store.store.email && (
              <p className="text-sm text-slate-500 mt-1">{store.store.email}</p>
            )}
            {store.store.phone && (
              <p className="text-sm text-slate-500">{store.store.phone}</p>
            )}
          </div>

          <div className="sm:text-right">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Invoice
            </h1>
            <p className="text-sm text-slate-600 mt-2">
              <span className="font-medium text-slate-900">No.</span>{" "}
              {invoiceNumber}
            </p>
            <p className="text-sm text-slate-600">
              <span className="font-medium text-slate-900">Date</span>{" "}
              {formatInvoiceDate(order.created_at)}
            </p>
            <p className="text-sm text-slate-600 capitalize">
              <span className="font-medium text-slate-900">Status</span>{" "}
              {order.status}
            </p>
          </div>
        </header>

        <div className="grid sm:grid-cols-2 gap-6 py-8">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Bill to
            </h2>
            {order.customer_email && (
              <p className="text-sm text-slate-800">{order.customer_email}</p>
            )}
            {shipLines.length > 0 ? (
              shipLines.map((line) => (
                <p key={line} className="text-sm text-slate-600">
                  {line}
                </p>
              ))
            ) : (
              <p className="text-sm text-slate-500 italic">
                Shipping details pending
              </p>
            )}
          </div>
          <div className="sm:text-right">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Payment
            </h2>
            <p className="text-sm text-slate-800">
              {paymentLabel(paymentMethod)}
            </p>
            <p className="text-sm text-slate-600 mt-1">
              Currency: {store.payment.currency}
            </p>
            {order.coupon_code && (
              <p className="text-sm text-slate-600 mt-1">
                Coupon: {order.coupon_code}
              </p>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left">
                <th className="py-3 pr-4 font-semibold text-slate-900">
                  Item
                </th>
                <th className="py-3 px-2 font-semibold text-slate-900 text-right w-20">
                  Qty
                </th>
                <th className="py-3 px-2 font-semibold text-slate-900 text-right w-28">
                  Price
                </th>
                <th className="py-3 pl-2 font-semibold text-slate-900 text-right w-28">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-slate-100">
                  <td className="py-3 pr-4 text-slate-800">
                    {item.product_name}
                  </td>
                  <td className="py-3 px-2 text-slate-600 text-right">
                    {item.quantity}
                  </td>
                  <td className="py-3 px-2 text-slate-600 text-right">
                    {formatPrice(item.price)}
                  </td>
                  <td className="py-3 pl-2 text-slate-900 font-medium text-right">
                    {formatPrice(item.price * item.quantity)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end pt-6">
          <dl className="w-full max-w-xs space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Subtotal</dt>
              <dd className="text-slate-900">{formatPrice(subtotal)}</dd>
            </div>
            {discount > 0 && (
              <div className="flex justify-between gap-4 text-green-700">
                <dt>Discount</dt>
                <dd>-{formatPrice(discount)}</dd>
              </div>
            )}
            {shipping > 0 && (
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Shipping</dt>
                <dd className="text-slate-900">{formatPrice(shipping)}</dd>
              </div>
            )}
            {tax > 0 && (
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Tax</dt>
                <dd className="text-slate-900">{formatPrice(tax)}</dd>
              </div>
            )}
            <div className="flex justify-between gap-4 pt-2 border-t border-slate-200 text-base font-bold">
              <dt className="text-slate-900">Total</dt>
              <dd className="text-slate-900">{formatPrice(order.total)}</dd>
            </div>
          </dl>
        </div>

        <footer className="mt-10 pt-6 border-t border-slate-100 text-center text-xs text-slate-400">
          <p>Thank you for shopping with {store.store.name}.</p>
          <p className="mt-1">
            Questions? Contact {store.store.email || "support@uklai.com"}
          </p>
        </footer>
      </article>
    </div>
  );
}
