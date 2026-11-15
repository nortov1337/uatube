import Link from "next/link";
import { Play } from "lucide-react";
import { getI18n } from "@/lib/i18n/server";

export async function Logo() {
  const { t } = await getI18n();

  return (
    <Link href="/" aria-label={t("nav.logoHome")} className="group flex shrink-0 items-center gap-2">
      <span className="relative flex h-8 w-11 items-center justify-center overflow-hidden rounded-lg bg-[linear-gradient(180deg,#0057b7_0%,#0057b7_50%,#ffd700_50%,#ffd700_100%)] shadow-sm ring-1 ring-black/10 transition-transform duration-300 group-hover:-rotate-3 group-hover:scale-105">
        <span className="pointer-events-none absolute inset-y-0 -left-full w-1/2 animate-flag bg-gradient-to-r from-transparent via-white/50 to-transparent" />
        <Play
          aria-hidden="true"
          className="relative h-4 w-4 fill-white text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.45)]"
        />
      </span>
      <span className="text-lg font-bold tracking-tight">UaTube</span>
    </Link>
  );
}
