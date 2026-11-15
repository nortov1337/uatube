import { formatViews } from "@/lib/format";
import type { Locale } from "./config";

interface UnitForms {
  ru: readonly [string, string, string];
  en: readonly [string, string];
}

const UNITS = {
  views: {
    ru: ["просмотр", "просмотра", "просмотров"],
    en: ["view", "views"],
  },
  subscribers: {
    ru: ["подписчик", "подписчика", "подписчиков"],
    en: ["subscriber", "subscribers"],
  },
  videos: {
    ru: ["видео", "видео", "видео"],
    en: ["video", "videos"],
  },
  comments: {
    ru: ["комментарий", "комментария", "комментариев"],
    en: ["comment", "comments"],
  },
  likes: {
    ru: ["лайк", "лайка", "лайков"],
    en: ["like", "likes"],
  },
  channels: {
    ru: ["канал", "канала", "каналов"],
    en: ["channel", "channels"],
  },
  playlists: {
    ru: ["плейлист", "плейлиста", "плейлистов"],
    en: ["playlist", "playlists"],
  },
} satisfies Record<string, UnitForms>;

export type CountUnit = keyof typeof UNITS;

function russianForm(count: number): 0 | 1 | 2 {
  const mod10 = Math.abs(count) % 10;
  const mod100 = Math.abs(count) % 100;
  if (mod10 === 1 && mod100 !== 11) return 0;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return 1;
  return 2;
}

export function countOf(unit: CountUnit, count: number, locale: Locale): string {
  const forms = UNITS[unit];
  const word =
    locale === "ru" ? forms.ru[russianForm(count)] : forms.en[Math.abs(count) === 1 ? 0 : 1];
  return `${formatViews(count, locale)} ${word}`;
}
