import { getReturnRequests } from "@/lib/admin-data";
import { formatDate } from "@/lib/utils";
import { ReturnRequestActions } from "@/components/admin/ReturnRequestActions";

export const dynamic = "force-dynamic";

export default async function AdminReturnsPage() {
  const returns = await getReturnRequests();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Returns (RMA)</h1>
        <p className="text-slate-500 mt-1">
          Manage return and refund requests ({returns.length})
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {returns.length === 0 ? (
          <p className="p-12 text-center text-slate-500 text-sm">
            No return requests yet. Customers can submit from the Returns policy page.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase px-6 py-4">
                    Customer
                  </th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase px-6 py-4">
                    Order
                  </th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase px-6 py-4">
                    Reason
                  </th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase px-6 py-4">
                    Date
                  </th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase px-6 py-4">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {returns.map(
                  (row: {
                    id: string;
                    customer_email: string;
                    order_number: string | null;
                    reason: string;
                    status: "pending" | "approved" | "rejected" | "completed";
                    admin_notes: string | null;
                    created_at: string;
                  }) => (
                    <tr key={row.id} className="hover:bg-slate-50 align-top">
                      <td className="px-6 py-4 text-sm">{row.customer_email}</td>
                      <td className="px-6 py-4 text-sm text-slate-500">
                        {row.order_number ?? "—"}
                      </td>
                      <td className="px-6 py-4 text-sm max-w-xs">{row.reason}</td>
                      <td className="px-6 py-4 text-sm text-slate-500">
                        {formatDate(row.created_at)}
                      </td>
                      <td className="px-6 py-4">
                        <ReturnRequestActions row={row} />
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
