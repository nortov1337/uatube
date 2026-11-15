export const THEMES = ["system", "light", "dark"] as const;

export type Theme = (typeof THEMES)[number];

export const DEFAULT_THEME: Theme = "system";

export const THEME_COOKIE = "uatube_theme";

export const PREFERENCE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export function isTheme(value: string | undefined): value is Theme {
  return THEMES.includes(value as Theme);
}

export function persistPreference(name: string, value: string): void {
  document.cookie = `${name}=${value}; path=/; max-age=${PREFERENCE_COOKIE_MAX_AGE}; samesite=lax`;
}

export function applyTheme(theme: Theme): void {
  document.documentElement.dataset.theme = theme;
}
