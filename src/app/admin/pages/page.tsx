import { AdminTable } from "@/components/admin/AdminTable";
import { AdminRowActions } from "@/components/admin/AdminRowActions";
import { getCmsPages } from "@/lib/admin-data";

export default async function AdminPagesPage() {
  const pages = await getCmsPages();

  return (
    <AdminTable
      title="Pages"
      description={`Manage static content pages (${pages.length} pages)`}
      addLabel="Add Page"
      addHref="/admin/pages/new"
      data={pages}
      getRowHref={(row) => `/admin/pages/${row.id}`}
      columns={[
        {
          key: "title",
          header: "Page",
          render: (row) => (
            <div>
              <p className="font-medium text-sm text-slate-900">{row.title}</p>
              <p className="text-xs text-slate-400">/{row.slug}</p>
            </div>
          ),
        },
        {
          key: "status",
          header: "Status",
          render: (row) => (
            <span
              className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${
                row.status === "published"
                  ? "bg-green-50 text-green-600"
                  : "bg-amber-50 text-amber-600"
              }`}
            >
              {row.status}
            </span>
          ),
        },
        {
          key: "actions",
          header: "Actions",
          align: "right",
          render: (row) => (
            <AdminRowActions
              deleteUrl={`/api/admin/pages/${row.id}`}
              label={row.title}
            />
          ),
        },
      ]}
    />
  );
}
