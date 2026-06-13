import Link from "next/link";
import { getStoreSettings } from "@/lib/store-settings";
import { ReturnRequestForm } from "@/components/store/ReturnRequestForm";
import { AccountMainPanel } from "@/components/store/AccountMainPanel";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Returns & Refunds | My Account | UKLAI",
};

export default async function AccountReturnsPage() {
  const settings = await getStoreSettings();
  const storeName = settings.store?.name ?? "UKLAI";
  const storeEmail = settings.store?.email ?? "support@uklai.com";

  return (
    <AccountMainPanel>
      <div className="px-4 sm:px-6 py-5 border-b border-slate-100">
        <h1 className="text-xl font-bold text-slate-900">Returns / refunds</h1>
        <p className="text-sm text-slate-500 mt-1">
          Request a return for your {storeName} order
        </p>
      </div>

      <div className="px-4 sm:px-6 py-6 space-y-6">
        <p className="text-sm text-slate-600 leading-relaxed">
          Most unused items may be returned within 30 days of delivery. Read our
          full policy before submitting a request.
        </p>

        <ReturnRequestForm storeEmail={storeEmail} />

        <p className="text-sm text-slate-500 pt-2 border-t border-slate-100">
          <Link
            href="/returns"
            className="text-primary font-semibold hover:underline"
          >
            View returns & refunds policy
          </Link>
        </p>
      </div>
    </AccountMainPanel>
  );
}
