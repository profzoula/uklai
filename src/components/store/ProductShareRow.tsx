"use client";

import { useState } from "react";
import { Link2, Check } from "lucide-react";

type Props = {
  sku?: string | null;
  productName: string;
};

export function ProductShareRow({ sku, productName }: Props) {
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  }

  return (
    <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-500">
      {sku ? (
        <p>
          SKU:{" "}
          <span className="font-medium text-slate-700">{sku}</span>
        </p>
      ) : (
        <span />
      )}
      <button
        type="button"
        onClick={copyLink}
        className="inline-flex items-center gap-1.5 text-slate-600 hover:text-primary font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
        aria-label={`Copy link to ${productName}`}
      >
        {copied ? (
          <>
            <Check className="w-4 h-4 text-emerald-600" />
            Link copied
          </>
        ) : (
          <>
            <Link2 className="w-4 h-4" />
            Share
          </>
        )}
      </button>
    </div>
  );
}
