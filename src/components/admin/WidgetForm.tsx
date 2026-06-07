"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Widget } from "@/lib/admin-data-types";

type Props = { widget?: Widget };

export function WidgetForm({ widget }: Props) {
  const router = useRouter();
  const isEdit = !!widget;
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: widget?.name ?? "",
    type: widget?.type ?? "banner",
    location: widget?.location ?? "Homepage",
    active: widget?.active ?? true,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const payload = {
      name: form.name,
      type: form.type,
      location: form.location,
      active: form.active,
      updated_at: new Date().toISOString(),
    };

    const supabase = createClient();
    const { error } = isEdit
      ? await supabase.from("widgets").update(payload).eq("id", widget!.id)
      : await supabase.from("widgets").insert(payload);

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    router.push("/admin/widgets");
    router.refresh();
  }

  return (
    <div>
      <Link href="/admin/widgets" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-primary mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Widgets
      </Link>
      <h1 className="text-2xl font-bold text-slate-900 mb-8">{isEdit ? "Edit Widget" : "Add Widget"}</h1>
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-6 max-w-2xl space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
          <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as Widget["type"] })} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
              <option value="banner">Banner</option>
              <option value="carousel">Carousel</option>
              <option value="featured">Featured</option>
              <option value="newsletter">Newsletter</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
            <input type="text" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
          Active
        </label>
        <button type="submit" disabled={loading} className="bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-dark disabled:opacity-50">
          {loading ? "Saving..." : isEdit ? "Save Changes" : "Create Widget"}
        </button>
      </form>
    </div>
  );
}
