import { AdminTable } from "@/components/admin/AdminTable";
import { AdminRowActions } from "@/components/admin/AdminRowActions";
import { getCoupons } from "@/lib/admin-data";
import { formatDate } from "@/lib/utils";

export default async function AdminCouponsPage() {
  const coupons = await getCoupons();

  return (
    <AdminTable
      title="Coupons"
      description={`Manage discount codes and promotions (${coupons.length} coupons)`}
      addLabel="Add Coupon"
      addHref="/admin/coupons/new"
      data={coupons}
      getRowHref={(row) => `/admin/coupons/${row.id}`}
      columns={[
        {
          key: "code",
          header: "Code",
          render: (row) => (
            <span className="font-mono text-sm font-semibold text-primary bg-primary-light px-2.5 py-1 rounded">
              {row.code}
            </span>
          ),
        },
        {
          key: "discount",
          header: "Discount",
          render: (row) => (
            <span className="text-sm font-medium text-slate-900">
              {row.type === "percentage"
                ? `${row.value}%`
                : `$${row.value.toFixed(2)}`}
            </span>
          ),
        },
        {
          key: "usage",
          header: "Usage",
          render: (row) => (
            <span className="text-sm text-slate-600">
              {row.usage_count}
              {row.usage_limit ? ` / ${row.usage_limit}` : " / ∞"}
            </span>
          ),
        },
        {
          key: "expires",
          header: "Expires",
          render: (row) => (
            <span className="text-sm text-slate-500">
              {row.expires_at ? formatDate(row.expires_at) : "Never"}
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
              deleteUrl={`/api/admin/coupons/${row.id}`}
              label={row.code}
            />
          ),
        },
      ]}
    />
  );
}
