import Link from "next/link";
import { Play } from "lucide-react";

export function Logo() {
  return (
    <Link href="/" aria-label="UaTube — на главную" className="flex shrink-0 items-center gap-2">
      <span className="flex h-8 w-11 items-center justify-center rounded-lg bg-red-600 text-white">
        <Play aria-hidden="true" className="h-4 w-4 fill-current" />
      </span>
      <span className="text-lg font-bold tracking-tight">UaTube</span>
    </Link>
  );
}
