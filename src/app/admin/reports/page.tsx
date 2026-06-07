import { getAdminDashboardData, getCoupons, getCollections } from "@/lib/admin-data";
import { getAllCategoriesAdmin } from "@/lib/data";
import { formatPrice, formatDate } from "@/lib/utils";

export default async function AdminReportsPage() {
  const [dashboard, categories, collections, coupons] = await Promise.all([
    getAdminDashboardData(),
    getAllCategoriesAdmin(),
    getCollections(),
    getCoupons(),
  ]);

  const { stats, lowStockProducts, outOfStockProducts, latestOrders } =
    dashboard;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Reports</h1>
        <p className="text-slate-500 mt-1">
          Store summary generated {formatDate(new Date().toISOString())}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h2 className="font-bold text-slate-900 mb-4">Sales Summary</h2>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-slate-500">Total revenue</dt>
              <dd className="font-semibold">{formatPrice(stats.totalRevenue)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Total orders</dt>
              <dd className="font-semibold">{stats.totalOrders}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Avg. order value</dt>
              <dd className="font-semibold">
                {stats.totalOrders > 0
                  ? formatPrice(stats.totalRevenue / stats.totalOrders)
                  : formatPrice(0)}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Registered customers</dt>
              <dd className="font-semibold">{stats.totalCustomers}</dd>
            </div>
          </dl>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h2 className="font-bold text-slate-900 mb-4">Catalog Summary</h2>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-slate-500">Active products</dt>
              <dd className="font-semibold">{stats.totalProducts}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Categories</dt>
              <dd className="font-semibold">{categories.length}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Collections</dt>
              <dd className="font-semibold">{collections.length}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Low stock items</dt>
              <dd className="font-semibold text-amber-600">
                {lowStockProducts.length}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Out of stock</dt>
              <dd className="font-semibold text-red-500">
                {outOfStockProducts.length}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h2 className="font-bold text-slate-900 mb-4">Active Coupons</h2>
        {coupons.filter((c) => c.active).length === 0 ? (
          <p className="text-sm text-slate-500">No active coupons.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {coupons
              .filter((c) => c.active)
              .map((coupon) => (
                <li
                  key={coupon.id}
                  className="flex items-center justify-between py-3 text-sm"
                >
                  <span className="font-mono font-semibold text-primary">
                    {coupon.code}
                  </span>
                  <span className="text-slate-600">
                    {coupon.type === "percentage"
                      ? `${coupon.value}% off`
                      : formatPrice(coupon.value)}
                    {" · "}
                    {coupon.usage_count} uses
                  </span>
                </li>
              ))}
          </ul>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h2 className="font-bold text-slate-900 mb-4">Recent Orders</h2>
        {latestOrders.length === 0 ? (
          <p className="text-sm text-slate-500">No orders recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs uppercase text-slate-500">
                  <th className="pb-3 pr-4">Order</th>
                  <th className="pb-3 pr-4">Customer</th>
                  <th className="pb-3 pr-4">Total</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {latestOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="py-3 pr-4 font-medium">{order.order_id}</td>
                    <td className="py-3 pr-4 text-slate-600">
                      {order.customer_name}
                    </td>
                    <td className="py-3 pr-4 font-semibold">
                      {formatPrice(order.price)}
                    </td>
                    <td className="py-3 capitalize text-slate-600">
                      {order.status}
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
