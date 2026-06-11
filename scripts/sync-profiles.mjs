/**
 * Sync auth.users → profiles and grant admin to store emails.
 * Usage: node scripts/sync-profiles.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

function loadEnvFile(filename) {
  const filePath = path.join(root, filename);
  if (!fs.existsSync(filePath)) return;
  for (const line of fs.readFileSync(filePath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnvFile(".env.local");

const ADMIN_EMAILS = (
  process.env.ADMIN_EMAILS ??
  "uklaistore@gmail.com,profzoula@gmail.com"
)
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Missing Supabase env vars in .env.local");
  process.exit(1);
}

const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const { data: list, error: listError } = await supabase.auth.admin.listUsers({
  perPage: 1000,
});

if (listError) {
  console.error("Failed to list users:", listError.message);
  process.exit(1);
}

const users = list.users ?? [];
console.log(`Found ${users.length} auth users`);

let synced = 0;
for (const user of users) {
  const email = user.email?.toLowerCase() ?? "";
  const isAdmin = ADMIN_EMAILS.includes(email);

  const { error } = await supabase.from("profiles").upsert(
    {
      id: user.id,
      email: user.email ?? email,
      full_name:
        user.user_metadata?.full_name ??
        user.user_metadata?.name ??
        null,
      avatar_url: user.user_metadata?.avatar_url ?? null,
      is_admin: isAdmin,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" }
  );

  if (error) {
    console.error(`✗ ${email}: ${error.message}`);
  } else {
    synced++;
    console.log(`${isAdmin ? "★ ADMIN" : "  user "} ${user.email}`);
  }
}

console.log(`\nSynced ${synced}/${users.length} profiles.`);
console.log("Admin emails:", ADMIN_EMAILS.join(", "));
