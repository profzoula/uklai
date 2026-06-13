"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { Bell, Package, RotateCcw, Star } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type {
  AdminNotificationItem,
  AdminNotificationType,
} from "@/lib/admin-notifications";

type Payload = {
  items: AdminNotificationItem[];
  count: number;
  counts: { orders: number; reviews: number; returns: number };
};

const TYPE_META: Record<
  AdminNotificationType,
  { icon: typeof Package; label: string; className: string }
> = {
  order: {
    icon: Package,
    label: "Order",
    className: "bg-blue-50 text-blue-600",
  },
  review: {
    icon: Star,
    label: "Review",
    className: "bg-amber-50 text-amber-600",
  },
  return: {
    icon: RotateCcw,
    label: "Return",
    className: "bg-rose-50 text-rose-600",
  },
};

const POLL_MS = 30_000;

export function AdminNotifications() {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<Payload | null>(null);
  const [loading, setLoading] = useState(true);
  const panelRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/notifications");
      if (!res.ok) return;
      const json = (await res.json()) as Payload;
      setData(json);
    } catch {
      // ignore polling errors
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const timer = window.setInterval(load, POLL_MS);
    return () => window.clearInterval(timer);
  }, [load]);

  useEffect(() => {
    if (!open) return;

    function handleClickOutside(event: MouseEvent) {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const count = data?.count ?? 0;

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={() => {
          setOpen((value) => !value);
          if (!open) load();
        }}
        className="relative p-2.5 rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors"
        aria-label={
          count > 0
            ? `Notifications, ${count} items need attention`
            : "Notifications"
        }
        aria-expanded={open}
        aria-haspopup="true"
      >
        <Bell className="w-5 h-5" strokeWidth={1.75} />
        {count > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full ring-2 ring-white flex items-center justify-center">
            {count > 9 ? "9+" : count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-[min(100vw-2rem,22rem)] bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900">
                Notifications
              </p>
              <p className="text-xs text-slate-500">
                {count > 0
                  ? `${count} item${count === 1 ? "" : "s"} need attention`
                  : "You're all caught up"}
              </p>
            </div>
          </div>

          {loading && !data ? (
            <p className="px-4 py-8 text-sm text-slate-500 text-center">
              Loading...
            </p>
          ) : count === 0 ? (
            <p className="px-4 py-8 text-sm text-slate-500 text-center">
              No new orders, reviews, or returns right now.
            </p>
          ) : (
            <ul className="max-h-80 overflow-y-auto divide-y divide-slate-100">
              {data?.items.map((item) => {
                const meta = TYPE_META[item.type];
                const Icon = meta.icon;
                return (
                  <li key={item.id}>
                    <Link
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className="flex gap-3 px-4 py-3 hover:bg-slate-50 transition-colors"
                    >
                      <span
                        className={`mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${meta.className}`}
                      >
                        <Icon className="w-4 h-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-medium text-slate-900 truncate">
                          {item.title}
                        </span>
                        <span className="block text-xs text-slate-500 line-clamp-2 mt-0.5">
                          {item.message}
                        </span>
                        <span className="block text-[11px] text-slate-400 mt-1">
                          {formatDate(item.createdAt)}
                        </span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}

          {count > 0 && (
            <div className="px-4 py-3 border-t border-slate-100 bg-slate-50/80 flex gap-3 text-xs font-medium">
              {(data?.counts.orders ?? 0) > 0 && (
                <Link
                  href="/admin/orders"
                  onClick={() => setOpen(false)}
                  className="text-primary hover:underline"
                >
                  Orders ({data?.counts.orders})
                </Link>
              )}
              {(data?.counts.reviews ?? 0) > 0 && (
                <Link
                  href="/admin/reviews"
                  onClick={() => setOpen(false)}
                  className="text-primary hover:underline"
                >
                  Reviews ({data?.counts.reviews})
                </Link>
              )}
              {(data?.counts.returns ?? 0) > 0 && (
                <Link
                  href="/admin/returns"
                  onClick={() => setOpen(false)}
                  className="text-primary hover:underline"
                >
                  Returns ({data?.counts.returns})
                </Link>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
