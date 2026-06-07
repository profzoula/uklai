"use client";

import { useRouter } from "next/navigation";

type Props = {
  href: string;
  children: React.ReactNode;
};

export function AdminClickableRow({ href, children }: Props) {
  const router = useRouter();

  return (
    <tr
      onClick={() => router.push(href)}
      className="hover:bg-slate-50 cursor-pointer"
    >
      {children}
    </tr>
  );
}
