import { notFound } from "next/navigation";
import { getWidgetById } from "@/lib/admin-data";
import { WidgetForm } from "@/components/admin/WidgetForm";

type Props = { params: Promise<{ id: string }> };

export default async function EditWidgetPage({ params }: Props) {
  const { id } = await params;
  const widget = await getWidgetById(id);
  if (!widget) notFound();
  return <WidgetForm widget={widget} />;
}
