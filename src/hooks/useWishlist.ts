"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { useWishlistStore } from "@/store/wishlist";

export function useWishlist() {
  const productIds = useWishlistStore((s) => s.productIds);
  const setProductIds = useWishlistStore((s) => s.setProductIds);
  const toggleLocal = useWishlistStore((s) => s.toggleLocal);
  const hasLocal = useWishlistStore((s) => s.hasLocal);
  const [userId, setUserId] = useState<string | null>(null);
  const [ready, setReady] = useState(!isSupabaseConfigured());

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setReady(true);
      return;
    }

    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserId(user?.id ?? null);
      if (!user) {
        setReady(true);
        return;
      }

      fetch("/api/account/wishlist")
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data.productIds)) {
            const merged = Array.from(
              new Set([...data.productIds, ...useWishlistStore.getState().productIds])
            );
            setProductIds(merged);
          }
        })
        .finally(() => setReady(true));
    });
  }, [setProductIds]);

  const isWishlisted = useCallback(
    (productId: string) => productIds.includes(productId),
    [productIds]
  );

  const toggle = useCallback(
    async (productId: string) => {
      if (!userId || !isSupabaseConfigured()) {
        toggleLocal(productId);
        return { ok: true, requiresLogin: !userId && isSupabaseConfigured() };
      }

      const res = await fetch("/api/account/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });
      const data = await res.json();

      if (!res.ok) {
        return { ok: false, error: data.error ?? "Could not update wishlist." };
      }

      setProductIds(data.productIds ?? []);
      return { ok: true, requiresLogin: false };
    },
    [userId, setProductIds, toggleLocal]
  );

  return {
    ready,
    productIds,
    count: productIds.length,
    isWishlisted,
    toggle,
    isLoggedIn: Boolean(userId),
  };
}
