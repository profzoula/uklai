import { notFound } from "next/navigation";
import { ProductForm } from "@/components/admin/ProductForm";
import type { ProductType } from "@/types/database";

type Props = {
  params: Promise<{ type: string }>;
};

export default async function NewProductByTypePage({ params }: Props) {
  const { type } = await params;

  if (type !== "physical" && type !== "digital") {
    notFound();
  }

  return <ProductForm productType={type as ProductType} />;
}
