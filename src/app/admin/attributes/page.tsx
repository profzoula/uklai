import { AdminTable } from "@/components/admin/AdminTable";
import { AdminRowActions } from "@/components/admin/AdminRowActions";
import { getAttributes } from "@/lib/admin-data";

export default async function AdminAttributesPage() {
  const attributes = await getAttributes();

  return (
    <AdminTable
      title="Attributes"
      description={`Define product attributes like color, size, and material (${attributes.length} attributes)`}
      addLabel="Add Attribute"
      addHref="/admin/attributes/new"
      data={attributes}
      getRowHref={(row) => `/admin/attributes/${row.id}`}
      columns={[
        {
          key: "name",
          header: "Attribute",
          render: (row) => (
            <div>
              <p className="font-medium text-sm text-slate-900">{row.name}</p>
              <p className="text-xs text-slate-400">{row.slug}</p>
            </div>
          ),
        },
        {
          key: "type",
          header: "Type",
          render: (row) => (
            <span className="text-xs font-medium bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full capitalize">
              {row.type}
            </span>
          ),
        },
        {
          key: "values",
          header: "Values",
          render: (row) => (
            <div className="flex flex-wrap gap-1 max-w-xs">
              {row.values.slice(0, 4).map((v) => (
                <span
                  key={v}
                  className="text-xs bg-primary-light text-primary px-2 py-0.5 rounded"
                >
                  {v}
                </span>
              ))}
              {row.values.length > 4 && (
                <span className="text-xs text-slate-400">
                  +{row.values.length - 4} more
                </span>
              )}
            </div>
          ),
        },
        {
          key: "actions",
          header: "Actions",
          align: "right",
          render: (row) => (
            <AdminRowActions
              deleteUrl={`/api/admin/attributes/${row.id}`}
              label={row.name}
            />
          ),
        },
      ]}
    />
  );
}
