"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { slugify } from "@/lib/utils";
import type { CmsPage } from "@/lib/admin-data-types";

type Props = { page?: CmsPage };

export function CmsPageForm({ page }: Props) {
  const router = useRouter();
  const isEdit = !!page;
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: page?.title ?? "",
    content: page?.content ?? "",
    status: page?.status ?? "draft",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const payload = {
      title: form.title,
      slug: slugify(form.title),
      content: form.content || null,
      status: form.status,
      updated_at: new Date().toISOString(),
    };

    const supabase = createClient();
    const { error } = isEdit
      ? await supabase.from("cms_pages").update(payload).eq("id", page!.id)
      : await supabase.from("cms_pages").insert(payload);

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    router.push("/admin/pages");
    router.refresh();
  }

  return (
    <div>
      <Link href="/admin/pages" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-primary mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Pages
      </Link>
      <h1 className="text-2xl font-bold text-slate-900 mb-8">{isEdit ? "Edit Page" : "Add Page"}</h1>
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-6 max-w-2xl space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
          <input type="text" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Content</label>
          <textarea rows={8} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
          <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as CmsPage["status"] })} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>
        <button type="submit" disabled={loading} className="bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-dark disabled:opacity-50">
          {loading ? "Saving..." : isEdit ? "Save Changes" : "Create Page"}
        </button>
      </form>
    </div>
  );
}
