import type { MonthlyOrderCount } from "@/lib/admin-data-types";

type Props = {
  monthlyOrders: MonthlyOrderCount[];
  totalOrders: number;
};

export function OrdersOverviewChart({ monthlyOrders, totalOrders }: Props) {
  const max = Math.max(...monthlyOrders.map((m) => m.count), 1);
  const currentMonth = new Date().getMonth();
  const chartSummary = monthlyOrders
    .map((m) => `${m.month}: ${m.count} orders`)
    .join(", ");

  return (
    <section
      className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm"
      aria-labelledby="orders-overview-heading"
    >
      <div className="mb-6">
        <h2 id="orders-overview-heading" className="text-lg font-bold text-slate-900">
          Orders overview
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Orders per month this year —{" "}
          <span className="font-semibold text-slate-700">
            {totalOrders} total
          </span>
        </p>
      </div>

      <div
        className="flex items-end justify-between gap-2 h-48 px-1"
        role="list"
        aria-label={`Monthly orders chart. ${chartSummary}`}
      >
        {monthlyOrders.map(({ month, count }, i) => {
          const height = (count / max) * 100;
          const isCurrent = i === currentMonth;

          return (
            <div
              key={month}
              role="listitem"
              className="flex-1 flex flex-col items-center gap-2 min-w-0"
            >
              <div className="w-full flex items-end justify-center h-40">
                <div
                  className={`w-full max-w-[28px] rounded-t-md transition-all ${
                    isCurrent ? "bg-primary" : "bg-slate-300 hover:bg-slate-400"
                  }`}
                  style={{ height: `${Math.max(height, count > 0 ? 8 : 2)}%` }}
                  title={`${month}: ${count} orders`}
                  aria-label={`${month}: ${count} orders`}
                />
              </div>
              <span className="text-[10px] sm:text-xs text-slate-500 font-medium">
                {month}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
