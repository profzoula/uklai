import { notFound } from "next/navigation";
import { getProductByIdAdmin } from "@/lib/data";
import { ProductForm } from "@/components/admin/ProductForm";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditProductPage({ params }: Props) {
  const { id } = await params;
  const product = await getProductByIdAdmin(id);

  if (!product) notFound();

  return <ProductForm product={product} />;
}
