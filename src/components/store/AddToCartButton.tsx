"use client";

import { useState } from "react";
import { ShoppingCart, Minus, Plus } from "lucide-react";
import type { Product } from "@/types/database";
import { useCartStore } from "@/store/cart";

type Props = {
  product: Product;
};

export function AddToCartButton({ product }: Props) {
  const [quantity, setQuantity] = useState(1);
  const addItem = useCartStore((s) => s.addItem);

  if (product.stock <= 0) {
    return (
      <button
        disabled
        className="w-full sm:w-auto px-8 py-4 bg-slate-200 text-slate-500 rounded-xl font-semibold cursor-not-allowed"
      >
        Out of Stock
      </button>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
      <div className="flex items-center border border-slate-200 rounded-xl">
        <button
          onClick={() => setQuantity(Math.max(1, quantity - 1))}
          className="p-3 hover:bg-slate-50 transition-colors"
        >
          <Minus className="w-4 h-4" />
        </button>
        <span className="px-4 font-semibold">{quantity}</span>
        <button
          onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
          className="p-3 hover:bg-slate-50 transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      <button
        onClick={() => addItem(product, quantity)}
        className="inline-flex items-center gap-2 bg-primary text-white px-8 py-4 rounded-xl font-semibold hover:bg-primary-dark transition-colors shadow-lg shadow-primary/20"
      >
        <ShoppingCart className="w-5 h-5" />
        Add to Cart
      </button>
    </div>
  );
}
