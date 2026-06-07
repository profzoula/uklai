import "server-only";

import { isSupabaseConfigured } from "@/lib/supabase/config";
import {
  defaultStoreSettings,
  mergeStoreSettings,
  type AllStoreSettings,
} from "@/lib/store-settings-types";

export type {
  AllStoreSettings,
  StoreInfoSettings,
  PaymentSettings,
  ShippingSettings,
  TaxSettings,
  NotificationSettings,
} from "@/lib/store-settings-types";

export { defaultStoreSettings } from "@/lib/store-settings-types";

export async function getStoreSettings(): Promise<AllStoreSettings> {
  if (!isSupabaseConfigured()) return defaultStoreSettings;

  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  const { data } = await supabase
    .from("store_settings")
    .select("data")
    .eq("id", 1)
    .maybeSingle();

  if (!data?.data || typeof data.data !== "object") {
    return defaultStoreSettings;
  }

  return mergeStoreSettings(data.data as Partial<AllStoreSettings>);
}

export async function saveStoreSettings(
  settings: AllStoreSettings
): Promise<{ error: string | null }> {
  if (!isSupabaseConfigured()) {
    return { error: "Supabase is not configured." };
  }

  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();

  const { error } = await supabase.from("store_settings").upsert({
    id: 1,
    data: settings,
    updated_at: new Date().toISOString(),
  });

  return { error: error?.message ?? null };
}
