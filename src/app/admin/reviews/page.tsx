import { getProductReviews } from "@/lib/admin-data";
import { formatDate } from "@/lib/utils";
import { ReviewStatusActions } from "@/components/admin/ReviewStatusActions";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminReviewsPage() {
  const reviews = await getProductReviews();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Reviews</h1>
        <p className="text-slate-500 mt-1">
          Moderate customer product reviews ({reviews.length})
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {reviews.length === 0 ? (
          <p className="p-12 text-center text-slate-500 text-sm">
            No reviews yet. Approved reviews update product ratings automatically.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase px-6 py-4">
                    Product
                  </th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase px-6 py-4">
                    Review
                  </th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase px-6 py-4">
                    Rating
                  </th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase px-6 py-4">
                    Status
                  </th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase px-6 py-4">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reviews.map(
                  (row: {
                    id: string;
                    product_id: string;
                    customer_name: string;
                    rating: number;
                    title: string | null;
                    body: string | null;
                    status: "pending" | "approved" | "rejected";
                    created_at: string;
                    products?: { name: string; slug: string } | null;
                  }) => (
                    <tr key={row.id} className="hover:bg-slate-50 align-top">
                      <td className="px-6 py-4 text-sm">
                        {row.products ? (
                          <Link
                            href={`/products/${row.products.slug}`}
                            className="text-primary hover:underline font-medium"
                          >
                            {row.products.name}
                          </Link>
                        ) : (
                          row.product_id.slice(0, 8)
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm max-w-sm">
                        <p className="font-medium text-slate-900">{row.customer_name}</p>
                        {row.title && <p className="font-semibold">{row.title}</p>}
                        {row.body && (
                          <p className="text-slate-500 text-xs mt-1 line-clamp-2">
                            {row.body}
                          </p>
                        )}
                        <p className="text-xs text-slate-400 mt-1">
                          {formatDate(row.created_at)}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold">
                        {row.rating}/5
                      </td>
                      <td className="px-6 py-4 text-sm capitalize">{row.status}</td>
                      <td className="px-6 py-4">
                        <ReviewStatusActions row={row} />
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
