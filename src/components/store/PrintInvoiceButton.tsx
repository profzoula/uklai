"use client";

import { Printer } from "lucide-react";

type Props = {
  label?: string;
  className?: string;
};

export function PrintInvoiceButton({
  label = "Print invoice",
  className = "",
}: Props) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className={`inline-flex items-center gap-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-lg ${className}`}
    >
      <Printer className="w-4 h-4" aria-hidden="true" />
      {label}
    </button>
  );
}
