import Link from "next/link";
import type { PublicUserDTO } from "@/application/dto/PublicUserDTO";
import { SidebarNav, type NavItem } from "@/components/layout/SidebarNav";
import { Avatar } from "@/components/ui/Avatar";
import { container } from "@/lib/container";
import { getI18n } from "@/lib/i18n/server";

interface SidebarProps {
  user: PublicUserDTO | null;
}

export async function Sidebar({ user }: SidebarProps) {
  const { t } = await getI18n();
  const channels = user ? await container.subscriptions.list(user.id) : [];

  const items: NavItem[] = [
    { href: "/", label: t("nav.home"), icon: "home" },
    { href: "/subscriptions", label: t("nav.subscriptions"), icon: "subscriptions" },
    { href: "/history", label: t("nav.history"), icon: "history" },
    { href: "/playlists", label: t("nav.playlists"), icon: "playlists" },
    { href: "/studio", label: t("nav.studio"), icon: "studio" },
    ...(user
      ? [{ href: "/notifications", label: t("nav.notifications"), icon: "notifications" as const }]
      : []),
    { href: "/settings", label: t("nav.settings"), icon: "settings" },
  ];

  return (
    <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-56 shrink-0 overflow-y-auto border-r border-line pb-6 pt-4 pr-3 lg:block">
      <SidebarNav items={items} />

      {channels.length > 0 ? (
        <div className="mt-4 pt-3">
          <p className="px-3 pb-1 text-xs font-semibold uppercase tracking-wide text-neutral-500">
            {t("nav.subscriptions")}
          </p>
          {channels.slice(0, 12).map((channel) => (
            <Link
              key={channel.id}
              href={`/channel/${channel.handle}`}
              className="flex h-10 items-center gap-2 rounded-xl px-3 text-sm text-neutral-800 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
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
    </aside>
  );
}
