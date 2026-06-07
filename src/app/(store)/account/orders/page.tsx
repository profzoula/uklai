import Link from "next/link";
import { getUser } from "@/lib/supabase/server";
import { getUserOrders } from "@/lib/account-data";
import { formatPrice, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

const statusColors: Record<string, string> = {
  pending: "text-amber-600 bg-amber-50",
  paid: "text-green-600 bg-green-50",
  processing: "text-blue-600 bg-blue-50",
  shipped: "text-purple-600 bg-purple-50",
  delivered: "text-green-700 bg-green-50",
  cancelled: "text-red-500 bg-red-50",
  refunded: "text-orange-600 bg-orange-50",
};

export default async function AccountOrdersPage() {
  const user = await getUser();
  if (!user) return null;

  const orders = await getUserOrders(user.id);

  return (
    <div>
      <h2 className="text-lg font-bold text-slate-900 mb-4">Order history</h2>

      {orders.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center">
          <p className="text-slate-500 mb-4">You haven&apos;t placed any orders yet.</p>
          <Link
            href="/shop"
            className="inline-flex bg-primary text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary-dark"
          >
            Start shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <article
              key={order.id}
              className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6"
            >
              <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                <div>
                  <p className="font-semibold text-slate-900">
                    Order #{order.id.slice(0, 8).toUpperCase()}
                  </p>
                  <p className="text-sm text-slate-500">
                    {formatDate(order.created_at)}
                  </p>
                </div>
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${
                    statusColors[order.status] ?? "bg-slate-100 text-slate-600"
                  }`}
                >
                  {order.status}
                </span>
              </div>

              <ul className="space-y-2 mb-4">
                {(order.order_items ?? []).map((item) => (
                  <li
                    key={item.id}
                    className="flex justify-between text-sm text-slate-600"
                  >
                    <span>
                      {item.product_name} × {item.quantity}
                    </span>
                    <span>{formatPrice(item.price * item.quantity)}</span>
                  </li>
                ))}
              </ul>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100">
                <p className="font-bold text-slate-900">
                  Total: {formatPrice(order.total)}
                </p>
                {order.tracking_number && (
                  <p className="text-sm text-slate-600">
                    Tracking ({order.tracking_carrier ?? "Carrier"}):{" "}
                    <span className="font-medium">{order.tracking_number}</span>
                  </p>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
