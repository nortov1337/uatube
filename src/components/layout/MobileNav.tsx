"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/components/i18n/I18nProvider";
import { NAV_ICONS, type NavItem } from "@/components/layout/SidebarNav";

export function MobileNav() {
  const pathname = usePathname();
  const { t } = useI18n();

  const items: NavItem[] = [
    { href: "/", label: t("nav.home"), icon: "home" },
    { href: "/subscriptions", label: t("nav.subscriptions"), icon: "subscriptions" },
    { href: "/history", label: t("nav.history"), icon: "history" },
    { href: "/playlists", label: t("nav.playlists"), icon: "playlists" },
    { href: "/studio", label: t("nav.studio"), icon: "studio" },
  ];

  return (
    <nav className="-mx-4 mb-4 flex gap-2 overflow-x-auto px-4 pb-1 lg:hidden">
      {items.map((item) => {
        const Icon = NAV_ICONS[item.icon];
        const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-3 text-xs font-medium transition-colors ${
              active
                ? "border-neutral-900 bg-strong text-on-strong"
                : "border-neutral-200 bg-surface text-neutral-800"
            }`}
          >
            <Icon aria-hidden="true" className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
