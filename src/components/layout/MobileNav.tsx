import Link from "next/link";
import { Clapperboard, History, Home, ListVideo, Users } from "lucide-react";

const ITEMS = [
  { href: "/", label: "Главная", icon: Home },
  { href: "/subscriptions", label: "Подписки", icon: Users },
  { href: "/history", label: "История", icon: History },
  { href: "/playlists", label: "Плейлисты", icon: ListVideo },
  { href: "/studio", label: "Мои видео", icon: Clapperboard },
];

export function MobileNav() {
  return (
    <nav className="-mx-4 mb-4 flex gap-2 overflow-x-auto px-4 pb-1 lg:hidden">
      {ITEMS.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3 text-xs font-medium text-neutral-800"
        >
          <item.icon aria-hidden="true" className="h-4 w-4 text-neutral-600" />
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
