import Link from "next/link";
import type { ReactNode } from "react";

interface ChipProps {
  href?: string;
  active?: boolean;
  children: ReactNode;
}

const BASE =
  "inline-flex h-8 items-center gap-1 rounded-full border px-3 text-xs font-medium transition-all duration-150";

export function Chip({ href, active = false, children }: ChipProps) {
  const tone = active
    ? "border-strong bg-strong text-on-strong"
    : "border-neutral-200 bg-neutral-100 text-neutral-700 hover:border-neutral-300 hover:bg-neutral-200";

  if (!href) return <span className={`${BASE} ${tone}`}>{children}</span>;
  return (
    <Link href={href} className={`${BASE} ${tone}`}>
      {children}
    </Link>
  );
}
