import Link from "next/link";
import { Download } from "lucide-react";
import { getAllOrders } from "@/lib/data";
import { formatPrice, formatDate } from "@/lib/utils";
import { OrderStatusSelect } from "@/components/admin/OrderStatusSelect";
import type { OrderStatus } from "@/types/database";

const statusColors: Record<string, string> = {
  pending: "bg-amber-50 text-amber-600",
  paid: "bg-green-50 text-green-600",
  processing: "bg-blue-50 text-blue-600",
  shipped: "bg-purple-50 text-purple-600",
  delivered: "bg-green-50 text-green-700",
  cancelled: "bg-red-50 text-red-500",
  refunded: "bg-orange-50 text-orange-600",
};

export default async function AdminOrdersPage() {
  const orders = await getAllOrders();

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Orders</h1>
          <p className="text-slate-500 mt-1">
            Manage and track customer orders ({orders.length} orders)
          </p>
        </div>
        {orders.length > 0 && (
          <a
            href="/api/admin/orders/export"
            className="inline-flex items-center gap-2 border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-50"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </a>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {orders.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-slate-500">
              No orders yet. Orders will appear here after customers checkout
              via Stripe.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">
                    Order
                  </th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">
                    Customer
                  </th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">
                    Date
                  </th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">
                    Total
                  </th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">
                    Status
                  </th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="font-medium text-sm text-primary hover:underline"
                      >
                        #{order.id.slice(0, 8)}
                      </Link>
                      <p className="text-xs text-slate-400">
                        {order.order_items?.length ?? 0} items
                      </p>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {order.customer_email ?? "Guest"}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {formatDate(order.created_at)}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold">
                      {formatPrice(order.total)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${
                          statusColors[order.status] ?? "bg-slate-50 text-slate-600"
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="text-xs font-medium text-primary hover:underline"
                        >
                          View
                        </Link>
                        <OrderStatusSelect
                          orderId={order.id}
                          currentStatus={order.status as OrderStatus}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
