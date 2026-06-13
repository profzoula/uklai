import Link from "next/link";
import { cn } from "@/lib/utils";

const LOGO_SRC = {
  white: "/logowhite.svg",
  blue: "/logoblue.svg",
} as const;

/** Official wordmark aspect ratio (375 × 157.92). */
const LOGO_ASPECT = 375 / 157.92;

type Props = {
  href?: string;
  className?: string;
  imageClassName?: string;
  /** White wordmark for dark surfaces; blue for light pages. */
  variant?: keyof typeof LOGO_SRC;
  /** Visual size preset */
  size?: "header" | "footer" | "compact" | "auth";
  onClick?: () => void;
};

const sizeClasses = {
  header: "h-10 sm:h-11 w-auto object-contain",
  footer: "h-11 sm:h-12 w-auto object-contain",
  compact: "h-8 sm:h-9 w-auto object-contain",
  auth: "h-12 sm:h-14 w-auto object-contain",
};

const intrinsicHeights = {
  header: 44,
  footer: 48,
  compact: 36,
  auth: 56,
};

export function BrandLogo({
  href = "/",
  className,
  imageClassName,
  variant = "white",
  size = "header",
  onClick,
}: Props) {
  const height = intrinsicHeights[size];
  const width = Math.round(height * LOGO_ASPECT);

  const image = (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={LOGO_SRC[variant]}
      alt="Uklai"
      width={width}
      height={height}
      className={cn(sizeClasses[size], imageClassName)}
      decoding="async"
      fetchPriority={size === "header" ? "high" : undefined}
    />
  );

  if (!href) {
    return <span className={className}>{image}</span>;
  }

  return (
    <Link href={href} className={cn("inline-flex shrink-0", className)} onClick={onClick}>
      {image}
    </Link>
  );
}
