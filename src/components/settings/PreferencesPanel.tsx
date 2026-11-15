"use client";

import { useRouter } from "next/navigation";
import { Monitor, Moon, Sun } from "lucide-react";
import { useState, useTransition } from "react";
import { useI18n } from "@/components/i18n/I18nProvider";
import { LOCALE_COOKIE, LOCALE_LABELS, LOCALES, type Locale } from "@/lib/i18n/config";
import type { MessageKey } from "@/lib/i18n/dictionary";
import { applyTheme, persistPreference, THEME_COOKIE, THEMES, type Theme } from "@/lib/preferences";

const THEME_ICONS = { system: Monitor, light: Sun, dark: Moon } as const;

const THEME_LABELS: Record<Theme, MessageKey> = {
  system: "prefs.themeSystem",
  light: "prefs.themeLight",
  dark: "prefs.themeDark",
};

const SEGMENT =
  "inline-flex h-8 items-center justify-center gap-1 rounded-lg text-[11px] font-medium transition-all duration-200";
const SEGMENT_ACTIVE = "bg-surface text-neutral-900 shadow-sm";
const SEGMENT_IDLE = "text-neutral-500 hover:text-neutral-900";

interface PreferencesPanelProps {
  theme: Theme;
}

export function PreferencesPanel({ theme }: PreferencesPanelProps) {
  const { locale, t } = useI18n();
  const router = useRouter();
  const [activeTheme, setActiveTheme] = useState<Theme>(theme);
  const [pending, startTransition] = useTransition();

  const changeTheme = (next: Theme) => {
    persistPreference(THEME_COOKIE, next);
    applyTheme(next);
    setActiveTheme(next);
  };

  const changeLocale = (next: Locale) => {
    if (next === locale) return;
    persistPreference(LOCALE_COOKIE, next);
    startTransition(() => router.refresh());
  };

  return (
    <div className={`flex flex-col gap-3 transition-opacity ${pending ? "opacity-50" : ""}`}>
      <div>
        <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
          {t("prefs.theme")}
        </p>
        <div className="grid grid-cols-3 gap-1 rounded-xl bg-neutral-100 p-1">
          {THEMES.map((value) => {
            const Icon = THEME_ICONS[value];
            const label = t(THEME_LABELS[value]);
            return (
              <button
                key={value}
                type="button"
                onClick={() => changeTheme(value)}
                aria-pressed={activeTheme === value}
                title={label}
                className={`${SEGMENT} ${activeTheme === value ? SEGMENT_ACTIVE : SEGMENT_IDLE}`}
              >
                <Icon aria-hidden="true" className="h-3.5 w-3.5" />
                <span className="sr-only">{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
          {t("prefs.language")}
        </p>
        <div className="grid grid-cols-2 gap-1 rounded-xl bg-neutral-100 p-1">
          {LOCALES.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => changeLocale(value)}
              aria-pressed={locale === value}
              className={`${SEGMENT} ${locale === value ? SEGMENT_ACTIVE : SEGMENT_IDLE}`}
            >
              {LOCALE_LABELS[value]}
            </button>
          ))}
        </div>
      </div>

      <p className="text-[11px] leading-snug text-neutral-500">{t("prefs.hint")}</p>
    </div>
  );
}
