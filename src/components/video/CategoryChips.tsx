import { Chip } from "@/components/ui/Chip";
import { VIDEO_CATEGORIES, categoryLabel } from "@/domain/values/VideoCategory";
import { getI18n } from "@/lib/i18n/server";
import { withParams } from "@/lib/url";

interface CategoryChipsProps {
  active?: string;
  q?: string;
  tag?: string;
}

export async function CategoryChips({ active, q, tag }: CategoryChipsProps) {
  const { locale, t } = await getI18n();

  return (
    <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
      <Chip href={withParams("/", { q, tag })} active={!active}>
        {t("category.all")}
      </Chip>
      {VIDEO_CATEGORIES.map((category) => (
        <Chip
          key={category.slug}
          href={withParams("/", { q, tag, category: category.slug })}
          active={active === category.slug}
        >
          {categoryLabel(category.slug, locale)}
        </Chip>
      ))}
    </div>
  );
}
