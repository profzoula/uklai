import { formatPrice, calculateDiscount } from "@/lib/utils";
import type { Product } from "@/types/database";

type Props = {
  product: Product;
};

export function ProductPriceBlock({ product }: Props) {
  const discount = calculateDiscount(product.price, product.compare_at_price);
  const savings =
    product.compare_at_price && product.compare_at_price > product.price
      ? product.compare_at_price - product.price
      : null;

  return (
    <div className="flex flex-wrap items-end gap-3">
      {discount !== null && (
        <span className="inline-flex items-center bg-red-600 text-white text-sm font-bold px-2.5 py-1 rounded-md">
          -{discount}%
        </span>
      )}
      <p className="text-3xl sm:text-4xl font-bold text-red-600 leading-none">
        {formatPrice(product.price)}
      </p>
      {product.compare_at_price && product.compare_at_price > product.price && (
        <p className="text-lg text-slate-400 line-through pb-0.5">
          {formatPrice(product.compare_at_price)}
        </p>
      )}
      {savings !== null && (
        <p className="w-full text-sm font-medium text-emerald-700">
          You save {formatPrice(savings)}
        </p>
      )}
    </div>
  );
}
