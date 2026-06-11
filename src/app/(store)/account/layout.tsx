import { redirect } from "next/navigation";
import Link from "next/link";
import { getUser, getProfile } from "@/lib/supabase/server";
import { AccountNav } from "@/components/store/AccountNav";

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();
  if (!user) {
    redirect("/auth/login?next=/account");
  }

  const profile = await getProfile();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">My account</h1>
        <p className="text-slate-500 text-sm mt-1">
          {profile?.full_name ?? "Customer"} · {user.email}
        </p>
      </div>

      <div className="grid lg:grid-cols-[220px_1fr] gap-8">
        <AccountNav isAdmin={profile?.is_admin === true} />
        <div>{children}</div>
      </div>

      <p className="mt-10 text-center text-sm text-slate-400">
        Need help?{" "}
        <Link href="/contact" className="text-primary hover:underline">
          Contact support
        </Link>
      </p>
    </div>
  );
}
