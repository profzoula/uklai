import { notFound } from "next/navigation";
import { getAttributeById } from "@/lib/admin-data";
import { AttributeForm } from "@/components/admin/AttributeForm";

type Props = { params: Promise<{ id: string }> };

export default async function EditAttributePage({ params }: Props) {
  const { id } = await params;
  const attribute = await getAttributeById(id);
  if (!attribute) notFound();
  return <AttributeForm attribute={attribute} />;
}
