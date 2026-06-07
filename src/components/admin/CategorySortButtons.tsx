"use client";

import { useRouter } from "next/navigation";
import { ChevronUp, ChevronDown } from "lucide-react";

type Props = {
  id: string;
  canMoveUp: boolean;
  canMoveDown: boolean;
};

export function CategorySortButtons({ id, canMoveUp, canMoveDown }: Props) {
  const router = useRouter();

  async function move(direction: "up" | "down", e: React.MouseEvent) {
    e.stopPropagation();
    const res = await fetch(`/api/admin/categories/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ direction }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      alert(data.error ?? "Could not reorder category.");
      return;
    }

    router.refresh();
  }

  return (
    <div className="flex flex-col gap-0.5">
      <button
        type="button"
        disabled={!canMoveUp}
        onClick={(e) => move("up", e)}
        className="p-1 rounded hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed"
        title="Move up"
      >
        <ChevronUp className="w-4 h-4 text-slate-600" />
      </button>
      <button
        type="button"
        disabled={!canMoveDown}
        onClick={(e) => move("down", e)}
        className="p-1 rounded hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed"
        title="Move down"
      >
        <ChevronDown className="w-4 h-4 text-slate-600" />
      </button>
    </div>
  );
}
