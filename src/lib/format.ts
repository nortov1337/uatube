import { INTL_LOCALES, type Locale } from "@/lib/i18n/config";

const numberFormats: Record<Locale, Intl.NumberFormat> = {
  ru: new Intl.NumberFormat(INTL_LOCALES.ru, { maximumFractionDigits: 1 }),
  en: new Intl.NumberFormat(INTL_LOCALES.en, { maximumFractionDigits: 1 }),
};

const VIEW_SUFFIXES: Record<Locale, { thousand: string; million: string }> = {
  ru: { thousand: "тыс.", million: "млн" },
  en: { thousand: "K", million: "M" },
};

export function formatViews(views: number, locale: Locale): string {
  const suffix = VIEW_SUFFIXES[locale];
  if (views < 1000) return numberFormats[locale].format(views);
  if (views < 1_000_000) return `${numberFormats[locale].format(views / 1000)} ${suffix.thousand}`;
  return `${numberFormats[locale].format(views / 1_000_000)} ${suffix.million}`;
}

export function formatDuration(totalSeconds: number): string {
  const seconds = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const rest = seconds % 60;
  const pad = (value: number) => String(value).padStart(2, "0");
  return hours > 0 ? `${hours}:${pad(minutes)}:${pad(rest)}` : `${minutes}:${pad(rest)}`;
}

const BYTE_UNITS: Record<Locale, readonly string[]> = {
  ru: ["Б", "КБ", "МБ", "ГБ"],
  en: ["B", "KB", "MB", "GB"],
};

export function formatBytes(bytes: number, locale: Locale): string {
  const units = BYTE_UNITS[locale];
  let value = bytes;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }
  return `${numberFormats[locale].format(value)} ${units[unitIndex]}`;
}

const monthYearFormats: Record<Locale, Intl.DateTimeFormat> = {
  ru: new Intl.DateTimeFormat(INTL_LOCALES.ru, { month: "long", year: "numeric" }),
  en: new Intl.DateTimeFormat(INTL_LOCALES.en, { month: "long", year: "numeric" }),
};

export function formatMonthYear(value: string | Date, locale: Locale): string {
  const date = typeof value === "string" ? new Date(value) : value;
  return monthYearFormats[locale].format(date);
}

const relativeFormats: Record<Locale, Intl.RelativeTimeFormat> = {
  ru: new Intl.RelativeTimeFormat(INTL_LOCALES.ru, { numeric: "auto" }),
  en: new Intl.RelativeTimeFormat(INTL_LOCALES.en, { numeric: "auto" }),
};

const STEPS: Array<[Intl.RelativeTimeFormatUnit, number]> = [
  ["year", 365 * 24 * 60 * 60],
  ["month", 30 * 24 * 60 * 60],
  ["week", 7 * 24 * 60 * 60],
  ["day", 24 * 60 * 60],
  ["hour", 60 * 60],
  ["minute", 60],
];

export function timeAgo(value: string | Date, locale: Locale): string {
  const date = typeof value === "string" ? new Date(value) : value;
  const diffSec = Math.round((date.getTime() - Date.now()) / 1000);
  const abs = Math.abs(diffSec);
  const formatter = relativeFormats[locale];

  for (const [unit, seconds] of STEPS) {
    if (abs >= seconds) {
      return formatter.format(Math.round(diffSec / seconds), unit);
    }
  }
  return formatter.format(diffSec, "second");
}
