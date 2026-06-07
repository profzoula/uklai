"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { slugify } from "@/lib/utils";
import type { Category } from "@/types/database";

type Props = { category?: Category };

export function CategoryForm({ category }: Props) {
  const router = useRouter();
  const isEdit = !!category;
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: category?.name ?? "",
    description: category?.description ?? "",
    image_url: category?.image_url ?? "",
    sort_order: category?.sort_order?.toString() ?? "0",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const payload = {
      name: form.name,
      slug: slugify(form.name),
      description: form.description || null,
      image_url: form.image_url || null,
      sort_order: parseInt(form.sort_order) || 0,
    };

    const supabase = createClient();
    const { error } = isEdit
      ? await supabase.from("categories").update(payload).eq("id", category!.id)
      : await supabase.from("categories").insert(payload);

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    router.push("/admin/categories");
    router.refresh();
  }

  return (
    <div>
      <Link href="/admin/categories" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-primary mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Categories
      </Link>
      <h1 className="text-2xl font-bold text-slate-900 mb-8">{isEdit ? "Edit Category" : "Add Category"}</h1>
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-6 max-w-2xl space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
          <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
          <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Image URL</label>
          <input type="url" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Sort Order</label>
          <input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: e.target.value })} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
        <button type="submit" disabled={loading} className="bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-dark disabled:opacity-50">
          {loading ? "Saving..." : isEdit ? "Save Changes" : "Create Category"}
        </button>
      </form>
    </div>
  );
}
