"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem, Product } from "@/types/database";
import { cartLineKey } from "@/lib/product-variant-utils";

type AddItemOptions = {
  variantId?: string | null;
  variantLabel?: string | null;
};

type SyncedCartLine = {
  productId: string;
  variantId: string | null;
  variantLabel: string | null;
  name: string;
  price: number;
  quantity: number;
  image: string | null;
  stock: number;
  slug?: string;
};

type CartStore = {
  items: CartItem[];
  addItem: (
    product: Product,
    quantity?: number,
    options?: AddItemOptions
  ) => void;
  removeItem: (lineKey: string) => void;
  updateQuantity: (lineKey: string, quantity: number) => void;
  syncFromServer: (lines: SyncedCartLine[]) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
};

function lineStock(item: CartItem): number {
  return Math.max(0, Number(item.product.stock));
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product, quantity = 1, options) => {
        if (product.stock <= 0) return;
        const lineKey = cartLineKey(product.id, options?.variantId);

        set((state) => {
          const existing = state.items.find(
            (item) =>
              cartLineKey(item.product.id, item.variantId) === lineKey
          );
          if (existing) {
            const nextQty = Math.min(
              existing.quantity + quantity,
              product.stock
            );
            return {
              items: state.items.map((item) =>
                cartLineKey(item.product.id, item.variantId) === lineKey
                  ? {
                      ...item,
                      product,
                      quantity: nextQty,
                      variantId: options?.variantId ?? item.variantId,
                      variantLabel:
                        options?.variantLabel ?? item.variantLabel,
                    }
                  : item
              ),
            };
          }
          return {
            items: [
              ...state.items,
              {
                product,
                quantity: Math.min(quantity, product.stock),
                variantId: options?.variantId ?? null,
                variantLabel: options?.variantLabel ?? null,
              },
            ],
          };
        });
      },

      removeItem: (lineKey) => {
        set((state) => ({
          items: state.items.filter(
            (item) =>
              cartLineKey(item.product.id, item.variantId) !== lineKey
          ),
        }));
      },

      updateQuantity: (lineKey, quantity) => {
        if (quantity <= 0) {
          get().removeItem(lineKey);
          return;
        }
        set((state) => ({
          items: state.items.map((item) => {
            if (cartLineKey(item.product.id, item.variantId) !== lineKey) {
              return item;
            }
            return {
              ...item,
              quantity: Math.min(quantity, lineStock(item)),
            };
          }),
        }));
      },

      syncFromServer: (lines) => {
        set({
          items: lines.map((line) => {
            const baseProduct: Product = {
              id: line.productId,
              name: line.name,
              slug: line.slug ?? "",
              price: line.price,
              compare_at_price: null,
              image_url: line.image,
              stock: line.stock,
              active: true,
              product_type: "physical",
              catalog_type: line.variantId ? "variable" : "simple",
              created_at: "",
              updated_at: "",
            };

            return {
              product: baseProduct,
              quantity: line.quantity,
              variantId: line.variantId,
              variantLabel: line.variantLabel,
            };
          }),
        });
      },

      clearCart: () => set({ items: [] }),

      getTotal: () =>
        get().items.reduce(
          (total, item) => total + item.product.price * item.quantity,
          0
        ),

      getItemCount: () =>
        get().items.reduce((count, item) => count + item.quantity, 0),
    }),
    { name: "uklai-cart" }
  )
);

export type { SyncedCartLine };
