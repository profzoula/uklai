import type { StoreInfoSettings } from "@/lib/store-settings-types";

export const LEGAL_LAST_UPDATED = "June 6, 2026";

export type LegalStoreInfo = Pick<
  StoreInfoSettings,
  "name" | "email" | "phone" | "address" | "city" | "province" | "postal_code" | "country"
>;

export const defaultLegalStore: LegalStoreInfo = {
  name: "Briclix",
  email: "support@briclix.com",
  phone: "",
  address: "",
  city: "",
  province: "Florida",
  postal_code: "",
  country: "United States",
};

export function formatLegalAddress(store: LegalStoreInfo): string {
  const parts = [
    store.address,
    [store.city, store.province, store.postal_code].filter(Boolean).join(", "),
    store.country,
  ].filter(Boolean);
  return parts.length ? parts.join(" · ") : "United States";
}

export function governingState(store: LegalStoreInfo): string {
  return store.province || "Florida";
}
