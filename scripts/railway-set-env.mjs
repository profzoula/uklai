/**
 * Push env vars from .env.local to Railway (run after `railway link`).
 * Usage: node scripts/railway-set-env.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const envPath = path.join(root, ".env.local");

const KEYS = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "NEXT_PUBLIC_APP_URL",
  "STRIPE_SECRET_KEY",
  "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "STRIPE_TAX_ENABLED",
  "SENDGRID_API_KEY",
  "RESEND_API_KEY",
  "EMAIL_FROM",
  "ADMIN_EMAILS",
  "NEXT_PUBLIC_USE_MOCK_DATA",
];

function loadEnvFile(filename) {
  const filePath = path.join(root, filename);
  if (!fs.existsSync(filePath)) return {};
  const out = {};
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
    out[key] = value;
  }
  return out;
}

const env = loadEnvFile(".env.local");
const missing = KEYS.filter((key) => !env[key]?.trim());

if (!fs.existsSync(envPath)) {
  console.error("Missing .env.local");
  process.exit(1);
}

if (missing.length) {
  console.warn("Missing values (set in Railway dashboard):", missing.join(", "));
}

console.log("Setting Railway variables…");

for (const key of KEYS) {
  const value = env[key]?.trim();
  if (!value) continue;

  const result = spawnSync("railway", ["variables", "set", `${key}=${value}`], {
    stdio: "inherit",
    shell: process.platform === "win32",
  });

  if (result.status !== 0) {
    console.error(`Failed to set ${key}. Run: railway login && railway link`);
    process.exit(result.status ?? 1);
  }

  console.log(`✓ ${key}`);
}

console.log("\nDone. Redeploy with: railway up");
