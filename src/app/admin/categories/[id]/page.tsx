import { notFound } from "next/navigation";
import { getCategoryByIdAdmin } from "@/lib/data";
import { CategoryForm } from "@/components/admin/CategoryForm";

type Props = { params: Promise<{ id: string }> };

export default async function EditCategoryPage({ params }: Props) {
  const { id } = await params;
  const category = await getCategoryByIdAdmin(id);
  if (!category) notFound();
  return <CategoryForm category={category} />;
}
