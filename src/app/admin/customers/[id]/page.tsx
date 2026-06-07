import Link from "next/link";
import { getCustomerById } from "@/lib/admin-data";
import { formatPrice, formatDate } from "@/lib/utils";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function AdminCustomerDetailPage({ params }: Props) {
  const { id } = await params;
  const customer = await getCustomerById(id);
  if (!customer) notFound();

  return (
    <div className="space-y-6">
      <Link
        href="/admin/customers"
        className="inline-flex items-center gap-1 text-sm text-primary hover:text-primary-dark"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to customers
      </Link>

      <header>
        <h1 className="text-2xl font-bold text-slate-900">{customer.full_name}</h1>
        <p className="text-slate-500 mt-1">{customer.email}</p>
        <p className="text-sm text-slate-400 mt-1">
          Joined {formatDate(customer.created_at)}
        </p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <p className="text-sm text-slate-500">Orders</p>
          <p className="text-2xl font-bold text-slate-900">{customer.orders_count}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <p className="text-sm text-slate-500">Total spent</p>
          <p className="text-2xl font-bold text-slate-900">
            {formatPrice(customer.total_spent)}
          </p>
        </div>
      </div>

      <section className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="font-bold text-slate-900">Order history</h2>
        </div>
        {customer.orders.length === 0 ? (
          <p className="p-8 text-sm text-slate-500 text-center">No orders yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">
                    Order
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">
                    Date
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">
                    Total
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customer.orders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="font-medium text-primary hover:underline"
                      >
                        #{order.id.slice(0, 8).toUpperCase()}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {formatDate(order.created_at)}
                    </td>
                    <td className="px-6 py-4 font-semibold">
                      {formatPrice(order.total)}
                    </td>
                    <td className="px-6 py-4 capitalize text-slate-600">
                      {order.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
