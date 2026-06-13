"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ClipboardList, Printer, Search } from "lucide-react";
import type { Order, OrderStatus } from "@/types/database";
import { formatPrice, formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

type TabId = "all" | "to_pay" | "processing" | "shipped" | "completed";

const tabs: { id: TabId; label: string; statuses?: OrderStatus[] }[] = [
  { id: "all", label: "View all" },
  { id: "to_pay", label: "To pay", statuses: ["pending"] },
  {
    id: "processing",
    label: "Processing",
    statuses: ["paid", "processing"],
  },
  { id: "shipped", label: "Shipped", statuses: ["shipped"] },
  { id: "completed", label: "Completed", statuses: ["delivered"] },
];

const statusColors: Record<string, string> = {
  pending: "text-amber-700 bg-amber-50 border-amber-100",
  paid: "text-green-700 bg-green-50 border-green-100",
  processing: "text-blue-700 bg-blue-50 border-blue-100",
  shipped: "text-purple-700 bg-purple-50 border-purple-100",
  delivered: "text-green-800 bg-green-50 border-green-100",
  cancelled: "text-red-600 bg-red-50 border-red-100",
  refunded: "text-orange-700 bg-orange-50 border-orange-100",
};

type Props = {
  orders: Order[];
};

export function AccountOrdersPanel({ orders }: Props) {
  const [activeTab, setActiveTab] = useState<TabId>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState<"all" | "year">("all");

  const filteredOrders = useMemo(() => {
    const tab = tabs.find((t) => t.id === activeTab);
    let result = orders;

    if (tab?.statuses) {
      result = result.filter((o) => tab.statuses!.includes(o.status));
    }

    if (dateRange === "year") {
      const cutoff = new Date();
      cutoff.setFullYear(cutoff.getFullYear() - 1);
      result = result.filter((o) => new Date(o.created_at) >= cutoff);
    }

    const q = searchQuery.trim().toLowerCase();
    if (q) {
      result = result.filter((order) => {
        const orderId = order.id.toLowerCase();
        const itemsMatch = (order.order_items ?? []).some((item) =>
          item.product_name.toLowerCase().includes(q)
        );
        return orderId.includes(q) || itemsMatch;
      });
    }

    return result;
  }, [orders, activeTab, searchQuery, dateRange]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
  }

  return (
    <div>
      <div className="border-b border-slate-200 px-4 sm:px-6">
        <div className="flex flex-wrap items-center gap-1 -mb-px overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "shrink-0 px-4 py-3.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 sm:px-6 py-4 border-b border-slate-100 bg-slate-50/60">
        <form
          onSubmit={handleSearch}
          className="flex flex-col sm:flex-row gap-3 sm:items-center"
        >
          <div className="flex flex-1 min-w-0 gap-2">
            <label htmlFor="order-search" className="sr-only">
              Search orders
            </label>
            <input
              id="order-search"
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Order ID or product name"
              className="flex-1 min-w-0 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark shrink-0"
            >
              <Search className="w-4 h-4" aria-hidden="true" />
              <span className="hidden sm:inline">Search</span>
            </button>
          </div>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as "all" | "year")}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary sm:w-auto w-full"
            aria-label="Date range"
          >
            <option value="all">All time</option>
            <option value="year">Last year</option>
          </select>
        </form>
      </div>

      <div className="px-4 sm:px-6 py-6">
        {filteredOrders.length === 0 ? (
          <div className="py-16 sm:py-20 text-center">
            <ClipboardList
              className="w-14 h-14 mx-auto text-slate-300 mb-4"
              aria-hidden="true"
            />
            <p className="text-slate-600 font-medium">No orders yet</p>
            <p className="text-sm text-slate-400 mt-1 mb-6">
              {orders.length === 0
                ? "When you place an order, it will show up here."
                : "No orders match your filters. Try another tab or search."}
            </p>
            {orders.length === 0 && (
              <Link
                href="/shop"
                className="inline-flex bg-primary text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary-dark"
              >
                Start shopping
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <article
                key={order.id}
                className="border border-slate-200 rounded-lg overflow-hidden"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-5 py-3 bg-slate-50 border-b border-slate-100">
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                    <span className="font-semibold text-slate-900">
                      Order #{order.id.slice(0, 8).toUpperCase()}
                    </span>
                    <span className="text-slate-500">
                      {formatDate(order.created_at)}
                    </span>
                  </div>
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize border ${
                      statusColors[order.status] ??
                      "bg-slate-100 text-slate-600 border-slate-200"
                    }`}
                  >
                    {order.status}
                  </span>
                </div>

                <div className="px-4 sm:px-5 py-4">
                  <ul className="space-y-3 mb-4">
                    {(order.order_items ?? []).map((item) => (
                      <li
                        key={item.id}
                        className="flex items-start gap-3 text-sm"
                      >
                        {item.product_image ? (
                          <img
                            src={item.product_image}
                            alt=""
                            className="w-14 h-14 rounded-md border border-slate-100 object-contain bg-white shrink-0"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-md bg-slate-100 shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-900 line-clamp-2">
                            {item.product_name}
                          </p>
                          <p className="text-slate-500 mt-0.5">
                            Qty: {item.quantity}
                          </p>
                        </div>
                        <span className="font-medium text-slate-900 shrink-0">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
                    <p className="font-bold text-slate-900">
                      Total: {formatPrice(order.total)}
                    </p>
                    <div className="flex flex-wrap items-center gap-3">
                      {order.tracking_number && (
                        <p className="text-sm text-slate-600">
                          Tracking ({order.tracking_carrier ?? "Carrier"}):{" "}
                          <span className="font-medium">
                            {order.tracking_number}
                          </span>
                        </p>
                      )}
                      <Link
                        href={`/invoice/${order.id}`}
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-dark"
                      >
                        <Printer className="w-4 h-4" aria-hidden="true" />
                        Invoice
                      </Link>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
