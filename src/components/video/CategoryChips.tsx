import { Chip } from "@/components/ui/Chip";
import { VIDEO_CATEGORIES } from "@/domain/values/VideoCategory";
import { withParams } from "@/lib/url";

interface CategoryChipsProps {
  active?: string;
  q?: string;
  tag?: string;
}

export function CategoryChips({ active, q, tag }: CategoryChipsProps) {
  return (
    <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
      <Chip href={withParams("/", { q, tag })} active={!active}>
        Все
      </Chip>
      {VIDEO_CATEGORIES.map((category) => (
        <Chip
          key={category.slug}
          href={withParams("/", { q, tag, category: category.slug })}
          active={active === category.slug}
        >
          {category.label}
        </Chip>
      ))}
    </div>
  );
}
