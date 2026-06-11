import { getStoreSettings } from "@/lib/store-settings";
import { SettingsForm } from "@/components/admin/SettingsForm";

export default async function AdminSettingsPage() {
  const settings = await getStoreSettings();
  const stripeConfigured = Boolean(process.env.STRIPE_SECRET_KEY?.trim());

  return (
    <SettingsForm
      initialSettings={settings}
      stripeConfigured={stripeConfigured}
    />
  );
}
