import Link from "next/link";
import { getStoreSettings } from "@/lib/store-settings";
import { LegalPage, legalPages } from "@/components/store/LegalPage";
import { defaultLegalStore } from "@/lib/store-legal";

export const metadata = {
  title: "Legal Policies | UKLAI",
  description: "Terms, privacy, shipping, returns, and other legal policies for UKLAI.",
};

export default async function LegalIndexPage() {
  const settings = await getStoreSettings();
  const store = settings.store ?? defaultLegalStore;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <Link
        href="/"
        className="text-sm font-medium text-primary hover:text-primary-dark mb-6 inline-block"
      >
        ← Back to store
      </Link>
      <h1 className="text-3xl font-bold text-slate-900 mb-3">Legal policies</h1>
      <p className="text-slate-600 mb-8">
        {store.name} operates in the United States. Review our policies governing
        your use of our website and purchases from our store.
      </p>
      <ul className="space-y-3">
        {legalPages.map((page) => (
          <li key={page.href}>
            <Link
              href={page.href}
              className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-5 py-4 text-slate-900 font-medium hover:border-primary/40 hover:shadow-sm transition-all"
            >
              {page.label}
              <span className="text-primary text-sm">Read →</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
