import { TrackOrderForm } from "@/components/store/TrackOrderForm";

export const metadata = {
  title: "Track Order | UKLAI",
  description: "Track your UKLAI order with your order number and email.",
};

export default function TrackOrderPage() {
  return (
    <div className="bg-slate-50 min-h-[calc(100vh-4rem)]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Track your order
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-600">
            Enter your order number and the email used at checkout.
          </p>
        </div>
        <TrackOrderForm />
      </div>
    </div>
  );
}
