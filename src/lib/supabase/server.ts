import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { ensureProfileForUser } from "@/lib/profile-sync";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server Component — ignore
          }
        },
      },
    }
  );
}

export async function getUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

function getAdminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "uklaistore@gmail.com,profzoula@gmail.com")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export async function getProfile() {
  const user = await getUser();
  if (!user) return null;

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  const shouldBeAdmin = getAdminEmails().includes(
    user.email?.toLowerCase() ?? ""
  );

  if (profile) {
    if (shouldBeAdmin && !profile.is_admin) {
      return ensureProfileForUser(user);
    }
    return profile;
  }

  return ensureProfileForUser(user);
}

export async function requireAdmin() {
  const profile = await getProfile();
  if (!profile?.is_admin) {
    throw new Error("Unauthorized");
  }
  return profile;
}
