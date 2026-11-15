"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  Clock,
  Clapperboard,
  History,
  Home,
  ListVideo,
  Settings,
  Users,
  type LucideIcon,
} from "lucide-react";

export const NAV_ICONS = {
  home: Home,
  subscriptions: Users,
  history: History,
  playlists: ListVideo,
  studio: Clapperboard,
  watchLater: Clock,
  notifications: Bell,
  settings: Settings,
} satisfies Record<string, LucideIcon>;

export type NavIcon = keyof typeof NAV_ICONS;

export interface NavItem {
  href: string;
  label: string;
  icon: NavIcon;
}

export function SidebarNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-0.5">
      {items.map((item) => {
        const Icon = NAV_ICONS[item.icon];
        const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

        return (
          <Link
            key={`${item.href}-${item.label}`}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`group relative flex h-10 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors ${
              active
                ? "bg-neutral-100 text-neutral-900"
                : "text-neutral-800 hover:bg-neutral-100 hover:text-neutral-900"
            }`}
          >
            <span
              aria-hidden="true"
              className={`absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-red-600 transition-all duration-200 ${
                active ? "scale-y-100 opacity-100" : "scale-y-0 opacity-0"
              }`}
            />
            <Icon
              aria-hidden="true"
              className={`h-5 w-5 transition-transform duration-200 group-hover:scale-110 ${
                active ? "text-red-600" : "text-neutral-600"
              }`}
            />
            <span className="truncate">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
