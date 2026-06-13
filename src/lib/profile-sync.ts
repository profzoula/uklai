import "server-only";

import type { User } from "@supabase/supabase-js";
import { createServiceClient } from "@/lib/supabase/service";

function getAdminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "uklaistore@gmail.com,profzoula@gmail.com")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

function metadataString(
  metadata: Record<string, unknown> | undefined,
  ...keys: string[]
): string | null {
  if (!metadata) return null;
  for (const key of keys) {
    const value = metadata[key];
    if (typeof value === "string" && value.trim()) return value;
  }
  return null;
}

export async function ensureProfileForUser(user: User) {
  const service = createServiceClient();
  if (!service) return null;

  const email =
    user.email?.toLowerCase() ??
    metadataString(user.user_metadata, "email")?.toLowerCase() ??
    "";
  const isAdmin = getAdminEmails().includes(email);

  const row = {
    id: user.id,
    email: user.email ?? email,
    full_name:
      metadataString(user.user_metadata, "full_name", "name") ?? null,
    avatar_url:
      metadataString(user.user_metadata, "avatar_url", "picture") ?? null,
    is_admin: isAdmin,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await service
    .from("profiles")
    .upsert(row, { onConflict: "id" })
    .select("*")
    .single();

  if (error) {
    console.error("ensureProfileForUser failed:", error.message);
    return null;
  }

  return data;
}
