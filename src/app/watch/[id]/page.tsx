import Link from "next/link";
import { notFound } from "next/navigation";
import type { PlaylistDetailsDTO } from "@/application/dto/PlaylistDTO";
import type { VideoDetailsDTO } from "@/application/dto/VideoDetailsDTO";
import { CommentsSection } from "@/components/comments/CommentsSection";
import { PlaylistQueue } from "@/components/playlist/PlaylistQueue";
import { Avatar } from "@/components/ui/Avatar";
import { LikeButton } from "@/components/video/LikeButton";
import { OwnerActions } from "@/components/video/OwnerActions";
import { RelatedList } from "@/components/video/RelatedList";
import { SaveToPlaylist } from "@/components/video/SaveToPlaylist";
import { ShareButton } from "@/components/video/ShareButton";
import { SubscribeButton } from "@/components/video/SubscribeButton";
import { VideoDescription } from "@/components/video/VideoDescription";
import { VideoMeta } from "@/components/video/VideoMeta";
import { VideoPlayer } from "@/components/video/VideoPlayer";
import { WatchLaterButton } from "@/components/video/WatchLaterButton";
import { NotFoundError } from "@/domain/errors/NotFoundError";
import { container } from "@/lib/container";
import { currentUserId } from "@/lib/http/currentUserId";

export const dynamic = "force-dynamic";

interface WatchPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ list?: string }>;
}

async function loadVideo(id: string, viewerId: string | null): Promise<VideoDetailsDTO> {
  try {
    return await container.videos.getDetails(id, viewerId);
  } catch (error) {
    if (error instanceof NotFoundError) notFound();
    throw error;
  }
}

async function loadPlaylist(
  playlistId: string | undefined,
  viewerId: string | null,
): Promise<PlaylistDetailsDTO | null> {
  if (!playlistId) return null;
  return container.playlists.getDetails(playlistId, viewerId).catch(() => null);
}

export default async function WatchPage({ params, searchParams }: WatchPageProps) {
  const { id } = await params;
  const { list } = await searchParams;
  const viewerId = await currentUserId();
  const video = await loadVideo(id, viewerId);

  const [comments, related, channel, resumeSec, watchLater, playlist] = await Promise.all([
    container.comments.list(video.id, { limit: 20 }, viewerId),
    container.videos.listRelated(video.id, viewerId, 10),
    container.channels.getSummary(video.author.handle, viewerId),
    viewerId ? container.history.position(viewerId, video.id) : Promise.resolve(0),
    viewerId ? container.playlists.watchLaterState(viewerId, video.id) : Promise.resolve(false),
    loadPlaylist(list, viewerId),
  ]);

  const isOwner = viewerId === video.author.id;
  const queueIndex = playlist ? playlist.items.findIndex((item) => item.id === video.id) : -1;
  const nextItem =
    playlist && queueIndex >= 0 ? (playlist.items[queueIndex + 1] ?? null) : null;
  const nextHref = playlist && nextItem ? `/watch/${nextItem.id}?list=${playlist.id}` : null;

  return (
    <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-6">
      <div className="min-w-0">
        <VideoPlayer
          id={video.id}
          poster={video.thumbUrl}
          resumeSec={resumeSec}
          nextHref={nextHref}
        />

        <div className="mt-3 flex flex-col gap-3">
          <VideoMeta video={video} />
          <div className="flex flex-wrap items-center gap-2">
            <LikeButton
              videoId={video.id}
              initialLiked={video.likedByMe}
              initialLikes={video.likesCount}
              isGuest={!viewerId}
            />
            <WatchLaterButton videoId={video.id} initialSaved={watchLater} isGuest={!viewerId} />
            <SaveToPlaylist videoId={video.id} isGuest={!viewerId} />
            <ShareButton videoId={video.id} title={video.title} />
            {isOwner ? <OwnerActions videoId={video.id} /> : null}
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <Avatar
            handle={video.author.handle}
            name={video.author.name}
            src={video.author.avatarUrl}
            size="md"
          />
          <Link href={`/channel/${video.author.handle}`} className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-neutral-900">{video.author.name}</p>
            <p className="truncate text-xs text-neutral-600">
              @{video.author.handle} · {channel.stats.subscribers} подписчиков
            </p>
          </Link>
          <SubscribeButton
            handle={video.author.handle}
            initialSubscribed={channel.subscribedByMe}
            initialSubscribers={channel.stats.subscribers}
            isGuest={!viewerId}
            isOwner={isOwner}
          />
        </div>

        <div className="mt-3">
          <VideoDescription description={video.description} sizeBytes={video.sizeBytes} />
        </div>

        <CommentsSection
          videoId={video.id}
          initial={comments}
          initialSort="new"
          totalCount={video.commentsCount}
          currentUserId={viewerId}
          videoAuthorId={video.author.id}
        />
      </div>

      <aside className="mt-8 flex flex-col gap-6 lg:mt-0">
        {playlist ? (
          <PlaylistQueue
            playlistId={playlist.id}
            title={playlist.title}
            items={playlist.items}
            activeId={video.id}
          />
        ) : null}
        <div>
          <h2 className="mb-3 text-sm font-semibold text-neutral-900">Похожие видео</h2>
          <RelatedList videos={related} />
        </div>
      </aside>
    </div>
  );
}
