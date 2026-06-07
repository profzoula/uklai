"use client";

import { useState } from "react";
import Link from "next/link";
import { Upload, Download, ChevronLeft } from "lucide-react";
import { PRODUCT_CSV_TEMPLATE } from "@/lib/product-csv";

export function ProductImportPanel() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    imported: number;
    failed: number;
    errors: string[];
  } | null>(null);

  async function handleImport(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/admin/products/import", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        setResult({ imported: 0, failed: 0, errors: [data.error ?? "Import failed"] });
      } else {
        setResult({
          imported: data.imported,
          failed: data.failed,
          errors: data.errors ?? [],
        });
      }
    } catch {
      setResult({ imported: 0, failed: 0, errors: ["Import failed"] });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <Link
        href="/admin/products"
        className="inline-flex items-center gap-1 text-sm text-primary hover:text-primary-dark mb-6"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to products
      </Link>

      <h1 className="text-2xl font-bold text-slate-900 mb-2">Import products</h1>
      <p className="text-slate-500 text-sm mb-8">
        Upload a CSV file to create or update products (matched by slug).
      </p>

      <div className="grid lg:grid-cols-2 gap-6">
        <form
          onSubmit={handleImport}
          className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4"
        >
          <label className="block">
            <span className="text-sm font-medium text-slate-700 mb-2 block">
              CSV file
            </span>
            <input
              type="file"
              accept=".csv,text/csv"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="block w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary file:text-white file:font-semibold hover:file:bg-primary-dark"
            />
          </label>

          <button
            type="submit"
            disabled={!file || loading}
            className="inline-flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-800 disabled:opacity-50"
          >
            <Upload className="w-4 h-4" />
            {loading ? "Importing..." : "Import CSV"}
          </button>
        </form>

        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
          <h2 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
            <Download className="w-4 h-4" />
            CSV template
          </h2>
          <p className="text-xs text-slate-600 mb-3">
            Required columns: <code className="bg-white px-1 rounded">name</code>,{" "}
            <code className="bg-white px-1 rounded">price</code>. Optional: slug,
            stock, category_slug, sku, product_type, image_url, etc.
          </p>
          <a
            href={`data:text/csv;charset=utf-8,${encodeURIComponent(PRODUCT_CSV_TEMPLATE)}`}
            download="products-template.csv"
            className="text-sm text-primary font-medium hover:underline"
          >
            Download template.csv
          </a>
          <pre className="mt-4 text-[10px] text-slate-500 overflow-x-auto bg-white p-3 rounded-lg border border-slate-100">
            {PRODUCT_CSV_TEMPLATE}
          </pre>
        </div>
      </div>

      {result && (
        <div
          className={`mt-6 rounded-xl px-4 py-3 text-sm ${
            result.imported > 0
              ? "bg-green-50 text-green-800 border border-green-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          <p className="font-semibold">
            Imported {result.imported} product{result.imported !== 1 ? "s" : ""}
            {result.failed > 0 ? ` · ${result.failed} failed` : ""}
          </p>
          {result.errors.length > 0 && (
            <ul className="mt-2 list-disc pl-5 space-y-0.5 text-xs">
              {result.errors.map((err) => (
                <li key={err}>{err}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
