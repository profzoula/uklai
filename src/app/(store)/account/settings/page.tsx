import Link from "next/link";
import { getUser, getProfile } from "@/lib/supabase/server";
import { AccountMainPanel } from "@/components/store/AccountMainPanel";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Settings | My Account | UKLAI",
};

export default async function AccountSettingsPage() {
  const user = await getUser();
  if (!user) return null;

  const profile = await getProfile();

  return (
    <AccountMainPanel>
      <div className="px-4 sm:px-6 py-5 border-b border-slate-100">
        <h1 className="text-xl font-bold text-slate-900">Settings</h1>
        <p className="text-sm text-slate-500 mt-1">
          Your account details and preferences
        </p>
      </div>

      <div className="px-4 sm:px-6 py-6 space-y-6">
        <dl className="divide-y divide-slate-100 rounded-lg border border-slate-200">
          <div className="px-4 py-4 sm:grid sm:grid-cols-3 sm:gap-4">
            <dt className="text-sm font-medium text-slate-500">Full name</dt>
            <dd className="mt-1 text-sm text-slate-900 sm:col-span-2 sm:mt-0">
              {profile?.full_name ?? "—"}
            </dd>
          </div>
          <div className="px-4 py-4 sm:grid sm:grid-cols-3 sm:gap-4">
            <dt className="text-sm font-medium text-slate-500">Email</dt>
            <dd className="mt-1 text-sm text-slate-900 sm:col-span-2 sm:mt-0">
              {user.email}
            </dd>
          </div>
          <div className="px-4 py-4 sm:grid sm:grid-cols-3 sm:gap-4">
            <dt className="text-sm font-medium text-slate-500">Member since</dt>
            <dd className="mt-1 text-sm text-slate-900 sm:col-span-2 sm:mt-0">
              {profile?.created_at ? formatDate(profile.created_at) : "—"}
            </dd>
          </div>
        </dl>

        <p className="text-sm text-slate-500">
          To update your name or password,{" "}
          <Link href="/contact" className="text-primary font-semibold hover:underline">
            contact support
          </Link>
          .
        </p>
      </div>
    </AccountMainPanel>
  );
}
