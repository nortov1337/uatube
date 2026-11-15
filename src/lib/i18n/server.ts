import { cookies } from "next/headers";
import { DEFAULT_LOCALE, isLocale, LOCALE_COOKIE, type Locale } from "./config";
import { createTranslator, type Translate } from "./translate";

export interface I18n {
  locale: Locale;
  t: Translate;
}

export async function getLocale(): Promise<Locale> {
  const value = (await cookies()).get(LOCALE_COOKIE)?.value;
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

export async function getI18n(): Promise<I18n> {
  const locale = await getLocale();
  return { locale, t: createTranslator(locale) };
}
