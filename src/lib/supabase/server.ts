import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

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

async function ensureProfileForUser(user: {
  id: string;
  email?: string | null;
  user_metadata?: Record<string, unknown>;
}) {
  const email = user.email?.toLowerCase() ?? "";
  const isAdmin = getAdminEmails().includes(email);

  const row = {
    id: user.id,
    email: user.email ?? email,
    full_name:
      (user.user_metadata?.full_name as string | undefined) ??
      (user.user_metadata?.name as string | undefined) ??
      null,
    avatar_url: (user.user_metadata?.avatar_url as string | undefined) ?? null,
    is_admin: isAdmin,
    updated_at: new Date().toISOString(),
  };

  const { createServiceClient } = await import("@/lib/supabase/service");
  const service = createServiceClient();
  if (!service) return null;

  const { data, error } = await service
    .from("profiles")
    .upsert(row, { onConflict: "id" })
    .select("*")
    .single();

  if (error) return null;
  return data;
}

export async function requireAdmin() {
  const profile = await getProfile();
  if (!profile?.is_admin) {
    throw new Error("Unauthorized");
  }
  return profile;
}
