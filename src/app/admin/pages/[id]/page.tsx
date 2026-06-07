import { notFound } from "next/navigation";
import { getCmsPageById } from "@/lib/admin-data";
import { CmsPageForm } from "@/components/admin/CmsPageForm";

type Props = { params: Promise<{ id: string }> };

export default async function EditCmsPage({ params }: Props) {
  const { id } = await params;
  const page = await getCmsPageById(id);
  if (!page) notFound();
  return <CmsPageForm page={page} />;
}
