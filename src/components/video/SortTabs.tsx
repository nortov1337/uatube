import Link from "next/link";
import { getI18n } from "@/lib/i18n/server";
import { withParams } from "@/lib/url";

const SORTS = ["new", "views", "likes"] as const;

interface SortTabsProps {
  active: string;
  basePath?: string;
  q?: string;
  tag?: string;
  category?: string;
}

export async function SortTabs({ active, basePath = "/", q, tag, category }: SortTabsProps) {
  const { t } = await getI18n();
  const labels = { new: t("sort.new"), views: t("sort.views"), likes: t("sort.likes") };

  return (
    <div className="flex items-center gap-1 rounded-full bg-neutral-100 p-1">
      {SORTS.map((sort) => (
        <Link
          key={sort}
          href={withParams(basePath, { q, tag, category, sort })}
          className={`inline-flex h-8 items-center rounded-full px-3 text-xs font-medium transition-all duration-200 ${
            active === sort
              ? "bg-surface text-neutral-900 shadow-sm"
              : "text-neutral-600 hover:text-neutral-900"
          }`}
        >
          {labels[sort]}
        </Link>
      ))}
    </div>
  );
}
