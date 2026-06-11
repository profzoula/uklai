import { getStoreSettings } from "@/lib/store-settings";
import { StoreInfoPage } from "@/components/store/StoreInfoPage";

export default async function ContactPage() {
  const { store } = await getStoreSettings();
  const email = store.email || "support@uklai.com";

  return (
    <StoreInfoPage title="Contact Us">
      <p>
        Need help with an order, a product, or your account? Our support team is
        here for you.
      </p>
      <ul className="list-none space-y-2 not-prose">
        <li>
          <strong className="text-slate-900">Email:</strong>{" "}
          <a href={`mailto:${email}`} className="text-primary hover:underline">
            {email}
          </a>
        </li>
        {store.phone && (
          <li>
            <strong className="text-slate-900">Phone:</strong> {store.phone}
          </li>
        )}
        {(store.address || store.city) && (
          <li>
            <strong className="text-slate-900">Address:</strong>{" "}
            {[store.address, store.city, store.province, store.postal_code]
              .filter(Boolean)
              .join(", ")}
          </li>
        )}
        <li>
          <strong className="text-slate-900">Hours:</strong> Mon–Fri, 9am–6pm ET
        </li>
        <li>
          <strong className="text-slate-900">Response time:</strong> Within 24
          hours on business days
        </li>
      </ul>
    </StoreInfoPage>
  );
}
