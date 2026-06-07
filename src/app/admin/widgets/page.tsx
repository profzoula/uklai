import { AdminTable } from "@/components/admin/AdminTable";
import { AdminRowActions } from "@/components/admin/AdminRowActions";
import { getWidgets } from "@/lib/admin-data";

export default async function AdminWidgetsPage() {
  const widgets = await getWidgets();

  return (
    <AdminTable
      title="Widgets"
      description={`Configure homepage and layout widgets (${widgets.length} widgets)`}
      addLabel="Add Widget"
      addHref="/admin/widgets/new"
      data={widgets}
      getRowHref={(row) => `/admin/widgets/${row.id}`}
      columns={[
        {
          key: "name",
          header: "Widget",
          render: (row) => (
            <p className="font-medium text-sm text-slate-900">{row.name}</p>
          ),
        },
        {
          key: "type",
          header: "Type",
          render: (row) => (
            <span className="text-xs font-medium bg-primary-light text-primary px-2.5 py-1 rounded-full capitalize">
              {row.type}
            </span>
          ),
        },
        {
          key: "location",
          header: "Location",
          render: (row) => (
            <span className="text-sm text-slate-600">{row.location}</span>
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
              deleteUrl={`/api/admin/widgets/${row.id}`}
              label={row.name}
            />
          ),
        },
      ]}
    />
  );
}
