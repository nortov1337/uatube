import Link from "next/link";
import { redirect } from "next/navigation";
import { Users } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { EmptyState } from "@/components/ui/EmptyState";
import { VideoGrid } from "@/components/video/VideoGrid";
import { container } from "@/lib/container";
import { currentUserId } from "@/lib/http/currentUserId";
import { formatViews } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function SubscriptionsPage() {
  const userId = await currentUserId();
  if (!userId) redirect("/login?next=/subscriptions");

  const [channels, feed] = await Promise.all([
    container.subscriptions.list(userId),
    container.subscriptions.feed(userId, { limit: 24 }),
  ]);

  return (
    <div>
      <h1 className="text-xl font-semibold text-neutral-900">Подписки</h1>
      <p className="mt-1 text-sm text-neutral-600">
        {channels.length} каналов · новые видео подписок в одном месте.
      </p>

      {channels.length > 0 ? (
        <div className="-mx-4 mt-4 flex gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
          {channels.map((channel) => (
            <Link
              key={channel.id}
              href={`/channel/${channel.handle}`}
              className="flex w-24 shrink-0 flex-col items-center gap-2 rounded-xl p-2 text-center hover:bg-neutral-50"
            >
              <Avatar
                handle={channel.handle}
                name={channel.name}
                src={channel.avatarUrl}
                size="md"
              />
              <span className="line-clamp-1 text-xs font-medium text-neutral-900">
                {channel.name}
              </span>
              <span className="text-[11px] text-neutral-500">
                {formatViews(channel.subscribers)}
              </span>
            </Link>
          ))}
        </div>
      ) : null}

      <div className="mt-6">
        {channels.length === 0 ? (
          <EmptyState
            icon={<Users className="h-10 w-10" />}
            title="Вы пока ни на кого не подписаны"
            description="Подпишитесь на каналы, чтобы видеть их новые видео здесь."
            action={
              <Link
                href="/"
                className="inline-flex h-10 items-center rounded-full bg-red-600 px-4 text-sm font-medium text-white hover:bg-red-700"
              >
                Смотреть видео
              </Link>
            }
          />
        ) : (
          <VideoGrid
            videos={feed.items}
            emptyTitle="Новых видео нет"
            emptyDescription="Как только каналы опубликуют видео, они появятся здесь."
            emptyAction={{ href: "/", label: "Смотреть все видео" }}
          />
        )}
      </div>
    </div>
  );
}
