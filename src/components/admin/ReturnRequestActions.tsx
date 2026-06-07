"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ReturnRequestStatus } from "@/types/database";

type ReturnRow = {
  id: string;
  customer_email: string;
  order_number: string | null;
  reason: string;
  status: ReturnRequestStatus;
  admin_notes: string | null;
  created_at: string;
};

const statuses: ReturnRequestStatus[] = [
  "pending",
  "approved",
  "rejected",
  "completed",
];

export function ReturnRequestActions({ row }: { row: ReturnRow }) {
  const router = useRouter();
  const [status, setStatus] = useState(row.status);
  const [notes, setNotes] = useState(row.admin_notes ?? "");
  const [loading, setLoading] = useState(false);

  async function save() {
    setLoading(true);
    await fetch("/api/admin/returns", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: row.id, status, admin_notes: notes }),
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-2 min-w-[180px]">
      <select
        value={status}
        onChange={(e) => setStatus(e.target.value as ReturnRequestStatus)}
        className="text-xs px-2 py-1.5 border border-slate-200 rounded-lg capitalize"
      >
        {statuses.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
      <input
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Admin notes"
        className="text-xs px-2 py-1.5 border border-slate-200 rounded-lg"
      />
      <button
        type="button"
        disabled={loading}
        onClick={save}
        className="text-xs bg-slate-900 text-white py-1.5 rounded-lg disabled:opacity-50"
      >
        Save
      </button>
    </div>
  );
}
