"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingCart, Minus, Plus } from "lucide-react";
import type { Product } from "@/types/database";
import { useCartStore } from "@/store/cart";

type Props = {
  product: Product;
};

export function ProductActions({ product }: Props) {
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const [quantity, setQuantity] = useState(1);

  if (product.stock <= 0) {
    return (
      <button
        type="button"
        disabled
        className="w-full py-4 bg-slate-200 text-slate-500 rounded-xl font-bold cursor-not-allowed uppercase tracking-wide text-sm"
      >
        Out of stock
      </button>
    );
  }

  function handleAddToCart() {
    addItem(product, quantity);
  }

  function handleBuyNow() {
    addItem(product, quantity);
    router.push("/cart");
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex items-center border-2 border-slate-200 rounded-xl bg-white shrink-0">
          <button
            type="button"
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-slate-50 rounded-l-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label="Decrease quantity"
          >
            <Minus className="w-4 h-4" aria-hidden="true" />
          </button>
          <span
            className="min-w-[3rem] text-center font-bold text-slate-900"
            aria-live="polite"
          >
            {quantity}
          </span>
          <button
            type="button"
            onClick={() =>
              setQuantity(Math.min(product.stock, quantity + 1))
            }
            disabled={quantity >= product.stock}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-slate-50 rounded-r-xl disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label="Increase quantity"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        <button
          type="button"
          onClick={handleAddToCart}
          className="flex-1 inline-flex items-center justify-center gap-2 py-4 bg-primary text-white rounded-xl font-bold text-sm uppercase tracking-wide hover:bg-primary-dark transition-colors shadow-lg shadow-primary/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          <ShoppingCart className="w-5 h-5" aria-hidden="true" />
          Add to cart
        </button>
      </div>

      <button
        type="button"
        onClick={handleBuyNow}
        className="w-full py-3.5 border-2 border-slate-200 text-slate-900 rounded-xl font-semibold text-sm hover:bg-slate-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        Buy now
      </button>
    </div>
  );
}
