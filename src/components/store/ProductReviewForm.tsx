"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import Link from "next/link";

type Props = {
  productId: string;
  productSlug: string;
};

export function ProductReviewForm({ productId, productSlug }: Props) {
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [signedIn, setSignedIn] = useState<boolean | null>(null);

  async function checkAuth() {
    if (!isSupabaseConfigured()) return false;
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    setSignedIn(!!user);
    return !!user;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const authed = signedIn ?? (await checkAuth());
    if (!authed) {
      setError("sign_in_required");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: productId, rating, title, body }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to submit");
      setMessage(data.message);
      setTitle("");
      setBody("");
      setRating(5);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-6 pt-6 border-t border-slate-100">
      <h3 className="text-sm font-bold text-slate-900 mb-3">Write a review</h3>

      {message && (
        <p className="text-sm text-green-600 bg-green-50 px-3 py-2 rounded-lg mb-4">
          {message}
        </p>
      )}

      {error === "sign_in_required" ? (
        <p className="text-sm text-slate-600">
          <Link href={`/auth/login?next=/products/${productSlug}`} className="text-primary font-medium hover:underline">
            Sign in
          </Link>{" "}
          to leave a review.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3 max-w-lg">
          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1">
              Rating
            </label>
            <div className="flex gap-0.5 sm:gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRating(n)}
                  className="min-w-[44px] min-h-[44px] flex items-center justify-center"
                  aria-label={`${n} stars`}
                >
                  <Star
                    className={`w-6 h-6 ${
                      n <= rating
                        ? "fill-slate-900 text-slate-900"
                        : "text-slate-300"
                    }`}
                    strokeWidth={n <= rating ? 0 : 1.5}
                  />
                </button>
              ))}
            </div>
          </div>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Review title (optional)"
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
          />
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={3}
            placeholder="Share your experience..."
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
          />
          {error && error !== "sign_in_required" && (
            <p className="text-xs text-red-600">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-slate-800 disabled:opacity-50"
          >
            {loading ? "Submitting..." : "Submit review"}
          </button>
        </form>
      )}
    </div>
  );
}
