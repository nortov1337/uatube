export type CategoryLocale = "ru" | "en";

export const VIDEO_CATEGORIES = [
  { slug: "music", labels: { ru: "Музыка", en: "Music" } },
  { slug: "gaming", labels: { ru: "Игры", en: "Gaming" } },
  { slug: "education", labels: { ru: "Образование", en: "Education" } },
  { slug: "tech", labels: { ru: "Технологии", en: "Tech" } },
  { slug: "sport", labels: { ru: "Спорт", en: "Sports" } },
  { slug: "humor", labels: { ru: "Юмор", en: "Comedy" } },
  { slug: "film", labels: { ru: "Кино", en: "Film" } },
  { slug: "news", labels: { ru: "Новости", en: "News" } },
  { slug: "lifestyle", labels: { ru: "Лайфстайл", en: "Lifestyle" } },
  { slug: "travel", labels: { ru: "Путешествия", en: "Travel" } },
  { slug: "cooking", labels: { ru: "Кулинария", en: "Cooking" } },
  { slug: "art", labels: { ru: "Творчество", en: "Art" } },
  { slug: "other", labels: { ru: "Другое", en: "Other" } },
] as const;

export type VideoCategorySlug = (typeof VIDEO_CATEGORIES)[number]["slug"];

export const VIDEO_CATEGORY_SLUGS = VIDEO_CATEGORIES.map((category) => category.slug) as [
  VideoCategorySlug,
  ...VideoCategorySlug[],
];

export function categoryLabel(slug: string, locale: CategoryLocale): string {
  return VIDEO_CATEGORIES.find((category) => category.slug === slug)?.labels[locale] ?? "";
}
