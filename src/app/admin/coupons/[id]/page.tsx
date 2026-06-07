import { notFound } from "next/navigation";
import { getCouponById } from "@/lib/admin-data";
import { CouponForm } from "@/components/admin/CouponForm";

type Props = { params: Promise<{ id: string }> };

export default async function EditCouponPage({ params }: Props) {
  const { id } = await params;
  const coupon = await getCouponById(id);
  if (!coupon) notFound();
  return <CouponForm coupon={coupon} />;
}
