"use client";

import { Search } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useI18n } from "@/components/i18n/I18nProvider";

export function SearchBar() {
  const searchParams = useSearchParams();
  const { t } = useI18n();

  return (
    <form action="/" method="get" role="search" className="relative w-full">
      <Search
        aria-hidden="true"
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
      />
      <input
        type="search"
        name="q"
        defaultValue={searchParams.get("q") ?? ""}
        placeholder={t("nav.searchPlaceholder")}
        aria-label={t("nav.searchLabel")}
        className="h-10 w-full rounded-full border border-neutral-300 bg-neutral-50 pl-9 pr-3 text-sm text-neutral-900 outline-none transition-colors placeholder:text-neutral-400 focus:border-red-500 focus:bg-surface"
      />
    </form>
  );
}
