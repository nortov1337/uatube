import Link from "next/link";
import {
  Bell,
  Clock,
  Clapperboard,
  History,
  Home,
  ListVideo,
  Settings,
  Users,
} from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { container } from "@/lib/container";

const ITEMS = [
  { href: "/", label: "Главная", icon: Home },
  { href: "/subscriptions", label: "Подписки", icon: Users },
  { href: "/history", label: "История", icon: History },
  { href: "/playlists", label: "Плейлисты", icon: ListVideo },
  { href: "/studio", label: "Мои видео", icon: Clapperboard },
];

const USER_ITEMS = [
  { href: "/notifications", label: "Уведомления", icon: Bell },
  { href: "/settings", label: "Настройки", icon: Settings },
];

export async function Sidebar() {
  const user = await container.auth.currentUser();
  const channels = user ? await container.subscriptions.list(user.id) : [];

  return (
    <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-56 shrink-0 overflow-y-auto border-r border-neutral-200 pb-6 pt-4 pr-3 lg:block">
      <nav className="flex flex-col gap-0.5">
        {ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium text-neutral-800 hover:bg-neutral-100"
          >
            <item.icon aria-hidden="true" className="h-5 w-5 text-neutral-600" />
            {item.label}
          </Link>
        ))}
        {user ? (
          <Link
            href="/playlists"
            className="flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium text-neutral-800 hover:bg-neutral-100"
          >
            <Clock aria-hidden="true" className="h-5 w-5 text-neutral-600" />
            Смотреть позже
          </Link>
        ) : null}
      </nav>

      {channels.length > 0 ? (
        <div className="mt-4 border-t border-neutral-200 pt-3">
          <p className="px-3 pb-1 text-xs font-semibold uppercase tracking-wide text-neutral-500">
            Подписки
          </p>
          {channels.slice(0, 12).map((channel) => (
            <Link
              key={channel.id}
              href={`/channel/${channel.handle}`}
              className="flex h-10 items-center gap-2 rounded-lg px-3 text-sm text-neutral-800 hover:bg-neutral-100"
            >
              <Avatar
                handle={channel.handle}
                name={channel.name}
                src={channel.avatarUrl}
                size="sm"
              />
              <span className="truncate">{channel.name}</span>
            </Link>
          ))}
        </div>
      ) : null}

      {user ? (
        <div className="mt-4 border-t border-neutral-200 pt-3">
          {USER_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium text-neutral-800 hover:bg-neutral-100"
            >
              <item.icon aria-hidden="true" className="h-5 w-5 text-neutral-600" />
              {item.label}
            </Link>
          ))}
        </div>
      ) : null}
    </aside>
  );
}
