import Link from "next/link";
import { Package, Download, MapPin, RotateCcw } from "lucide-react";
import { getUser, getProfile } from "@/lib/supabase/server";
import { getUserOrders, getUserDigitalDownloads } from "@/lib/account-data";
import { AccountMainPanel } from "@/components/store/AccountMainPanel";
import { formatPrice, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Overview | My Account | UKLAI",
};

const statusLabels: Record<string, string> = {
  pending: "Awaiting payment",
  paid: "Paid",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
  refunded: "Refunded",
};

export default async function AccountOverviewPage() {
  const user = await getUser();
  if (!user) return null;

  const profile = await getProfile();
  const [orders, downloads] = await Promise.all([
    getUserOrders(user.id),
    getUserDigitalDownloads(user.id),
  ]);

  const activeOrders = orders.filter((o) =>
    ["pending", "paid", "processing", "shipped"].includes(o.status)
  );
  const recentOrder = orders[0];

  return (
    <AccountMainPanel>
      <div className="px-4 sm:px-6 py-5 border-b border-slate-100">
        <h1 className="text-xl font-bold text-slate-900">Overview</h1>
        <p className="text-sm text-slate-500 mt-1">
          Welcome back, {profile?.full_name ?? "there"}
        </p>
      </div>

      <div className="px-4 sm:px-6 py-6 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="rounded-lg border border-slate-200 p-4 bg-slate-50/50">
            <p className="text-2xl font-bold text-slate-900">{orders.length}</p>
            <p className="text-sm text-slate-500 mt-1">Total orders</p>
          </div>
          <div className="rounded-lg border border-slate-200 p-4 bg-slate-50/50">
            <p className="text-2xl font-bold text-slate-900">
              {activeOrders.length}
            </p>
            <p className="text-sm text-slate-500 mt-1">In progress</p>
          </div>
          <div className="rounded-lg border border-slate-200 p-4 bg-slate-50/50">
            <p className="text-2xl font-bold text-slate-900">
              {downloads.length}
            </p>
            <p className="text-sm text-slate-500 mt-1">Downloads</p>
          </div>
          <div className="rounded-lg border border-slate-200 p-4 bg-slate-50/50">
            <p className="text-2xl font-bold text-slate-900 truncate">
              {user.email?.split("@")[0] ?? "—"}
            </p>
            <p className="text-sm text-slate-500 mt-1">Account</p>
          </div>
        </div>

        {recentOrder ? (
          <div className="rounded-lg border border-slate-200 p-4 sm:p-5">
            <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Latest order
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  #{recentOrder.id.slice(0, 8).toUpperCase()} ·{" "}
                  {formatDate(recentOrder.created_at)}
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-primary/10 text-primary capitalize">
                {statusLabels[recentOrder.status] ?? recentOrder.status}
              </span>
            </div>
            <p className="text-sm text-slate-600 mb-3">
              {(recentOrder.order_items ?? [])
                .slice(0, 2)
                .map((i) => i.product_name)
                .join(", ")}
              {(recentOrder.order_items?.length ?? 0) > 2 ? "…" : ""}
            </p>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="font-bold text-slate-900">
                {formatPrice(recentOrder.total)}
              </p>
              <Link
                href="/account/orders"
                className="text-sm font-semibold text-primary hover:text-primary-dark"
              >
                View all orders
              </Link>
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-slate-200 p-8 text-center">
            <Package className="w-10 h-10 mx-auto text-slate-300 mb-3" />
            <p className="text-slate-600 font-medium">No orders yet</p>
            <Link
              href="/shop"
              className="inline-flex mt-4 bg-primary text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-primary-dark"
            >
              Browse shop
            </Link>
          </div>
        )}

        <div className="grid sm:grid-cols-2 gap-3">
          <Link
            href="/account/orders"
            className="flex items-center gap-3 rounded-lg border border-slate-200 p-4 hover:bg-slate-50 transition-colors"
          >
            <Package className="w-5 h-5 text-primary shrink-0" />
            <div>
              <p className="text-sm font-semibold text-slate-900">Orders</p>
              <p className="text-xs text-slate-500">Track and manage purchases</p>
            </div>
          </Link>
          <Link
            href="/account/downloads"
            className="flex items-center gap-3 rounded-lg border border-slate-200 p-4 hover:bg-slate-50 transition-colors"
          >
            <Download className="w-5 h-5 text-primary shrink-0" />
            <div>
              <p className="text-sm font-semibold text-slate-900">Downloads</p>
              <p className="text-xs text-slate-500">Digital products you own</p>
            </div>
          </Link>
          <Link
            href="/account/addresses"
            className="flex items-center gap-3 rounded-lg border border-slate-200 p-4 hover:bg-slate-50 transition-colors"
          >
            <MapPin className="w-5 h-5 text-primary shrink-0" />
            <div>
              <p className="text-sm font-semibold text-slate-900">
                Shipping address
              </p>
              <p className="text-xs text-slate-500">Saved delivery details</p>
            </div>
          </Link>
          <Link
            href="/account/returns"
            className="flex items-center gap-3 rounded-lg border border-slate-200 p-4 hover:bg-slate-50 transition-colors"
          >
            <RotateCcw className="w-5 h-5 text-primary shrink-0" />
            <div>
              <p className="text-sm font-semibold text-slate-900">
                Returns / refunds
              </p>
              <p className="text-xs text-slate-500">Request a return</p>
            </div>
          </Link>
        </div>
      </div>
    </AccountMainPanel>
  );
}
