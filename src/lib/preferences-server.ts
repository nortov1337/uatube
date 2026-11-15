import { cookies } from "next/headers";
import { DEFAULT_THEME, isTheme, THEME_COOKIE, type Theme } from "@/lib/preferences";

export interface Preferences {
  theme: Theme;
}

export async function getPreferences(): Promise<Preferences> {
  const themeCookie = (await cookies()).get(THEME_COOKIE)?.value;
  return { theme: isTheme(themeCookie) ? themeCookie : DEFAULT_THEME };
}
