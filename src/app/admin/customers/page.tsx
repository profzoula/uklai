import Link from "next/link";
import { AdminTable } from "@/components/admin/AdminTable";
import { getCustomers } from "@/lib/admin-data";
import { formatPrice, formatDate } from "@/lib/utils";

export default async function AdminCustomersPage() {
  const customers = await getCustomers();

  return (
    <AdminTable
      title="Customers"
      description={`Registered accounts and guest buyers (${customers.length} customers)`}
      data={customers}
      emptyMessage="No customers yet. They appear here after sign-up or checkout."
      columns={[
        {
          key: "name",
          header: "Customer",
          render: (row) => (
            <div>
              {String(row.id).startsWith("guest:") ? (
                <p className="font-medium text-sm text-slate-900">
                  {row.full_name}
                  <span className="ml-2 text-xs font-normal text-slate-400">
                    Guest
                  </span>
                </p>
              ) : (
                <Link
                  href={`/admin/customers/${row.id}`}
                  className="font-medium text-sm text-primary hover:underline"
                >
                  {row.full_name}
                </Link>
              )}
              <p className="text-xs text-slate-400">{row.email}</p>
            </div>
          ),
        },
        {
          key: "orders",
          header: "Orders",
          render: (row) => (
            <span className="text-sm font-medium text-slate-700">
              {row.orders_count}
            </span>
          ),
        },
        {
          key: "spent",
          header: "Total Spent",
          render: (row) => (
            <span className="text-sm font-semibold text-slate-900">
              {formatPrice(row.total_spent)}
            </span>
          ),
        },
        {
          key: "joined",
          header: "Joined",
          render: (row) => (
            <span className="text-sm text-slate-500">
              {formatDate(row.created_at)}
            </span>
          ),
        },
      ]}
    />
  );
}
