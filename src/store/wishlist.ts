"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

type WishlistStore = {
  productIds: string[];
  setProductIds: (ids: string[]) => void;
  toggleLocal: (productId: string) => boolean;
  hasLocal: (productId: string) => boolean;
  clearLocal: () => void;
};

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      productIds: [],

      setProductIds: (ids) => set({ productIds: ids }),

      toggleLocal: (productId) => {
        const current = get().productIds;
        const exists = current.includes(productId);
        set({
          productIds: exists
            ? current.filter((id) => id !== productId)
            : [...current, productId],
        });
        return !exists;
      },

      hasLocal: (productId) => get().productIds.includes(productId),

      clearLocal: () => set({ productIds: [] }),
    }),
    { name: "uklai-wishlist" }
  )
);
