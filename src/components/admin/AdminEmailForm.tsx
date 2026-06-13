"use client";

import { useState } from "react";
import { Mail } from "lucide-react";

type Props = {
  to?: string;
  toLabel?: string;
  audience?: "newsletter";
  subscriberCount?: number;
  title?: string;
  description?: string;
};

export function AdminEmailForm({
  to,
  toLabel,
  audience,
  subscriberCount = 0,
  title = "Send email",
  description,
}: Props) {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setFeedback(null);

    const isNewsletter = audience === "newsletter";
    if (isNewsletter && subscriberCount === 0) {
      setFeedback({ type: "error", text: "No subscribers to email yet." });
      setLoading(false);
      return;
    }

    if (
      isNewsletter &&
      !window.confirm(
        `Send this email to ${subscriberCount} newsletter subscriber${
          subscriberCount === 1 ? "" : "s"
        }?`
      )
    ) {
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/admin/emails/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to,
          audience,
          subject,
          message,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Could not send email.");
      }

      setFeedback({
        type: "success",
        text:
          data.sent > 1
            ? `Email sent to ${data.sent} recipients.`
            : "Email sent successfully.",
      });
      setSubject("");
      setMessage("");
    } catch (err) {
      setFeedback({
        type: "error",
        text: err instanceof Error ? err.message : "Could not send email.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6">
      <div className="flex items-start gap-3 mb-4">
        <span className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
          <Mail className="w-5 h-5" />
        </span>
        <div>
          <h2 className="font-bold text-slate-900">{title}</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            {description ??
              (audience === "newsletter"
                ? `Send a message to ${subscriberCount} newsletter subscriber${
                    subscriberCount === 1 ? "" : "s"
                  }.`
                : `Send a message to ${toLabel ?? to}.`)}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {to && (
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1.5">
              To
            </label>
            <input
              type="email"
              value={to}
              readOnly
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 text-slate-600"
            />
          </div>
        )}

        <div>
          <label
            htmlFor="admin-email-subject"
            className="text-sm font-medium text-slate-700 block mb-1.5"
          >
            Subject
          </label>
          <input
            id="admin-email-subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
            maxLength={200}
            placeholder="New deals this week"
            className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div>
          <label
            htmlFor="admin-email-message"
            className="text-sm font-medium text-slate-700 block mb-1.5"
          >
            Message
          </label>
          <textarea
            id="admin-email-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            rows={6}
            maxLength={8000}
            placeholder="Write your message to the customer..."
            className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {feedback && (
          <p
            role="alert"
            className={`text-sm px-3 py-2 rounded-lg ${
              feedback.type === "success"
                ? "bg-green-50 text-green-700"
                : "bg-red-50 text-red-700"
            }`}
          >
            {feedback.text}
          </p>
        )}

        <button
          type="submit"
          disabled={loading || (audience === "newsletter" && subscriberCount === 0)}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-dark disabled:opacity-50"
        >
          <Mail className="w-4 h-4" />
          {loading
            ? "Sending..."
            : audience === "newsletter"
              ? `Send to ${subscriberCount} subscriber${
                  subscriberCount === 1 ? "" : "s"
                }`
              : "Send email"}
        </button>
      </form>
    </section>
  );
}
