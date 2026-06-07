"use client";

import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

type Props = {
  deleteUrl: string;
  label: string;
};

export function AdminRowActions({ deleteUrl, label }: Props) {
  const router = useRouter();

  async function handleDelete(e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirm(`Delete "${label}"? This cannot be undone.`)) return;

    const res = await fetch(deleteUrl, { method: "DELETE" });
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      alert(data.error ?? "Delete failed. Check Supabase configuration.");
      return;
    }

    router.refresh();
  }

  return (
    <div className="flex items-center justify-end">
      <button
        type="button"
        onClick={handleDelete}
        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        title="Delete"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}
