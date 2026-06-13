import { getNewsletterSubscribers } from "@/lib/admin-data";
import { formatDate } from "@/lib/utils";
import { AdminEmailForm } from "@/components/admin/AdminEmailForm";

export const dynamic = "force-dynamic";

export default async function AdminNewsletterPage() {
  const subscribers = await getNewsletterSubscribers();

  const csvRows = [
    "email,subscribed_at",
    ...subscribers.map(
      (s: { email: string; subscribed_at: string }) =>
        `${s.email},${s.subscribed_at}`
    ),
  ].join("\n");

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Newsletter</h1>
          <p className="text-slate-500 mt-1">
            {subscribers.length} subscriber{subscribers.length !== 1 ? "s" : ""}
          </p>
        </div>
        {subscribers.length > 0 && (
          <a
            href={`data:text/csv;charset=utf-8,${encodeURIComponent(csvRows)}`}
            download="newsletter-subscribers.csv"
            className="inline-flex items-center px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-dark"
          >
            Export CSV
          </a>
        )}
      </div>

      <div className="mb-8">
        <AdminEmailForm
          audience="newsletter"
          subscriberCount={subscribers.length}
          title="Send newsletter email"
          description="Broadcast a promotional or update email to everyone on your newsletter list."
        />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {subscribers.length === 0 ? (
          <p className="p-12 text-center text-slate-500 text-sm">
            No subscribers yet. They appear when customers sign up via the newsletter widget.
          </p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left text-xs font-semibold text-slate-500 uppercase px-6 py-4">
                  Email
                </th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase px-6 py-4">
                  Subscribed
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {subscribers.map((sub: { id: string; email: string; subscribed_at: string }) => (
                <tr key={sub.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 text-sm font-medium text-slate-900">
                    {sub.email}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {formatDate(sub.subscribed_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
