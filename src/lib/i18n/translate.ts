import { DEFAULT_LOCALE, type Locale } from "./config";
import { messages, type MessageKey } from "./dictionary";

export type TranslateParams = Record<string, string | number>;

export type Translate = (key: MessageKey, params?: TranslateParams) => string;

export function translate(locale: Locale, key: MessageKey, params?: TranslateParams): string {
  const template = messages[locale][key] ?? messages[DEFAULT_LOCALE][key];
  if (!params) return template;

  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    params[name] === undefined ? match : String(params[name]),
  );
}

export function createTranslator(locale: Locale): Translate {
  return (key, params) => translate(locale, key, params);
}
