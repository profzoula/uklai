import { notFound } from "next/navigation";
import { getCollectionWithProducts } from "@/lib/admin-data";
import { CollectionForm } from "@/components/admin/CollectionForm";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function EditCollectionPage({ params }: Props) {
  const { id } = await params;
  const data = await getCollectionWithProducts(id);
  if (!data) notFound();

  return (
    <CollectionForm
      collection={data.collection}
      initialProducts={data.products}
    />
  );
}
