export const VIDEO_CATEGORIES = [
  { slug: "music", label: "Музыка" },
  { slug: "gaming", label: "Игры" },
  { slug: "education", label: "Образование" },
  { slug: "tech", label: "Технологии" },
  { slug: "sport", label: "Спорт" },
  { slug: "humor", label: "Юмор" },
  { slug: "film", label: "Кино" },
  { slug: "news", label: "Новости" },
  { slug: "lifestyle", label: "Лайфстайл" },
  { slug: "travel", label: "Путешествия" },
  { slug: "cooking", label: "Кулинария" },
  { slug: "art", label: "Творчество" },
  { slug: "other", label: "Другое" },
] as const;

export type VideoCategorySlug = (typeof VIDEO_CATEGORIES)[number]["slug"];

export const VIDEO_CATEGORY_SLUGS = VIDEO_CATEGORIES.map((category) => category.slug) as [
  VideoCategorySlug,
  ...VideoCategorySlug[],
];

export function categoryLabel(slug: string): string {
  return VIDEO_CATEGORIES.find((category) => category.slug === slug)?.label ?? "";
}
