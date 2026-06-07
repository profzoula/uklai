import { getStoreSettings } from "@/lib/store-settings";
import { LegalPage } from "@/components/store/LegalPage";
import { defaultLegalStore, formatLegalAddress } from "@/lib/store-legal";

export const metadata = {
  title: "Shipping Policy | Briclix",
  description: "Shipping rates, delivery times, and policies for Briclix orders.",
};

export default async function ShippingPage() {
  const settings = await getStoreSettings();
  const store = { ...defaultLegalStore, ...settings.store };
  const shipping = settings.shipping;
  const flatRate = shipping?.flat_rate ?? "5.99";
  const freeThreshold = shipping?.free_shipping_threshold ?? "50";
  const international = shipping?.international_shipping ?? false;

  return (
    <LegalPage title="Shipping Policy" store={store}>
      <p>
        This Shipping Policy describes how {store.name} fulfills and delivers
        orders placed through our U.S. online store. We ship from{" "}
        {formatLegalAddress(store)} unless otherwise noted on the product page.
      </p>

      <h2>1. Processing time</h2>
      <p>
        Orders are typically processed within <strong>1–3 business days</strong>{" "}
        (Monday–Friday, excluding U.S. federal holidays). Digital products are
        delivered electronically after payment confirmation—usually within minutes.
      </p>

      <h2>2. Where we ship</h2>
      <p>
        We ship to addresses within the 50 U.S. states and Washington, D.C. We
        may not ship to P.O. boxes for certain oversized or freight items; this
        will be noted at checkout.
      </p>
      <p>
        {international
          ? "International shipping may be available to select countries. Duties, taxes, and customs fees are the responsibility of the recipient unless stated at checkout."
          : "At this time we ship within the United States only. International shipping is not available unless explicitly offered on the product or checkout page."}
      </p>

      <h2>3. Shipping rates</h2>
      <ul>
        <li>
          Flat-rate standard shipping: <strong>${flatRate} USD</strong> on qualifying
          orders below the free-shipping threshold
        </li>
        <li>
          Free standard shipping on orders of{" "}
          <strong>${freeThreshold} USD</strong> or more (before tax, after
          discounts, contiguous U.S. only unless stated otherwise)
        </li>
        <li>Actual rates shown at checkout may vary by weight, destination, or promotion</li>
      </ul>

      <h2>4. Shipping methods &amp; delivery estimates</h2>
      <ul>
        <li>
          <strong>Standard shipping:</strong> 5–7 business days after processing
          (continental U.S.)
        </li>
        <li>
          <strong>Expedited options:</strong> where offered at checkout, 2–3
          business days after processing
        </li>
      </ul>
      <p>
        Delivery times are estimates only and not guaranteed. Carriers may
        experience delays due to weather, holidays, or high volume.
      </p>

      <h2>5. Order tracking</h2>
      <p>
        When your order ships, you will receive a confirmation email with tracking
        information when provided by the carrier. Allow 24–48 hours for tracking to
        update after label creation.
      </p>

      <h2>6. Lost, stolen, or delayed packages</h2>
      <p>
        Once delivered to the address you provided, risk of loss transfers to you
        (except where state law provides otherwise). Contact us within 7 days if
        tracking shows delivered but you did not receive the package—we will help
        you file a carrier claim where possible.
      </p>

      <h2>7. Incorrect address</h2>
      <p>
        You are responsible for accurate shipping information. We are not liable
        for packages returned or lost due to incorrect addresses. Reshipment may
        require additional shipping charges.
      </p>

      <h2>8. Freight &amp; oversized items</h2>
      <p>
        Large or heavy items may require freight delivery with scheduled
        appointment. Additional fees and delivery windows will be communicated
        before shipment.
      </p>
    </LegalPage>
  );
}
