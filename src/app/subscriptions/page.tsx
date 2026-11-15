import Link from "next/link";
import { redirect } from "next/navigation";
import { Users } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { EmptyState } from "@/components/ui/EmptyState";
import { VideoGrid } from "@/components/video/VideoGrid";
import { container } from "@/lib/container";
import { currentUserId } from "@/lib/http/currentUserId";
import { formatViews } from "@/lib/format";
import { getI18n } from "@/lib/i18n/server";
import { countOf } from "@/lib/i18n/units";

export const dynamic = "force-dynamic";

export default async function SubscriptionsPage() {
  const userId = await currentUserId();
  if (!userId) redirect("/login?next=/subscriptions");

  const { locale, t } = await getI18n();
  const [channels, feed] = await Promise.all([
    container.subscriptions.list(userId),
    container.subscriptions.feed(userId, { limit: 24 }),
  ]);

  return (
    <div>
      <h1 className="text-xl font-semibold text-neutral-900">{t("subscriptions.title")}</h1>
      <p className="mt-1 text-sm text-neutral-600">
        {countOf("channels", channels.length, locale)} · {t("subscriptions.summary")}
      </p>

      {channels.length > 0 ? (
        <div className="-mx-4 mt-4 flex gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
          {channels.map((channel) => (
            <Link
              key={channel.id}
              href={`/channel/${channel.handle}`}
              className="flex w-24 shrink-0 flex-col items-center gap-2 rounded-xl p-2 text-center transition-colors hover:bg-neutral-50"
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
                {formatViews(channel.subscribers, locale)}
              </span>
            </Link>
          ))}
        </div>
      ) : null}

      <div className="mt-6">
        {channels.length === 0 ? (
          <EmptyState
            icon={<Users className="h-10 w-10" />}
            title={t("subscriptions.empty")}
            description={t("subscriptions.emptyDesc")}
            action={
              <Link
                href="/"
                className="inline-flex h-10 items-center rounded-full bg-red-600 px-4 text-sm font-medium text-white shadow-sm transition-all hover:bg-red-700 active:scale-95"
              >
                {t("subscriptions.watchVideos")}
              </Link>
            }
          />
        ) : (
          <VideoGrid
            videos={feed.items}
            emptyTitle={t("subscriptions.noNew")}
            emptyDescription={t("subscriptions.noNewDesc")}
            emptyAction={{ href: "/", label: t("subscriptions.watchAll") }}
          />
        )}
      </div>
    </div>
  );
}
