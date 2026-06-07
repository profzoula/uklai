import { StoreInfoPage } from "@/components/store/StoreInfoPage";

export default function ContactPage() {
  return (
    <StoreInfoPage title="Contact Us">
      <p>
        Need help with an order, a product, or your account? Our support team is
        here for you.
      </p>
      <ul className="list-none space-y-2 not-prose">
        <li>
          <strong className="text-slate-900">Email:</strong>{" "}
          <a
            href="mailto:support@briclix.com"
            className="text-primary hover:underline"
          >
            support@briclix.com
          </a>
        </li>
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
