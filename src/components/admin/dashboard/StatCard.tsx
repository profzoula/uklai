import Link from "next/link";
import { cn } from "@/lib/utils";
import { ArrowDown, ArrowUp } from "lucide-react";
import type { DashboardTrend } from "@/lib/admin-data-types";

type Props = {
  label: string;
  value: string;
  href?: string;
  trend?: DashboardTrend;
};

export function StatCard({ label, value, href, trend }: Props) {
  const changeLabel =
    trend?.percentChange != null
      ? `${trend.percentChange > 0 ? "+" : ""}${trend.percentChange}%`
      : null;

  const content = (
    <>
      <p className="text-sm text-slate-500 mb-3">{label}</p>
      <div className="flex items-end justify-between gap-2">
        <p className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          {value}
        </p>
        {changeLabel && trend && trend.direction !== "neutral" && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 text-xs font-semibold px-2 py-1 rounded-lg",
              trend.direction === "up"
                ? "text-emerald-600 bg-emerald-50"
                : "text-red-500 bg-red-50"
            )}
            title={trend.label}
          >
            {trend.direction === "up" ? (
              <ArrowUp className="w-3 h-3" aria-hidden="true" />
            ) : (
              <ArrowDown className="w-3 h-3" aria-hidden="true" />
            )}
            {changeLabel}
          </span>
        )}
      </div>
      {trend?.label && (
        <p className="text-xs text-slate-400 mt-2">{trend.label}</p>
      )}
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="block bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:border-primary/30 hover:shadow-md transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        aria-label={`${label}: ${value}`}
      >
        {content}
      </Link>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
      {content}
    </div>
  );
}
