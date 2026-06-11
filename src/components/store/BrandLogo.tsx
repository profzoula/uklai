import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

const LOGO_SRC = "/media/uklai-logo.png";

type Props = {
  href?: string;
  className?: string;
  imageClassName?: string;
  height?: number;
  onClick?: () => void;
};

export function BrandLogo({
  href = "/",
  className,
  imageClassName,
  height = 32,
  onClick,
}: Props) {
  const width = Math.round(height * 3.4);

  const image = (
    <Image
      src={LOGO_SRC}
      alt="Uklai"
      width={width}
      height={height}
      className={cn("h-7 sm:h-8 w-auto object-contain", imageClassName)}
      priority
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
