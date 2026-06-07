import { Plus } from "lucide-react";
import Link from "next/link";
import { AdminClickableRow } from "@/components/admin/AdminClickableRow";

type Column<T> = {
  key: string;
  header: string;
  render: (row: T) => React.ReactNode;
  align?: "left" | "right";
};

type Props<T> = {
  title: string;
  description: string;
  addLabel?: string;
  addHref?: string;
  columns: Column<T>[];
  data: T[];
  emptyMessage?: string;
  getRowHref?: (row: T) => string;
};

export function AdminTable<T extends { id: string }>({
  title,
  description,
  addLabel,
  addHref,
  columns,
  data,
  emptyMessage = "No items yet.",
  getRowHref,
}: Props<T>) {
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
          <p className="text-slate-500 mt-1">{description}</p>
        </div>
        {addLabel && addHref && (
          <Link
            href={addHref}
            className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary-dark transition-colors"
          >
            <Plus className="w-4 h-4" />
            {addLabel}
          </Link>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {data.length === 0 ? (
          <p className="text-slate-500 text-sm p-12 text-center">{emptyMessage}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  {columns.map((col) => (
                    <th
                      key={col.key}
                      className={`text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4 ${
                        col.align === "right" ? "text-right" : "text-left"
                      }`}
                    >
                      {col.header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.map((row) => {
                  const cells = columns.map((col) => (
                    <td
                      key={col.key}
                      className={`px-6 py-4 ${
                        col.align === "right" ? "text-right" : ""
                      }`}
                    >
                      {col.render(row)}
                    </td>
                  ));

                  if (getRowHref) {
                    return (
                      <AdminClickableRow
                        key={row.id}
                        href={getRowHref(row)}
                      >
                        {cells}
                      </AdminClickableRow>
                    );
                  }

                  return (
                    <tr key={row.id} className="hover:bg-slate-50">
                      {cells}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
