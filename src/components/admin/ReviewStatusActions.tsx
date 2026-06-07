"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ReviewStatus } from "@/types/database";

type ReviewRow = {
  id: string;
  product_id: string;
  status: ReviewStatus;
};

export function ReviewStatusActions({ row }: { row: ReviewRow }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function updateStatus(status: ReviewStatus) {
    setLoading(true);
    await fetch("/api/admin/reviews", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: row.id, status }),
    });
    setLoading(false);
    router.refresh();
  }

  async function remove() {
    if (!confirm("Delete this review?")) return;
    setLoading(true);
    await fetch(`/api/admin/reviews?id=${row.id}`, { method: "DELETE" });
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="flex flex-wrap gap-2">
      {(["approved", "rejected", "pending"] as ReviewStatus[]).map((s) => (
        <button
          key={s}
          type="button"
          disabled={loading || row.status === s}
          onClick={() => updateStatus(s)}
          className="text-xs px-2.5 py-1 rounded-lg border border-slate-200 capitalize hover:bg-slate-50 disabled:opacity-40"
        >
          {s}
        </button>
      ))}
      <button
        type="button"
        disabled={loading}
        onClick={remove}
        className="text-xs px-2.5 py-1 rounded-lg text-red-600 border border-red-200 hover:bg-red-50"
      >
        Delete
      </button>
    </div>
  );
}
