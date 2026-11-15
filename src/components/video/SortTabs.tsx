import Link from "next/link";
import { withParams } from "@/lib/url";

const SORTS = [
  { value: "new", label: "Новые" },
  { value: "views", label: "Популярные" },
  { value: "likes", label: "По лайкам" },
];

interface SortTabsProps {
  active: string;
  q?: string;
  tag?: string;
  category?: string;
}

export function SortTabs({ active, q, tag, category }: SortTabsProps) {
  return (
    <div className="flex items-center gap-1 rounded-full bg-neutral-100 p-1">
      {SORTS.map((sort) => (
        <Link
          key={sort.value}
          href={withParams("/", { q, tag, category, sort: sort.value })}
          className={`inline-flex h-8 items-center rounded-full px-3 text-xs font-medium ${
            active === sort.value ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-600"
          }`}
        >
          {sort.label}
        </Link>
      ))}
    </div>
  );
}
