/**
 * Apply supabase/schema.sql to the UKLAI Supabase Postgres database.
 * Usage: node scripts/setup-database.mjs
 *
 * Requires DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME in env
 * (or pass via .env.local with those keys).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

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
loadEnvFile(".env");

const config = {
  host:
    process.env.DB_HOST ?? "db.jhxkeceefalhdehmgitz.supabase.co",
  port: Number(process.env.DB_PORT ?? 5432),
  user: process.env.DB_USER ?? "postgres",
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME ?? "postgres",
  ssl: { rejectUnauthorized: false },
};

if (!config.password) {
  console.error(
    "Missing DB_PASSWORD. Add it to .env.local (see .env.local.example)."
  );
  process.exit(1);
}

const schemaPath = path.join(root, "supabase", "schema.sql");
const sql = fs.readFileSync(schemaPath, "utf8");

const client = new pg.Client(config);

try {
  await client.connect();
  console.log("Connected to Supabase Postgres…");
  await client.query(sql);
  await client.query(`
    GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
    GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
    GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon, authenticated;
    GRANT INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO service_role;
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO anon, authenticated;
  `);
  console.log("✓ UKLAI schema applied successfully.");
} catch (err) {
  console.error("Schema apply failed:", err.message);
  process.exit(1);
} finally {
  await client.end();
}
