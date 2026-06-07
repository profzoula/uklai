import { StatCard } from "@/components/admin/dashboard/StatCard";
import { OrdersOverviewChart } from "@/components/admin/dashboard/OrdersOverviewChart";
import { ProductDistributionChart } from "@/components/admin/dashboard/ProductDistributionChart";
import { getAdminDashboardData } from "@/lib/admin-data";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminAnalyticsPage() {
  const { stats, categoryCounts, monthlyOrders, trends } =
    await getAdminDashboardData();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Analytics</h1>
        <p className="text-slate-500 mt-1">
          Sales and catalog metrics for your store
        </p>
      </header>

      <section aria-labelledby="analytics-kpi-heading">
        <h2 id="analytics-kpi-heading" className="sr-only">
          Analytics KPIs
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard
            label="Revenue"
            value={formatPrice(stats.totalRevenue)}
            trend={trends.revenue}
          />
          <StatCard
            label="Orders"
            value={String(stats.totalOrders)}
            trend={trends.orders}
          />
          <StatCard
            label="Products"
            value={String(stats.totalProducts)}
            trend={trends.products}
          />
          <StatCard
            label="Customers"
            value={String(stats.totalCustomers)}
            trend={trends.customers}
          />
        </div>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <OrdersOverviewChart
            monthlyOrders={monthlyOrders}
            totalOrders={stats.totalOrders}
          />
        </div>
        <ProductDistributionChart categories={categoryCounts} />
      </section>
    </div>
  );
}
