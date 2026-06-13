import { Truck } from "lucide-react";
import { getDeliveryEstimate } from "@/lib/delivery-estimate";
import { formatPrice } from "@/lib/utils";
import type { AllStoreSettings } from "@/lib/store-settings-types";
import type { Product } from "@/types/database";

type Props = {
  product: Product;
  settings: AllStoreSettings;
};

function productQualifiesForFreeShipping(
  product: Product,
  settings: AllStoreSettings
): boolean {
  if (product.weight != null && product.weight > 0) return false;
  if (product.free_shipping) return true;
  const threshold = parseFloat(settings.shipping.free_shipping_threshold || "50");
  return product.price >= threshold;
}

export function ProductDeliverySummary({ product, settings }: Props) {
  if (product.product_type === "digital" || product.no_shipping_required) {
    return null;
  }

  const delivery = getDeliveryEstimate(4, 7);
  const isFree = productQualifiesForFreeShipping(product, settings);
  const flatRate = parseFloat(settings.shipping.flat_rate || "5.99");

  return (
    <div
      className={`mt-4 flex gap-3 rounded-lg border px-3.5 py-3 ${
        isFree
          ? "bg-emerald-50/80 border-emerald-100"
          : "bg-slate-50 border-slate-200"
      }`}
    >
      <Truck
        className={`w-5 h-5 shrink-0 mt-0.5 ${
          isFree ? "text-emerald-600" : "text-slate-500"
        }`}
        aria-hidden="true"
      />
      <div>
        <p className="text-sm font-bold text-slate-900">
          {isFree ? "Free shipping" : `Shipping ${formatPrice(flatRate)}`}
        </p>
        <p className="text-sm text-slate-600 mt-0.5">
          Delivery:{" "}
          <span className="font-semibold text-slate-900">{delivery.label}</span>{" "}
          <span className="text-slate-500">
            ({delivery.minDays}–{delivery.maxDays} days)
          </span>
        </p>
      </div>
    </div>
  );
}
