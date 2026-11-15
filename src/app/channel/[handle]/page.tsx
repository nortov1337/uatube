import Link from "next/link";
import { notFound } from "next/navigation";
import type { ChannelPageData } from "@/application/services/ChannelService";
import type { PlaylistDTO } from "@/application/dto/PlaylistDTO";
import { PlaylistCard } from "@/components/playlist/PlaylistCard";
import { Avatar } from "@/components/ui/Avatar";
import { VideoGrid } from "@/components/video/VideoGrid";
import { SortTabs } from "@/components/video/SortTabs";
import { SubscribeButton } from "@/components/video/SubscribeButton";
import { NotFoundError } from "@/domain/errors/NotFoundError";
import { container } from "@/lib/container";
import { currentUserId } from "@/lib/http/currentUserId";
import { formatMonthYear, formatViews } from "@/lib/format";
import { withParams } from "@/lib/url";

export const dynamic = "force-dynamic";

interface ChannelPageProps {
  params: Promise<{ handle: string }>;
  searchParams: Promise<{ tab?: string; sort?: string }>;
}

const TABS = [
  { value: "videos", label: "Видео" },
  { value: "playlists", label: "Плейлисты" },
  { value: "about", label: "О канале" },
];

async function loadChannel(
  handle: string,
  viewerId: string | null,
  sort: string,
): Promise<ChannelPageData> {
  try {
    return await container.channels.getByHandle(handle, viewerId, { sort, limit: 24 });
  } catch (error) {
    if (error instanceof NotFoundError) notFound();
    throw error;
  }
}

export default async function ChannelPage({ params, searchParams }: ChannelPageProps) {
  const { handle } = await params;
  const { tab, sort } = await searchParams;
  const viewerId = await currentUserId();
  const activeTab = tab ?? "videos";
  const activeSort = sort ?? "new";
  const { channel, videos, playlists } = await loadChannel(handle, viewerId, activeSort);

  return (
    <div>
      <div className="overflow-hidden rounded-2xl bg-neutral-100">
        {channel.bannerUrl ? (
          <img
            src={channel.bannerUrl}
            alt="Баннер канала"
            className="aspect-[6/1] w-full object-cover"
          />
        ) : (
          <div className="aspect-[6/1] w-full bg-gradient-to-r from-neutral-200 via-neutral-300 to-neutral-200" />
        )}
      </div>

      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start">
        <Avatar
          handle={channel.handle}
          name={channel.name}
          src={channel.avatarUrl}
          size="xl"
        />
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-xl font-semibold text-neutral-900">{channel.name}</h1>
          <p className="text-sm text-neutral-600">@{channel.handle}</p>
          <p className="mt-1 text-sm text-neutral-600">
            {formatViews(channel.stats.videos)} видео · {formatViews(channel.stats.views)}{" "}
            просмотров · {formatViews(channel.stats.subscribers)} подписчиков · на сайте с{" "}
            {formatMonthYear(channel.createdAt)}
          </p>
          {channel.bio ? (
            <p className="mt-2 line-clamp-3 whitespace-pre-wrap text-sm text-neutral-700">
              {channel.bio}
            </p>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          <SubscribeButton
            handle={channel.handle}
            initialSubscribed={channel.subscribedByMe}
            initialSubscribers={channel.stats.subscribers}
            isGuest={!viewerId}
            isOwner={channel.isOwner}
          />
          {channel.isOwner ? (
            <Link
              href="/studio"
              className="inline-flex h-10 items-center rounded-full bg-neutral-100 px-4 text-sm font-medium text-neutral-900 hover:bg-neutral-200"
            >
              Мои видео
            </Link>
          ) : null}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200">
        <div className="flex gap-1">
          {TABS.map((item) => (
            <Link
              key={item.value}
              href={withParams(`/channel/${channel.handle}`, {
                tab: item.value === "videos" ? undefined : item.value,
                sort: item.value === "videos" ? sort : undefined,
              })}
              className={`border-b-2 px-3 py-2 text-sm font-medium ${
                activeTab === item.value
                  ? "border-neutral-900 text-neutral-900"
                  : "border-transparent text-neutral-600 hover:text-neutral-900"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
        {activeTab === "videos" ? (
          <div className="pb-2">
            <SortTabs
              active={activeSort}
              q={undefined}
              tag={undefined}
              category={undefined}
            />
          </div>
        ) : null}
      </div>

      <div className="mt-5">
        {activeTab === "playlists" ? (
          playlists.length === 0 ? (
            <p className="text-sm text-neutral-500">Плейлистов пока нет.</p>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {playlists.map((playlist: PlaylistDTO) => (
                <PlaylistCard key={playlist.id} playlist={playlist} />
              ))}
            </div>
          )
        ) : activeTab === "about" ? (
          <div className="max-w-2xl text-sm text-neutral-700">
            <p className="whitespace-pre-wrap">
              {channel.bio || "Автор пока ничего о себе не рассказал."}
            </p>
            <dl className="mt-4 grid grid-cols-2 gap-3 text-neutral-900">
              <div>
                <dt className="text-xs text-neutral-500">Видео</dt>
                <dd className="font-semibold">{channel.stats.videos}</dd>
              </div>
              <div>
                <dt className="text-xs text-neutral-500">Просмотры</dt>
                <dd className="font-semibold">{formatViews(channel.stats.views)}</dd>
              </div>
              <div>
                <dt className="text-xs text-neutral-500">Лайки</dt>
                <dd className="font-semibold">{channel.stats.likes}</dd>
              </div>
              <div>
                <dt className="text-xs text-neutral-500">Подписчики</dt>
                <dd className="font-semibold">{channel.stats.subscribers}</dd>
              </div>
            </dl>
          </div>
        ) : (
          <VideoGrid
            videos={videos.items}
            emptyTitle="На канале пока нет видео"
            emptyDescription="Загрузите видео, чтобы оно появилось здесь."
            emptyAction={
              channel.isOwner ? { href: "/upload", label: "Загрузить видео" } : null
            }
          />
        )}
      </div>
    </div>
  );
}
