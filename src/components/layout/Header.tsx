import Link from "next/link";
import { Suspense } from "react";
import { Bell, Upload } from "lucide-react";
import type { PublicUserDTO } from "@/application/dto/PublicUserDTO";
import { Logo } from "@/components/layout/Logo";
import { PreferencesMenu } from "@/components/layout/PreferencesMenu";
import { SearchBar } from "@/components/layout/SearchBar";
import { UserMenu } from "@/components/layout/UserMenu";
import { container } from "@/lib/container";
import { getI18n } from "@/lib/i18n/server";
import { getPreferences } from "@/lib/preferences-server";
import { loginPath } from "@/lib/url";

interface HeaderProps {
  user: PublicUserDTO | null;
}

export async function Header({ user }: HeaderProps) {
  const { t } = await getI18n();
  const { theme } = await getPreferences();
  const unread = user ? await container.notifications.unread(user.id) : 0;

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 w-full max-w-[1600px] items-center gap-2 px-4 sm:gap-4 sm:px-6">
        <Logo />
        <div className="mx-auto hidden w-full max-w-xl md:block">
          <Suspense fallback={null}>
            <SearchBar />
          </Suspense>
        </div>
        <div className="ml-auto flex items-center gap-2 md:ml-0">
          <Link
            href={user ? "/upload" : loginPath("/upload")}
            aria-label={t("nav.uploadTitle")}
            className="inline-flex h-10 items-center gap-2 rounded-full bg-neutral-100 px-3 text-sm font-medium text-neutral-900 transition-all hover:bg-neutral-200 active:scale-95"
          >
            <Upload aria-hidden="true" className="h-4 w-4" />
            <span className="hidden sm:inline">{t("nav.upload")}</span>
          </Link>
          {user ? (
            <Link
              href="/notifications"
              aria-label={t("nav.notifications")}
              className="relative inline-flex h-10 w-10 items-center justify-center rounded-full text-neutral-700 transition-colors hover:bg-neutral-100"
            >
              <Bell aria-hidden="true" className="h-5 w-5" />
              {unread > 0 ? (
                <span className="absolute right-1 top-1 min-w-4 animate-badge rounded-full bg-red-600 px-1 text-[10px] font-semibold leading-4 text-white">
                  {unread > 99 ? "99+" : unread}
                </span>
              ) : null}
            </Link>
          ) : null}
          <PreferencesMenu theme={theme} />
          {user ? (
            <UserMenu user={user} />
          ) : (
            <Link
              href="/login"
              className="inline-flex h-10 items-center rounded-full border border-neutral-300 px-4 text-sm font-medium text-neutral-900 transition-colors hover:bg-neutral-100"
            >
              {t("nav.login")}
            </Link>
          )}
        </div>
      </div>
      <div className="px-4 pb-2 md:hidden">
        <Suspense fallback={null}>
          <SearchBar />
        </Suspense>
      </div>
    </header>
  );
}
