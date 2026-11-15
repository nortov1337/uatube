"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import type { Locale } from "@/lib/i18n/config";
import { createTranslator, type Translate } from "@/lib/i18n/translate";

interface I18nValue {
  locale: Locale;
  t: Translate;
}

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
  const value = useMemo<I18nValue>(() => ({ locale, t: createTranslator(locale) }), [locale]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const value = useContext(I18nContext);
  if (!value) throw new Error("useI18n requires I18nProvider");
  return value;
}
