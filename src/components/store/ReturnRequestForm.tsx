"use client";

import { useState } from "react";

type Props = {
  storeEmail: string;
};

export function ReturnRequestForm({ storeEmail }: Props) {
  const [email, setEmail] = useState("");
  const [orderNumber, setOrderNumber] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const res = await fetch("/api/returns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_email: email,
          order_number: orderNumber,
          reason,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to submit");
      setMessage("Return request submitted. We'll email you within 1–2 business days.");
      setEmail("");
      setOrderNumber("");
      setReason("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mt-10 pt-8 border-t border-slate-200 not-prose">
      <h2 className="text-lg font-bold text-slate-900 mb-2">Start a return</h2>
      <p className="text-sm text-slate-600 mb-4">
        Submit a request below or email{" "}
        <a href={`mailto:${storeEmail}`} className="text-primary hover:underline">
          {storeEmail}
        </a>
        .
      </p>

      <form onSubmit={submit} className="space-y-4 max-w-md">
        <div>
          <label className="text-sm font-medium text-slate-700 block mb-1">
            Email
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700 block mb-1">
            Order number (optional)
          </label>
          <input
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
            placeholder="From confirmation email"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700 block mb-1">
            Reason for return
          </label>
          <textarea
            required
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
          />
        </div>
        {message && (
          <p className="text-sm text-green-600 bg-green-50 px-3 py-2 rounded-lg">
            {message}
          </p>
        )}
        {error && (
          <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="bg-primary text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary-dark disabled:opacity-50"
        >
          {loading ? "Submitting..." : "Submit return request"}
        </button>
      </form>
    </section>
  );
}
