import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

const LOGO_SRC = "/media/uklai-logo.png";

type Props = {
  href?: string;
  className?: string;
  imageClassName?: string;
  /** Visual size preset */
  size?: "header" | "footer" | "compact";
  onClick?: () => void;
};

const sizeClasses = {
  header: "h-10 sm:h-12 w-auto object-contain",
  footer: "h-11 sm:h-12 w-auto object-contain",
  compact: "h-8 sm:h-9 w-auto object-contain",
};

const intrinsicHeights = {
  header: 48,
  footer: 48,
  compact: 36,
};

export function BrandLogo({
  href = "/",
  className,
  imageClassName,
  size = "header",
  onClick,
}: Props) {
  const height = intrinsicHeights[size];
  const width = Math.round(height * 3.4);

  const image = (
    <Image
      src={LOGO_SRC}
      alt="Uklai"
      width={width}
      height={height}
      className={cn(sizeClasses[size], imageClassName)}
      priority={size === "header"}
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
