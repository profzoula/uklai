import { getDisplayPrices } from "@/lib/product-pricing";
import { formatPrice } from "@/lib/utils";
import type { Product } from "@/types/database";

type Props = {
  product: Product;
};

export function ProductPriceBlock({ product }: Props) {
  const { currentPrice, regularPrice, onSale } = getDisplayPrices(
    product.price,
    product.compare_at_price
  );
  const discount =
    onSale && regularPrice != null
      ? Math.round(((regularPrice - currentPrice) / regularPrice) * 100)
      : null;
  const savings =
    onSale && regularPrice != null ? regularPrice - currentPrice : null;

  return (
    <div className="flex flex-wrap items-end gap-3">
      {discount !== null && (
        <span className="inline-flex items-center bg-red-600 text-white text-base sm:text-sm font-bold px-3 py-1 rounded-md">
          -{discount}%
        </span>
      )}
      <p className="text-3xl sm:text-4xl font-bold text-red-600 leading-none">
        {formatPrice(currentPrice)}
      </p>
      {onSale && regularPrice != null && (
        <p className="text-xl sm:text-lg text-slate-400 line-through pb-0.5">
          {formatPrice(regularPrice)}
        </p>
      )}
      {savings !== null && (
        <p className="w-full text-base sm:text-sm font-medium text-emerald-700">
          You save {formatPrice(savings)}
        </p>
      )}
    </div>
  );
}
