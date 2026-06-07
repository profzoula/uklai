import Link from "next/link";
import { Download } from "lucide-react";
import { getUser } from "@/lib/supabase/server";
import { getUserDigitalDownloads } from "@/lib/account-data";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AccountDownloadsPage() {
  const user = await getUser();
  if (!user) return null;

  const downloads = await getUserDigitalDownloads(user.id);

  return (
    <div>
      <h2 className="text-lg font-bold text-slate-900 mb-4">Digital downloads</h2>

      {downloads.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center">
          <p className="text-slate-500 mb-4">
            No digital products purchased yet.
          </p>
          <Link
            href="/shop"
            className="inline-flex bg-primary text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary-dark"
          >
            Browse shop
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {downloads.map((item) => (
            <li
              key={item.itemId}
              className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-3"
            >
              <div>
                <p className="font-semibold text-slate-900">{item.productName}</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Order #{item.orderId.slice(0, 8).toUpperCase()} ·{" "}
                  {formatDate(item.orderDate)}
                </p>
              </div>
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-primary-dark"
              >
                <Download className="w-4 h-4" />
                Download
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
