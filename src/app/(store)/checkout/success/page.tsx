import Link from "next/link";
import { CheckCircle, ArrowRight, Download, Printer } from "lucide-react";
import { ClearCartOnSuccess } from "@/components/store/ClearCartOnSuccess";
import { getOrderById, getOrderByStripeSession } from "@/lib/data";
import { invoiceAccessQuery } from "@/lib/invoice-access";

type Props = {
  searchParams: Promise<{ session_id?: string; order_id?: string; method?: string }>;
};

export default async function CheckoutSuccessPage({ searchParams }: Props) {
  const params = await searchParams;
  const order = params.order_id
    ? await getOrderById(params.order_id)
    : params.session_id
      ? await getOrderByStripeSession(params.session_id)
      : null;

  const digitalItems =
    order?.order_items?.filter(
      (i) => i.product_type === "digital" && i.digital_file_url
    ) ?? [];

  return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <ClearCartOnSuccess />
      <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
      <h1 className="text-3xl font-bold text-slate-900 mb-4">
        Order Confirmed!
      </h1>
      <p className="text-slate-600 mb-2">
        {params.method === "cod"
          ? "Your order has been placed. Please have payment ready when your order is delivered."
          : "Thank you for your purchase. Your order has been received and is being processed."}
      </p>
      {order && (
        <p className="text-sm text-slate-500 mb-4">
          Order #{order.id.slice(0, 8).toUpperCase()}
          {order.customer_email && ` · Confirmation sent to ${order.customer_email}`}
        </p>
      )}
      {params.session_id && !order && (
        <p className="text-sm text-slate-400 mb-8">
          Reference: {params.session_id.slice(0, 20)}...
        </p>
      )}

      {digitalItems.length > 0 && (
        <div className="mb-8 text-left bg-slate-50 border border-slate-200 rounded-2xl p-6">
          <h2 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
            <Download className="w-5 h-5 text-primary" />
            Your digital downloads
          </h2>
          <ul className="space-y-2">
            {digitalItems.map((item) => (
              <li key={item.id}>
                <a
                  href={item.digital_file_url!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary font-medium hover:underline"
                >
                  {item.product_name} — Download
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        {order && (
          <Link
            href={`/invoice/${order.id}?${invoiceAccessQuery(order)}`}
            className="inline-flex items-center gap-2 border-2 border-slate-200 text-slate-800 px-6 py-3 rounded-xl font-semibold hover:bg-slate-50 transition-colors"
          >
            <Printer className="w-4 h-4" />
            Print receipt
          </Link>
        )}
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-dark transition-colors"
        >
          Continue Shopping
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
