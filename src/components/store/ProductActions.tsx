"use client";

import { useRouter } from "next/navigation";
import type { Product } from "@/types/database";
import { useCartStore } from "@/store/cart";

type Props = {
  product: Product;
};

export function ProductActions({ product }: Props) {
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);

  if (product.stock <= 0) {
    return (
      <button
        disabled
        className="w-full py-3.5 bg-slate-200 text-slate-500 rounded-xl font-semibold cursor-not-allowed"
      >
        Out of Stock
      </button>
    );
  }

  function handleAddToCart() {
    addItem(product, 1);
  }

  function handleBuyNow() {
    addItem(product, 1);
    router.push("/cart");
  }

  return (
    <div className="flex gap-3 pt-1">
      <button
        type="button"
        onClick={handleAddToCart}
        className="flex-1 py-3.5 bg-slate-100 text-slate-900 rounded-xl font-semibold text-sm hover:bg-slate-200 transition-colors"
      >
        Add to Cart
      </button>
      <button
        type="button"
        onClick={handleBuyNow}
        className="flex-1 py-3.5 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary-dark transition-colors"
      >
        Buy now
      </button>
    </div>
  );
}
