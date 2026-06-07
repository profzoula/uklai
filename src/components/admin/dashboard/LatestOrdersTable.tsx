import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { formatPrice, formatDate } from "@/lib/utils";
import type { LatestOrderRow } from "@/lib/admin-data-types";

const statusStyles = {
  completed: "bg-emerald-50 text-emerald-600",
  pending: "bg-amber-50 text-amber-600",
  canceled: "bg-red-50 text-red-500",
};

type Props = {
  orders: LatestOrderRow[];
};

export function LatestOrdersTable({ orders }: Props) {
  return (
    <section
      className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
      aria-labelledby="latest-orders-heading"
    >
      <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
        <h2 id="latest-orders-heading" className="text-lg font-bold text-slate-900">
          Latest orders
        </h2>
        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
        >
          View all orders
          <ChevronRight className="w-4 h-4" aria-hidden="true" />
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="px-6 py-12 text-center">
          <p className="text-sm text-slate-500">
            No orders yet. They will appear here after customers complete checkout.
          </p>
          <Link
            href="/admin/products/new"
            className="inline-block mt-4 text-sm font-semibold text-primary hover:text-primary-dark"
          >
            Add your first product
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full" aria-describedby="latest-orders-heading">
            <caption className="sr-only">
              Most recent customer orders with status and totals
            </caption>
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                {[
                  "Order ID",
                  "Products",
                  "Customer",
                  "Date",
                  "Price",
                  "Status",
                ].map((header) => (
                  <th
                    key={header}
                    scope="col"
                    className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4 whitespace-nowrap"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50/50">
                  <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
                    <Link
                      href="/admin/orders"
                      className="text-primary hover:text-primary-dark focus:outline-none focus-visible:underline"
                    >
                      {order.order_id}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 max-w-[200px] truncate">
                    {order.product}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <img
                        src={order.avatar}
                        alt=""
                        className="w-8 h-8 rounded-full object-cover"
                        width={32}
                        height={32}
                      />
                      <span className="text-sm font-medium text-slate-900">
                        {order.customer_name}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500 whitespace-nowrap">
                    <time dateTime={order.date}>{formatDate(order.date)}</time>
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-slate-900 whitespace-nowrap">
                    {formatPrice(order.price)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full capitalize ${
                        statusStyles[order.status]
                      }`}
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full bg-current"
                        aria-hidden="true"
                      />
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
