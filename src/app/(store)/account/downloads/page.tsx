import Link from "next/link";
import { Download } from "lucide-react";
import { getUser } from "@/lib/supabase/server";
import { getUserDigitalDownloads } from "@/lib/account-data";
import { AccountMainPanel } from "@/components/store/AccountMainPanel";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Downloads | My Account | UKLAI",
};

export default async function AccountDownloadsPage() {
  const user = await getUser();
  if (!user) return null;

  const downloads = await getUserDigitalDownloads(user.id);

  return (
    <AccountMainPanel>
      <div className="px-4 sm:px-6 py-5 border-b border-slate-100">
        <h1 className="text-xl font-bold text-slate-900">Digital downloads</h1>
        <p className="text-sm text-slate-500 mt-1">
          Files from your digital purchases
        </p>
      </div>

      <div className="px-4 sm:px-6 py-6">
        {downloads.length === 0 ? (
          <div className="py-16 text-center">
            <Download className="w-12 h-12 mx-auto text-slate-300 mb-4" />
            <p className="text-slate-600 font-medium">
              No digital products yet
            </p>
            <p className="text-sm text-slate-400 mt-1 mb-6">
              Digital downloads appear here after purchase.
            </p>
            <Link
              href="/shop"
              className="inline-flex bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary-dark"
            >
              Browse shop
            </Link>
          </div>
        ) : (
          <ul className="space-y-3">
            {downloads.map((item) => (
              <li
                key={item.itemId}
                className="border border-slate-200 rounded-lg p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3"
              >
                <div>
                  <p className="font-semibold text-slate-900">
                    {item.productName}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Order #{item.orderId.slice(0, 8).toUpperCase()} ·{" "}
                    {formatDate(item.orderDate)}
                  </p>
                </div>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary-dark"
                >
                  <Download className="w-4 h-4" />
                  Download
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </AccountMainPanel>
  );
}
