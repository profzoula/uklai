import { getStoreSettings } from "@/lib/store-settings";
import { LegalPage } from "@/components/store/LegalPage";
import { defaultLegalStore } from "@/lib/store-legal";
import { ReturnRequestForm } from "@/components/store/ReturnRequestForm";

export const metadata = {
  title: "Returns & Refunds | Briclix",
  description: "Return and refund policy for Briclix purchases.",
};

export default async function ReturnsPage() {
  const settings = await getStoreSettings();
  const store = { ...defaultLegalStore, ...settings.store };

  return (
    <LegalPage title="Returns & Refunds Policy" store={store}>
      <p>
        We want you to be satisfied with your purchase from {store.name}. This
        policy explains how returns and refunds work for orders shipped within
        the United States, subject to applicable consumer protection laws in
        your state.
      </p>

      <h2>1. Return window</h2>
      <p>
        Most unused items in original packaging may be returned within{" "}
        <strong>30 days</strong> of delivery for a refund or exchange, unless
        marked as final sale. Some states may provide additional rights for
        defective goods regardless of this window.
      </p>

      <h2>2. Non-returnable items</h2>
      <ul>
        <li>Digital downloads and software after delivery/access</li>
        <li>Gift cards and downloadable content codes</li>
        <li>Personalized, custom-made, or monogrammed items</li>
        <li>Intimate apparel, hygiene products, or opened health/beauty items (where applicable)</li>
        <li>Items marked &quot;Final Sale&quot; or &quot;Non-Returnable&quot;</li>
        <li>Products damaged through misuse or normal wear after delivery</li>
      </ul>

      <h2>3. Condition requirements</h2>
      <p>
        Items must be unused, unworn, with tags attached, and in original
        packaging with all accessories, manuals, and free gifts included.
        We may refuse returns that do not meet these conditions or show signs of
        use.
      </p>

      <h2>4. Damaged, defective, or wrong items</h2>
      <p>
        If you receive a damaged, defective, or incorrect item, contact us within
        7 days of delivery with photos. We will arrange a replacement or full
        refund including shipping where appropriate—without requiring you to
        follow the standard return steps below.
      </p>

      <h2>5. How to start a return</h2>
      <ol>
        <li>
          Email{" "}
          <a href={`mailto:${store.email}`}>{store.email}</a> with your order
          number, item(s) to return, and reason for return.
        </li>
        <li>Wait for return authorization and instructions (RMA).</li>
        <li>Ship items to the address we provide using a trackable method.</li>
      </ol>
      <p>
        Unauthorized returns may not be accepted. Return shipping costs may apply
        unless the return is due to our error or a defective product.
      </p>

      <h2>6. Refunds</h2>
      <ul>
        <li>
          Refunds are issued to the original payment method after we receive and
          inspect the return (typically 5–10 business days).
        </li>
        <li>
          Original shipping charges are non-refundable except when required by
          law or when we shipped the wrong or defective item.
        </li>
        <li>
          Restocking fees, if any, will be disclosed before return authorization.
        </li>
      </ul>

      <h2>7. Exchanges</h2>
      <p>
        To exchange for a different size or color, contact us. If the replacement
        item costs more, you will pay the difference; if less, we will refund the
        difference per our refund timeline.
      </p>

      <h2>8. Cancellations</h2>
      <p>
        Orders may be cancelled before shipment by contacting us promptly. Once
        shipped, standard return procedures apply.
      </p>

      <h2>9. Chargebacks</h2>
      <p>
        If you have a concern, please contact us first so we can resolve it. Filing
        a chargeback without attempting resolution may delay investigation.
      </p>

      <ReturnRequestForm storeEmail={store.email} />
    </LegalPage>
  );
}
