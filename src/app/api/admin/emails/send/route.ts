import { NextResponse } from "next/server";
import { getAuthorizedAdminSupabase } from "@/lib/admin-api";
import { sendEmail } from "@/lib/email";
import { wrapAdminMessageHtml } from "@/lib/email-html";
import { getStoreSettings } from "@/lib/store-settings";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  const { supabase, error } = await getAuthorizedAdminSupabase();
  if (error) return error;
  if (!supabase) return NextResponse.json({ error: "Database unavailable." }, { status: 503 });

  const body = (await request.json()) as {
    to?: string;
    audience?: "newsletter";
    subject?: string;
    message?: string;
  };

  const subject = body.subject?.trim();
  const message = body.message?.trim();

  if (!subject || !message) {
    return NextResponse.json(
      { error: "Subject and message are required." },
      { status: 400 }
    );
  }

  if (subject.length > 200) {
    return NextResponse.json({ error: "Subject is too long." }, { status: 400 });
  }

  if (message.length > 8000) {
    return NextResponse.json({ error: "Message is too long." }, { status: 400 });
  }

  const settings = await getStoreSettings();
  const storeName = settings.store.name || "UKLAI";
  const html = wrapAdminMessageHtml(message, storeName);

  let recipients: string[] = [];

  if (body.audience === "newsletter") {
    const { data, error: subscribersError } = await supabase
      .from("newsletter_subscribers")
      .select("email");

    if (subscribersError) {
      return NextResponse.json({ error: subscribersError.message }, { status: 500 });
    }

    recipients = [
      ...new Set(
        (data ?? [])
          .map((row) => row.email?.trim().toLowerCase())
          .filter((email): email is string => !!email && EMAIL_RE.test(email))
      ),
    ];
  } else {
    const to = body.to?.trim().toLowerCase();
    if (!to || !EMAIL_RE.test(to)) {
      return NextResponse.json({ error: "A valid recipient email is required." }, { status: 400 });
    }
    recipients = [to];
  }

  if (!recipients.length) {
    return NextResponse.json({ error: "No recipients found." }, { status: 400 });
  }

  let sent = 0;
  const failures: string[] = [];

  for (const to of recipients) {
    const result = await sendEmail({ to, subject, html });
    if (result.ok) {
      sent += 1;
    } else if (result.skipped) {
      return NextResponse.json(
        {
          error:
            "Email provider is not configured. Add RESEND_API_KEY on Railway.",
        },
        { status: 503 }
      );
    } else {
      failures.push(to);
    }
  }

  if (!sent) {
    return NextResponse.json(
      { error: "Could not send email. Check Resend configuration." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    sent,
    failed: failures.length,
  });
}
