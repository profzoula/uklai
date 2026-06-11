import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getOrderById } from "@/lib/data";
import { getStoreSettings } from "@/lib/store-settings";
import { getUser } from "@/lib/supabase/server";
import { canViewOrderInvoice } from "@/lib/invoice-access";
import { OrderInvoice } from "@/components/store/OrderInvoice";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ session_id?: string; email?: string }>;
};

export default async function InvoicePage({ params, searchParams }: Props) {
  const { id } = await params;
  const query = await searchParams;
  const [order, settings, user] = await Promise.all([
    getOrderById(id),
    getStoreSettings(),
    getUser(),
  ]);

  if (!order) notFound();

  const allowed = canViewOrderInvoice(order, user, {
    sessionId: query.session_id,
    email: query.email,
  });

  if (!allowed) notFound();

  return (
    <>
      <div className="no-print max-w-3xl mx-auto mb-4">
        <Link
          href={user ? "/account/orders" : "/shop"}
          className="inline-flex items-center gap-1.5 text-sm text-primary hover:text-primary-dark font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          {user ? "Back to orders" : "Continue shopping"}
        </Link>
      </div>
      <OrderInvoice order={order} store={settings} />
    </>
  );
}
