export const LOCALES = ["ru", "en"] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "ru";

export const LOCALE_COOKIE = "uatube_locale";

export const LOCALE_LABELS: Record<Locale, string> = {
  ru: "Русский",
  en: "English",
};

export const INTL_LOCALES: Record<Locale, string> = {
  ru: "ru-RU",
  en: "en-US",
};

export function isLocale(value: string | undefined): value is Locale {
  return LOCALES.includes(value as Locale);
}
