import { getUser } from "@/lib/supabase/server";
import { getUserOrders } from "@/lib/account-data";
import { getProducts } from "@/lib/data";
import { AccountMainPanel } from "@/components/store/AccountMainPanel";
import { AccountOrdersPanel } from "@/components/store/AccountOrdersPanel";
import { MoreToLoveSection } from "@/components/store/MoreToLoveSection";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Orders | My Account | UKLAI",
};

export default async function AccountOrdersPage() {
  const user = await getUser();
  if (!user) return null;

  const [orders, products] = await Promise.all([
    getUserOrders(user.id),
    getProducts({ featured: true, limit: 12 }),
  ]);

  return (
    <>
      <AccountMainPanel>
        <AccountOrdersPanel orders={orders} />
      </AccountMainPanel>
      <MoreToLoveSection products={products} />
    </>
  );
}
