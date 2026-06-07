"use client";

import type { Product, ProductType } from "@/types/database";
import { PhysicalProductForm } from "@/components/admin/PhysicalProductForm";
import { DigitalProductForm } from "@/components/admin/DigitalProductForm";

type Props = {
  product?: Product;
  productType?: ProductType;
};

export function ProductForm({ product, productType }: Props) {
  const type: ProductType =
    product?.product_type ?? productType ?? "physical";

  if (type === "digital") {
    return <DigitalProductForm product={product} />;
  }

  return <PhysicalProductForm product={product} />;
}
