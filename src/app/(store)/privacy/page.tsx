import { getStoreSettings } from "@/lib/store-settings";
import { LegalPage } from "@/components/store/LegalPage";
import { defaultLegalStore, formatLegalAddress } from "@/lib/store-legal";

export const metadata = {
  title: "Privacy Policy | Briclix",
  description: "How Briclix collects, uses, and protects your personal information.",
};

export default async function PrivacyPage() {
  const settings = await getStoreSettings();
  const store = { ...defaultLegalStore, ...settings.store };

  return (
    <LegalPage title="Privacy Policy" store={store}>
      <p>
        {store.name} (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) respects your privacy. This
        Privacy Policy explains how we collect, use, disclose, and protect personal
        information when you visit our website or make a purchase, in accordance
        with applicable U.S. federal and state privacy laws.
      </p>

      <h2>1. Information we collect</h2>
      <p>We may collect the following categories of information:</p>
      <ul>
        <li>
          <strong>Identifiers:</strong> name, email address, phone number, shipping
          and billing address, account ID
        </li>
        <li>
          <strong>Commercial information:</strong> order history, products
          purchased, cart contents, coupons used
        </li>
        <li>
          <strong>Payment information:</strong> processed by Stripe; we do not store
          full credit card numbers on our servers
        </li>
        <li>
          <strong>Internet/device data:</strong> IP address, browser type, device
          identifiers, pages viewed, referring URLs (see our{" "}
          <a href="/cookies">Cookie Policy</a>)
        </li>
        <li>
          <strong>Communications:</strong> messages you send to customer support
        </li>
      </ul>

      <h2>2. How we use information</h2>
      <ul>
        <li>Process and fulfill orders, including shipping and returns</li>
        <li>Provide customer service and respond to inquiries</li>
        <li>Send transactional emails (order confirmations, shipping updates)</li>
        <li>Prevent fraud, enforce our policies, and comply with legal obligations</li>
        <li>Improve our website, products, and marketing (where permitted)</li>
        <li>Send promotional communications if you opt in (you may opt out anytime)</li>
      </ul>

      <h2>3. Legal bases (where applicable)</h2>
      <p>
        We process personal information based on: performance of a contract (your
        order), legitimate business interests (security, analytics), compliance
        with law, and your consent where required.
      </p>

      <h2>4. How we share information</h2>
      <p>We do not sell your personal information for money. We may share data with:</p>
      <ul>
        <li>
          <strong>Service providers:</strong> payment processing (Stripe), hosting,
          email delivery, analytics, and shipping carriers—bound by contractual
          obligations to protect your data
        </li>
        <li>
          <strong>Legal requirements:</strong> when required by law, subpoena, or to
          protect rights, safety, and security
        </li>
        <li>
          <strong>Business transfers:</strong> in connection with a merger,
          acquisition, or sale of assets, with notice where required
        </li>
      </ul>

      <h2>5. Cookies &amp; tracking</h2>
      <p>
        We use cookies and similar technologies as described in our{" "}
        <a href="/cookies">Cookie Policy</a>. You can manage preferences through
        your browser settings.
      </p>

      <h2>6. Your privacy rights (United States)</h2>
      <p>
        Depending on your state of residence, you may have rights under laws such
        as the California Consumer Privacy Act (CCPA/CPRA), Colorado Privacy Act,
        Virginia CDPA, Connecticut CTDPA, and similar state laws, including:
      </p>
      <ul>
        <li>Right to know what personal information we collect and how it is used</li>
        <li>Right to access and obtain a copy of your personal information</li>
        <li>Right to correct inaccurate personal information</li>
        <li>Right to delete personal information (subject to exceptions)</li>
        <li>
          Right to opt out of the &quot;sale&quot; or &quot;sharing&quot; of personal
          information for cross-context behavioral advertising
        </li>
        <li>Right to non-discrimination for exercising privacy rights</li>
      </ul>
      <p>
        <strong>California residents:</strong> We do not sell personal information
        for monetary consideration. To submit a privacy request, email{" "}
        <a href={`mailto:${store.email}`}>{store.email}</a> with subject line
        &quot;Privacy Request.&quot; We will verify your identity before responding.
        You may designate an authorized agent where permitted by law.
      </p>

      <h2>7. Children&apos;s privacy (COPPA)</h2>
      <p>
        Our Service is not directed to children under 13. We do not knowingly
        collect personal information from children under 13. If you believe a
        child has provided us data, contact us and we will delete it.
      </p>

      <h2>8. Data retention &amp; security</h2>
      <p>
        We retain information as long as needed to fulfill orders, comply with legal
        obligations, resolve disputes, and enforce agreements. We implement
        reasonable administrative, technical, and physical safeguards; no method
        of transmission over the Internet is 100% secure.
      </p>

      <h2>9. International users</h2>
      <p>
        Our store is operated from the United States ({formatLegalAddress(store)}).
        If you access the Service from outside the U.S., your information may be
        transferred to and processed in the United States.
      </p>

      <h2>10. Changes to this policy</h2>
      <p>
        We may update this Privacy Policy periodically. The &quot;Last updated&quot; date
        at the top reflects the latest revision.
      </p>
    </LegalPage>
  );
}
