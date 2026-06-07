import { notFound } from "next/navigation";
import { getOrderById } from "@/lib/data";
import { OrderDetailPanel } from "@/components/admin/OrderDetailPanel";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function AdminOrderDetailPage({ params }: Props) {
  const { id } = await params;
  const order = await getOrderById(id);
  if (!order) notFound();

  return <OrderDetailPanel order={order} />;
}
