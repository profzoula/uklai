import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getProfile, getUser } from "@/lib/supabase/server";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!isSupabaseConfigured()) {
    redirect("/?error=supabase_required");
  }

  const user = await getUser();
  if (!user) {
    redirect("/auth/login?next=/admin");
  }

  const profile = await getProfile();
  if (!profile?.is_admin) {
    redirect("/auth/login?next=/admin&error=admin_required");
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <a
        href="#admin-main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-white focus:text-primary focus:rounded-lg focus:shadow-lg focus:ring-2 focus:ring-primary"
      >
        Skip to main content
      </a>
      <AdminSidebar />
      <div className="lg:pl-64 min-h-screen flex flex-col">
        <AdminHeader />
        <main id="admin-main" className="flex-1 p-6 lg:p-8" tabIndex={-1}>
          {children}
        </main>
      </div>
    </div>
  );
}
