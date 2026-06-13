"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWishlist } from "@/hooks/useWishlist";

type Props = {
  productId: string;
  productName: string;
  className?: string;
  size?: "sm" | "md";
};

export function WishlistButton({
  productId,
  productName,
  className,
  size = "md",
}: Props) {
  const { isWishlisted, toggle } = useWishlist();
  const [loading, setLoading] = useState(false);
  const active = isWishlisted(productId);

  const iconSize = size === "sm" ? "w-4 h-4" : "w-5 h-5";
  const buttonSize =
    size === "sm"
      ? "min-w-[36px] min-h-[36px]"
      : "min-w-[44px] min-h-[44px]";

  async function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (loading) return;

    setLoading(true);
    const result = await toggle(productId);
    setLoading(false);

    if (result.requiresLogin) {
      window.location.href = `/auth/login?next=${encodeURIComponent(window.location.pathname)}`;
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className={cn(
        "inline-flex items-center justify-center rounded-full border transition-colors",
        buttonSize,
        active
          ? "bg-red-50 border-red-200 text-red-500"
          : "bg-white/95 border-slate-200 text-slate-500 hover:text-red-500 hover:border-red-200",
        className
      )}
      aria-label={
        active
          ? `Remove ${productName} from wishlist`
          : `Add ${productName} to wishlist`
      }
      aria-pressed={active}
    >
      <Heart
        className={cn(iconSize, active && "fill-current")}
        aria-hidden="true"
      />
    </button>
  );
}
