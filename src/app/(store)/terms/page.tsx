import { getStoreSettings } from "@/lib/store-settings";
import { LegalPage } from "@/components/store/LegalPage";
import {
  defaultLegalStore,
  formatLegalAddress,
  governingState,
} from "@/lib/store-legal";

export const metadata = {
  title: "Terms of Service | UKLAI",
  description: "Terms and conditions for using the UKLAI online store.",
};

export default async function TermsPage() {
  const { store: s } = await getStoreSettings();
  const store = { ...defaultLegalStore, ...s };
  const state = governingState(store);

  return (
    <LegalPage title="Terms of Service" store={store}>
      <p>
        These Terms of Service (&quot;Terms&quot;) govern your access to and use of the{" "}
        {store.name} website and online store (the &quot;Service&quot;), operated from{" "}
        {formatLegalAddress(store)}. By accessing or placing an order, you agree to
        these Terms.
      </p>

      <h2>1. Eligibility</h2>
      <p>
        You must be at least 18 years old and capable of forming a binding contract
        under applicable law. If you are using the Service on behalf of a business,
        you represent that you have authority to bind that entity.
      </p>

      <h2>2. Account &amp; accuracy of information</h2>
      <p>
        You are responsible for maintaining accurate account and checkout
        information, including shipping address and contact details. We may suspend
        or refuse orders that appear fraudulent or violate these Terms.
      </p>

      <h2>3. Products, pricing &amp; availability</h2>
      <ul>
        <li>All prices are listed in U.S. Dollars (USD) unless otherwise stated.</li>
        <li>
          We strive to display accurate descriptions and images; minor variations
          may occur. Colors may differ based on your device display.
        </li>
        <li>
          We reserve the right to limit quantities, discontinue products, correct
          pricing errors, and cancel orders affected by errors—even after an order
          is submitted.
        </li>
        <li>
          Sales tax and other applicable taxes may be calculated at checkout based
          on your shipping address and applicable state and local laws.
        </li>
      </ul>

      <h2>4. Orders &amp; payment</h2>
      <p>
        Your order is an offer to purchase. We accept orders at our discretion. Payment
        is processed by secure third-party providers (e.g., Stripe). By submitting
        payment information, you authorize us and our payment processors to charge
        the total amount, including applicable taxes and shipping.
      </p>
      <p>
        Digital products, where offered, may be delivered electronically after
        payment confirmation. License to digital content is personal and
        non-transferable unless stated otherwise.
      </p>

      <h2>5. Shipping &amp; delivery</h2>
      <p>
        Shipping terms are described in our{" "}
        <a href="/shipping">Shipping Policy</a>. Title and risk of loss pass to you
        upon delivery to the carrier, except where prohibited by law.
      </p>

      <h2>6. Returns &amp; refunds</h2>
      <p>
        Returns and refunds are governed by our{" "}
        <a href="/returns">Returns &amp; Refunds Policy</a>. Certain items (e.g.,
        opened digital goods, personalized products, or final-sale items) may not
        be returnable where permitted by law.
      </p>

      <h2>7. Promotional codes &amp; coupons</h2>
      <p>
        Coupons and promotions are subject to stated terms, expiration dates, and
        usage limits. They cannot be combined unless explicitly allowed and have no
        cash value.
      </p>

      <h2>8. Intellectual property</h2>
      <p>
        All content on the Service—including logos, text, graphics, and software—is
        owned by {store.name} or its licensors and protected by U.S. and
        international intellectual property laws. You may not copy, modify, or
        exploit our content without written permission.
      </p>

      <h2>9. Prohibited conduct</h2>
      <p>You agree not to:</p>
      <ul>
        <li>Use the Service for unlawful purposes or in violation of export controls</li>
        <li>Attempt unauthorized access to our systems or customer accounts</li>
        <li>Scrape, harvest, or reverse engineer the Service</li>
        <li>Submit false orders or abuse promotions</li>
      </ul>

      <h2>10. Disclaimers</h2>
      <p>
        EXCEPT AS REQUIRED BY LAW, THE SERVICE AND PRODUCTS ARE PROVIDED &quot;AS IS&quot;
        AND &quot;AS AVAILABLE.&quot; WE DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED,
        INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND
        NON-INFRINGEMENT, TO THE FULLEST EXTENT PERMITTED BY LAW.
      </p>

      <h2>11. Limitation of liability</h2>
      <p>
        TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, {store.name.toUpperCase()}
        AND ITS OFFICERS, DIRECTORS, EMPLOYEES, AND AGENTS SHALL NOT BE LIABLE FOR
        ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR
        ANY LOSS OF PROFITS, DATA, OR GOODWILL. OUR TOTAL LIABILITY FOR ANY CLAIM
        ARISING FROM THESE TERMS OR YOUR USE OF THE SERVICE SHALL NOT EXCEED THE
        GREATER OF (A) THE AMOUNT YOU PAID FOR THE PRODUCT OR SERVICE GIVING RISE
        TO THE CLAIM IN THE TWELVE (12) MONTHS BEFORE THE CLAIM, OR (B) ONE
        HUNDRED U.S. DOLLARS ($100).
      </p>
      <p>
        Some states do not allow certain limitations; in those states, our liability
        is limited to the fullest extent permitted by law.
      </p>

      <h2>12. Indemnification</h2>
      <p>
        You agree to indemnify and hold harmless {store.name} from claims arising
        from your misuse of the Service or violation of these Terms.
      </p>

      <h2>13. Dispute resolution &amp; governing law</h2>
      <p>
        These Terms are governed by the laws of the State of {state}, without regard
        to conflict-of-law principles, and the federal laws of the United States.
        Any dispute shall be brought in the state or federal courts located in{" "}
        {state}, and you consent to personal jurisdiction there, except where
        consumer protection laws in your state of residence require otherwise.
      </p>

      <h2>14. Changes</h2>
      <p>
        We may update these Terms at any time. Material changes will be posted on
        this page with an updated date. Continued use after changes constitutes
        acceptance.
      </p>
    </LegalPage>
  );
}
