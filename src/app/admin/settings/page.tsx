import { getStoreSettings } from "@/lib/store-settings";
import { SettingsForm } from "@/components/admin/SettingsForm";

export default async function AdminSettingsPage() {
  const settings = await getStoreSettings();
  return <SettingsForm initialSettings={settings} />;
}
