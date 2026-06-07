import { getStoreSettings } from "@/lib/store-settings";
import { LegalPage } from "@/components/store/LegalPage";
import { defaultLegalStore } from "@/lib/store-legal";

export const metadata = {
  title: "Cookie Policy | Briclix",
  description: "How Briclix uses cookies and similar tracking technologies.",
};

export default async function CookiesPage() {
  const { store: s } = await getStoreSettings();
  const store = { ...defaultLegalStore, ...s };

  return (
    <LegalPage title="Cookie Policy" store={store}>
      <p>
        This Cookie Policy explains how {store.name} uses cookies and similar
        technologies on our website, in compliance with applicable U.S. laws and
        industry best practices.
      </p>

      <h2>1. What are cookies?</h2>
      <p>
        Cookies are small text files stored on your device when you visit a website.
        They help the site remember your preferences, keep you signed in, and
        understand how the site is used.
      </p>

      <h2>2. Types of cookies we use</h2>
      <ul>
        <li>
          <strong>Strictly necessary:</strong> Required for the site to function
          (e.g., shopping cart, checkout session, security). These cannot be
          disabled through our site without affecting functionality.
        </li>
        <li>
          <strong>Functional:</strong> Remember choices such as language or region.
        </li>
        <li>
          <strong>Analytics:</strong> Help us understand traffic and usage patterns
          to improve our store (aggregated where possible).
        </li>
        <li>
          <strong>Marketing (if enabled):</strong> May be used to deliver relevant
          advertisements on other platforms. Where required by state law, we obtain
          consent before using non-essential cookies for advertising.
        </li>
      </ul>

      <h2>3. Other tracking technologies</h2>
      <p>
        We may use local storage, session storage, and pixels (web beacons) for
        similar purposes. Payment processors such as Stripe may set their own
        cookies when you complete checkout on their hosted fields or pages.
      </p>

      <h2>4. Third-party cookies</h2>
      <p>
        Third parties whose services appear on our site (payment, analytics,
        shipping) may set cookies under their own privacy policies. We encourage
        you to review those policies.
      </p>

      <h2>5. Managing cookies</h2>
      <p>You can control cookies through:</p>
      <ul>
        <li>Your browser settings (block or delete cookies)</li>
        <li>Industry opt-out tools for interest-based advertising (e.g., NAI, DAA)</li>
        <li>Global Privacy Control (GPC) signals where we honor them as required by law</li>
      </ul>
      <p>
        Blocking strictly necessary cookies may prevent you from completing
        purchases or using cart features.
      </p>

      <h2>6. Do Not Track</h2>
      <p>
        Some browsers offer a &quot;Do Not Track&quot; signal. There is no uniform industry
        standard for responding to DNT; we treat applicable opt-out signals
        (including GPC) as required under state privacy laws.
      </p>

      <h2>7. Updates</h2>
      <p>
        We may update this Cookie Policy from time to time. See also our{" "}
        <a href="/privacy">Privacy Policy</a> for how we handle personal
        information.
      </p>
    </LegalPage>
  );
}
