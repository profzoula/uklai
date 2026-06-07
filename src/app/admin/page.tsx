import { StatCard } from "@/components/admin/dashboard/StatCard";
import { OrdersOverviewChart } from "@/components/admin/dashboard/OrdersOverviewChart";
import { ProductDistributionChart } from "@/components/admin/dashboard/ProductDistributionChart";
import { LatestOrdersTable } from "@/components/admin/dashboard/LatestOrdersTable";
import { StockAlertPanel } from "@/components/admin/dashboard/DashboardTools";
import {
  getAdminDashboardData,
  getCollections,
  getCoupons,
} from "@/lib/admin-data";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [dashboard, collections, coupons] = await Promise.all([
    getAdminDashboardData(),
    getCollections(),
    getCoupons(),
  ]);

  const {
    stats,
    lowStockProducts,
    outOfStockProducts,
    latestOrders,
    categoryCounts,
    monthlyOrders,
    trends,
    isLive,
  } = dashboard;

  const activeCoupons = coupons.filter((c) => c.active).length;
  const updatedAt = new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date());

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 mt-1">
            Live overview of your Briclix store performance
          </p>
        </div>
        <p className="text-xs text-slate-400" aria-live="polite">
          Updated {updatedAt}
          {!isLive && " · demo data (configure Supabase for live stats)"}
        </p>
      </header>

      {!isLive && (
        <div
          className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
          role="status"
        >
          Connect Supabase in <code className="text-xs bg-white/80 px-1 rounded">.env.local</code> to load real store data on this dashboard.
        </div>
      )}

      <section aria-labelledby="kpi-heading">
        <h2 id="kpi-heading" className="sr-only">
          Key performance indicators
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6">
          <StatCard
            label="Total revenue"
            value={formatPrice(stats.totalRevenue)}
            href="/admin/orders"
            trend={trends.revenue}
          />
          <StatCard
            label="Total orders"
            value={String(stats.totalOrders)}
            href="/admin/orders"
            trend={trends.orders}
          />
          <StatCard
            label="Products"
            value={String(stats.totalProducts)}
            href="/admin/products"
            trend={trends.products}
          />
          <StatCard
            label="Customers"
            value={String(stats.totalCustomers)}
            href="/admin/customers"
            trend={trends.customers}
          />
        </div>
      </section>

      <section
        aria-labelledby="charts-heading"
        className="grid grid-cols-1 xl:grid-cols-3 gap-4 lg:gap-6"
      >
        <h2 id="charts-heading" className="sr-only">
          Charts
        </h2>
        <div className="xl:col-span-2">
          <OrdersOverviewChart
            monthlyOrders={monthlyOrders}
            totalOrders={stats.totalOrders}
          />
        </div>
        <ProductDistributionChart categories={categoryCounts} />
      </section>

      {(lowStockProducts.length > 0 || outOfStockProducts.length > 0) && (
        <section
          aria-labelledby="inventory-alerts-heading"
          className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6"
        >
          <h2 id="inventory-alerts-heading" className="sr-only">
            Inventory alerts
          </h2>
          <StockAlertPanel
            products={lowStockProducts}
            title="Low stock"
            variant="low"
          />
          <StockAlertPanel
            products={outOfStockProducts}
            title="Out of stock"
            variant="out"
          />
        </section>
      )}

      <section
        aria-labelledby="catalog-orders-heading"
        className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6"
      >
        <h2 id="catalog-orders-heading" className="sr-only">
          Catalog summary and recent orders
        </h2>
        <aside className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Catalog</h2>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between items-center gap-4">
              <dt className="text-slate-500">Categories</dt>
              <dd>
                <Link
                  href="/admin/categories"
                  className="font-semibold text-primary hover:text-primary-dark"
                >
                  {categoryCounts.filter((c) => c.name !== "Uncategorized").length}
                </Link>
              </dd>
            </div>
            <div className="flex justify-between items-center gap-4">
              <dt className="text-slate-500">Collections</dt>
              <dd>
                <Link
                  href="/admin/collections"
                  className="font-semibold text-primary hover:text-primary-dark"
                >
                  {collections.length}
                </Link>
              </dd>
            </div>
            <div className="flex justify-between items-center gap-4">
              <dt className="text-slate-500">Active coupons</dt>
              <dd>
                <Link
                  href="/admin/coupons"
                  className="font-semibold text-primary hover:text-primary-dark"
                >
                  {activeCoupons}
                </Link>
              </dd>
            </div>
            <div className="flex justify-between items-center gap-4">
              <dt className="text-slate-500">Low stock items</dt>
              <dd className="font-semibold text-amber-600">
                {lowStockProducts.length}
              </dd>
            </div>
            <div className="flex justify-between items-center gap-4">
              <dt className="text-slate-500">Out of stock</dt>
              <dd className="font-semibold text-red-600">
                {outOfStockProducts.length}
              </dd>
            </div>
          </dl>
        </aside>

        <div className="lg:col-span-2">
          <LatestOrdersTable orders={latestOrders} />
        </div>
      </section>
    </div>
  );
}
