import Link from "next/link";
import type { LegalStoreInfo } from "@/lib/store-legal";
import { LEGAL_LAST_UPDATED } from "@/lib/store-legal";

type Props = {
  title: string;
  store: LegalStoreInfo;
  children: React.ReactNode;
};

export function LegalPage({ title, store, children }: Props) {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <nav
        aria-label="Breadcrumb"
        className="mb-8 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-slate-500"
      >
        <Link href="/" className="text-primary hover:text-primary-dark font-medium">
          Store
        </Link>
        <span aria-hidden="true">/</span>
        <Link href="/legal" className="text-primary hover:text-primary-dark font-medium">
          Legal
        </Link>
        <span aria-hidden="true">/</span>
        <span className="text-slate-700">{title}</span>
      </nav>

      <header className="mb-8 border-b border-slate-200 pb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">{title}</h1>
        <p className="text-sm text-slate-500">Last updated: {LEGAL_LAST_UPDATED}</p>
      </header>

      <div
        className="mb-10 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 leading-relaxed"
        role="note"
      >
        This document is provided for general informational purposes and does not
        constitute legal advice. Consult a qualified attorney to ensure compliance
        with federal, state, and local laws applicable to your business.
      </div>

      <article className="legal-content">{children}</article>

      <footer className="mt-12 pt-8 border-t border-slate-200 text-sm text-slate-500">
        Questions about this policy? Contact{" "}
        <a href={`mailto:${store.email}`} className="text-primary hover:underline">
          {store.email}
        </a>
        {store.phone ? ` · ${store.phone}` : ""}
      </footer>
    </div>
  );
}

export const legalPages = [
  { href: "/terms", label: "Terms of Service" },
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/cookies", label: "Cookie Policy" },
  { href: "/returns", label: "Returns & Refunds" },
  { href: "/shipping", label: "Shipping Policy" },
  { href: "/accessibility", label: "Accessibility" },
] as const;
