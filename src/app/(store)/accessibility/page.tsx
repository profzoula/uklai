import { getStoreSettings } from "@/lib/store-settings";
import { LegalPage } from "@/components/store/LegalPage";
import { defaultLegalStore } from "@/lib/store-legal";

export const metadata = {
  title: "Accessibility Statement | Briclix",
  description: "Briclix commitment to digital accessibility under the ADA.",
};

export default async function AccessibilityPage() {
  const { store: s } = await getStoreSettings();
  const store = { ...defaultLegalStore, ...s };

  return (
    <LegalPage title="Accessibility Statement" store={store}>
      <p>
        {store.name} is committed to ensuring digital accessibility for people
        with disabilities. We continually improve the user experience for everyone
        and apply relevant accessibility standards under the Americans with
        Disabilities Act (ADA) and Section 508 of the Rehabilitation Act, where
        applicable to our online services.
      </p>

      <h2>1. Conformance status</h2>
      <p>
        We aim to conform with the Web Content Accessibility Guidelines (WCAG) 2.1
        Level AA. Our ongoing efforts include keyboard navigation, sufficient
        color contrast, text alternatives for images, and semantic page structure.
      </p>

      <h2>2. Measures we take</h2>
      <ul>
        <li>Regular reviews of site design and content for accessibility barriers</li>
        <li>Staff training on accessible customer communications</li>
        <li>Partnership with vendors who support accessible payment and checkout flows</li>
        <li>Incorporating accessibility into new features and page updates</li>
      </ul>

      <h2>3. Known limitations</h2>
      <p>
        Some third-party content (embedded videos, payment widgets, or legacy PDFs)
        may not fully meet our accessibility targets. We work with providers to
        improve these experiences or offer alternatives upon request.
      </p>

      <h2>4. Assistive technology</h2>
      <p>
        Our site is designed to work with common assistive technologies including
        screen readers, screen magnifiers, and voice recognition software on
        supported browsers and operating systems.
      </p>

      <h2>5. Feedback &amp; assistance</h2>
      <p>
        If you experience difficulty accessing any part of our website or need
        assistance completing a purchase, please contact us:
      </p>
      <ul>
        <li>
          Email:{" "}
          <a href={`mailto:${store.email}`}>{store.email}</a>
        </li>
        {store.phone ? <li>Phone: {store.phone}</li> : null}
      </ul>
      <p>
        Please include the web page URL and a description of the problem. We will
        respond within 5 business days and work toward a reasonable accommodation
        or alternative format.
      </p>

      <h2>6. Formal complaints</h2>
      <p>
        If you are not satisfied with our response, you may have the right to
        file a complaint with the U.S. Department of Justice, Civil Rights
        Division, or your state&apos;s human rights agency.
      </p>
    </LegalPage>
  );
}
