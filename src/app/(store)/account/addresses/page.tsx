import Link from "next/link";
import { MapPin } from "lucide-react";
import { getUser } from "@/lib/supabase/server";
import { getUserOrders } from "@/lib/account-data";
import { AccountMainPanel } from "@/components/store/AccountMainPanel";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Shipping Address | My Account | UKLAI",
};

function formatAddress(order: {
  shipping_name: string | null;
  shipping_address: string | null;
  shipping_city: string | null;
  shipping_state: string | null;
  shipping_zip: string | null;
  shipping_country: string;
}) {
  const lines = [
    order.shipping_name,
    order.shipping_address,
    [order.shipping_city, order.shipping_state, order.shipping_zip]
      .filter(Boolean)
      .join(", "),
    order.shipping_country,
  ].filter(Boolean);

  return lines;
}

export default async function AccountAddressesPage() {
  const user = await getUser();
  if (!user) return null;

  const orders = await getUserOrders(user.id);
  const withAddress = orders.find(
    (o) => o.shipping_address && o.shipping_name
  );

  return (
    <AccountMainPanel>
      <div className="px-4 sm:px-6 py-5 border-b border-slate-100">
        <h1 className="text-xl font-bold text-slate-900">Shipping address</h1>
        <p className="text-sm text-slate-500 mt-1">
          Address from your most recent order
        </p>
      </div>

      <div className="px-4 sm:px-6 py-6">
        {withAddress ? (
          <div className="rounded-lg border border-slate-200 p-5 max-w-md">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <address className="not-italic text-sm text-slate-700 leading-relaxed">
                {formatAddress(withAddress).map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </address>
            </div>
            <p className="text-xs text-slate-400 mt-4">
              Used on order #{withAddress.id.slice(0, 8).toUpperCase()}
            </p>
          </div>
        ) : (
          <div className="py-12 text-center">
            <MapPin className="w-12 h-12 mx-auto text-slate-300 mb-4" />
            <p className="text-slate-600 font-medium">No saved address yet</p>
            <p className="text-sm text-slate-400 mt-1 mb-6">
              Your shipping address is saved when you complete checkout.
            </p>
            <Link
              href="/shop"
              className="inline-flex bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary-dark"
            >
              Shop now
            </Link>
          </div>
        )}
      </div>
    </AccountMainPanel>
  );
}
