import { getUser, getProfile } from "@/lib/supabase/server";
import { getUserOrders } from "@/lib/account-data";
import { AccountMainPanel } from "@/components/store/AccountMainPanel";
import { ShippingAddressForm } from "@/components/store/ShippingAddressForm";
import type { SavedShippingAddress } from "@/types/database";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Shipping Address | My Account | UKLAI",
};

const emptyAddress: SavedShippingAddress = {
  shipping_name: "",
  shipping_address: "",
  shipping_city: "",
  shipping_state: "",
  shipping_zip: "",
  shipping_country: "US",
};

function profileHasSavedAddress(profile: {
  shipping_name?: string | null;
  shipping_address?: string | null;
  shipping_city?: string | null;
}) {
  return Boolean(
    profile.shipping_name?.trim() &&
      profile.shipping_address?.trim() &&
      profile.shipping_city?.trim()
  );
}

function addressFromProfile(profile: NonNullable<Awaited<ReturnType<typeof getProfile>>>): SavedShippingAddress {
  return {
    shipping_name: profile.shipping_name ?? "",
    shipping_address: profile.shipping_address ?? "",
    shipping_city: profile.shipping_city ?? "",
    shipping_state: profile.shipping_state ?? "",
    shipping_zip: profile.shipping_zip ?? "",
    shipping_country: profile.shipping_country ?? "US",
  };
}

function addressFromOrder(order: {
  shipping_name: string | null;
  shipping_address: string | null;
  shipping_city: string | null;
  shipping_state: string | null;
  shipping_zip: string | null;
  shipping_country: string;
}): SavedShippingAddress {
  return {
    shipping_name: order.shipping_name ?? "",
    shipping_address: order.shipping_address ?? "",
    shipping_city: order.shipping_city ?? "",
    shipping_state: order.shipping_state ?? "",
    shipping_zip: order.shipping_zip ?? "",
    shipping_country: order.shipping_country || "US",
  };
}

export default async function AccountAddressesPage() {
  const user = await getUser();
  if (!user) return null;

  const [profile, orders] = await Promise.all([
    getProfile(),
    getUserOrders(user.id),
  ]);

  const savedOnProfile = profile ? profileHasSavedAddress(profile) : false;
  const latestOrderWithAddress = orders.find(
    (o) => o.shipping_address && o.shipping_name
  );

  let initial = emptyAddress;

  if (savedOnProfile && profile) {
    initial = addressFromProfile(profile);
  } else if (latestOrderWithAddress) {
    initial = addressFromOrder(latestOrderWithAddress);
  } else if (profile?.full_name) {
    initial = { ...emptyAddress, shipping_name: profile.full_name };
  }

  return (
    <AccountMainPanel>
      <div className="px-4 sm:px-6 py-5 border-b border-slate-100">
        <h1 className="text-xl font-bold text-slate-900">Shipping address</h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage your default delivery address
        </p>
      </div>

      <div className="px-4 sm:px-6 py-6">
        <ShippingAddressForm initial={initial} savedOnProfile={savedOnProfile} />
      </div>
    </AccountMainPanel>
  );
}
