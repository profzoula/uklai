import {
  Truck,
  BadgeCheck,
  PackageCheck,
  ShieldCheck,
  Check,
} from "lucide-react";

function getDeliveryWindow() {
  const start = new Date();
  start.setDate(start.getDate() + 5);
  const end = new Date();
  end.setDate(end.getDate() + 10);

  const fmt = (d: Date) =>
    d.toLocaleDateString("en-US", { month: "short", day: "numeric" });

  return `${fmt(start)} - ${fmt(end)}`;
}

const couriers = [
  { name: "SpeedX", color: "bg-orange-500" },
  { name: "GOFO", color: "bg-red-500" },
  { name: "USPS", color: "bg-blue-600" },
  { name: "CAINIAO", color: "bg-sky-500" },
];

const deliveryGuarantees = [
  "$1.00 coupon code if delayed",
  "Refund if package lost",
  "Refund if items damaged",
  "Refund if no delivery in 30 days",
];

function IconBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-6 h-6 flex items-center justify-center shrink-0 mt-0.5">
      {children}
    </div>
  );
}

export function ProductShippingInfo() {
  const deliveryRange = getDeliveryWindow();

  return (
    <aside className="lg:pl-4">
      <div className="space-y-5">
        {/* Free shipping */}
        <div className="flex gap-3">
          <IconBox>
            <Truck className="w-[22px] h-[22px] text-emerald-600" strokeWidth={1.5} />
          </IconBox>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-slate-900 text-[15px] leading-snug">
              Free shipping
            </p>
            <p className="text-sm text-slate-600 mt-1 leading-relaxed">
              Delivery:{" "}
              <span className="font-semibold text-slate-900">{deliveryRange}</span>{" "}
              <span className="text-slate-500">(82.2% ≤ 10 days)</span>
            </p>
            <p className="text-sm text-slate-600 mt-2 flex flex-wrap items-center gap-x-1.5 gap-y-2">
              <span>Courier company:</span>
              <span className="font-semibold text-slate-900">SpeedX</span>
              {couriers.slice(1).map((c) => (
                <span
                  key={c.name}
                  className={`inline-flex items-center justify-center min-w-[28px] h-5 px-1.5 rounded text-[9px] font-bold text-white ${c.color}`}
                >
                  {c.name.slice(0, 4)}
                </span>
              ))}
              <span className="text-slate-400">etc.</span>
            </p>
          </div>
        </div>

        {/* Fast delivery */}
        <div className="flex gap-3">
          <IconBox>
            <BadgeCheck className="w-[22px] h-[22px] text-emerald-600" strokeWidth={1.5} />
          </IconBox>
          <div>
            <p className="font-semibold text-slate-900 text-[15px]">Fast delivery</p>
            <ul className="mt-2 space-y-1">
              {deliveryGuarantees.map((item, i) => (
                <li key={item} className="flex items-center gap-2 text-sm">
                  <Check
                    className="w-3.5 h-3.5 text-emerald-600 shrink-0"
                    strokeWidth={2.5}
                  />
                  <span className={i === 0 ? "text-slate-900" : "text-slate-400"}>
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Free returns */}
        <div className="flex gap-3">
          <IconBox>
            <PackageCheck className="w-[22px] h-[22px] text-emerald-600" strokeWidth={1.5} />
          </IconBox>
          <p className="font-semibold text-slate-900 text-[15px] pt-0.5">
            Free returns within 90 days
          </p>
        </div>

        {/* Security */}
        <div className="flex gap-3">
          <IconBox>
            <ShieldCheck className="w-[22px] h-[22px] text-emerald-600" strokeWidth={1.5} />
          </IconBox>
          <div className="min-w-0">
            <p className="text-[15px] leading-snug">
              <span className="font-semibold text-slate-900">Security & Privacy</span>
              <span className="text-slate-500 font-normal">
                {" "}
                secure personal details
              </span>
            </p>
            <p className="text-sm text-slate-400 mt-1 truncate">
              Safe payments: We do not share your personal payment information…
            </p>
            <p className="text-sm text-slate-400 truncate">
              Secure personal details: We protect your privacy and keep your data…
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
