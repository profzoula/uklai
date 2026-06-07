import { AdminTable } from "@/components/admin/AdminTable";
import { AdminRowActions } from "@/components/admin/AdminRowActions";
import { getCollections } from "@/lib/admin-data";

export default async function AdminCollectionsPage() {
  const collections = await getCollections();

  return (
    <AdminTable
      title="Collections"
      description={`Group products into curated collections (${collections.length} collections)`}
      addLabel="Add Collection"
      addHref="/admin/collections/new"
      data={collections}
      getRowHref={(row) => `/admin/collections/${row.id}`}
      columns={[
        {
          key: "name",
          header: "Collection",
          render: (row) => (
            <div>
              <p className="font-medium text-sm text-slate-900">{row.name}</p>
              <p className="text-xs text-slate-400">{row.slug}</p>
            </div>
          ),
        },
        {
          key: "description",
          header: "Description",
          render: (row) => (
            <p className="text-sm text-slate-600 max-w-xs truncate">
              {row.description ?? "—"}
            </p>
          ),
        },
        {
          key: "products",
          header: "Products",
          render: (row) => (
            <span className="text-sm font-medium text-slate-700">
              {row.product_count}
            </span>
          ),
        },
        {
          key: "status",
          header: "Status",
          render: (row) => (
            <span
              className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                row.active
                  ? "bg-green-50 text-green-600"
                  : "bg-red-50 text-red-500"
              }`}
            >
              {row.active ? "Active" : "Inactive"}
            </span>
          ),
        },
        {
          key: "actions",
          header: "Actions",
          align: "right",
          render: (row) => (
            <AdminRowActions
              deleteUrl={`/api/admin/collections/${row.id}`}
              label={row.name}
            />
          ),
        },
      ]}
    />
  );
}
