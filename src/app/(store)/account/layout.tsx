import { redirect } from "next/navigation";
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
    <div className="bg-slate-50 min-h-[calc(100vh-4rem)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <div className="grid lg:grid-cols-[240px_minmax(0,1fr)] gap-4 lg:gap-6 items-start">
          <AccountNav isAdmin={profile?.is_admin === true} />
          <div className="min-w-0">{children}</div>
        </div>
      </div>
    </div>
  );
}
