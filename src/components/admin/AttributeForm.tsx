"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { slugify } from "@/lib/utils";
import type { Attribute } from "@/lib/admin-data-types";

type Props = { attribute?: Attribute };

export function AttributeForm({ attribute }: Props) {
  const router = useRouter();
  const isEdit = !!attribute;
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: attribute?.name ?? "",
    type: attribute?.type ?? "text",
    values: attribute?.values?.join(", ") ?? "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const values = form.values
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);

    const payload = {
      name: form.name,
      slug: slugify(form.name),
      type: form.type,
      values,
    };

    const supabase = createClient();
    const { error } = isEdit
      ? await supabase.from("attributes").update(payload).eq("id", attribute!.id)
      : await supabase.from("attributes").insert(payload);

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    router.push("/admin/attributes");
    router.refresh();
  }

  return (
    <div>
      <Link href="/admin/attributes" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-primary mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Attributes
      </Link>
      <h1 className="text-2xl font-bold text-slate-900 mb-8">{isEdit ? "Edit Attribute" : "Add Attribute"}</h1>
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-6 max-w-2xl space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
          <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
          <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as Attribute["type"] })} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
            <option value="text">Text</option>
            <option value="color">Color</option>
            <option value="size">Size</option>
            <option value="number">Number</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Values (comma separated)</label>
          <input type="text" value={form.values} onChange={(e) => setForm({ ...form, values: e.target.value })} placeholder="Black, White, Red" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
        <button type="submit" disabled={loading} className="bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-dark disabled:opacity-50">
          {loading ? "Saving..." : isEdit ? "Save Changes" : "Create Attribute"}
        </button>
      </form>
    </div>
  );
}
