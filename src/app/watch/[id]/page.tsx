import Link from "next/link";
import { notFound } from "next/navigation";
import type { VideoDetailsDTO } from "@/application/dto/VideoDetailsDTO";
import { CommentsSection } from "@/components/comments/CommentsSection";
import { Avatar } from "@/components/ui/Avatar";
import { LikeButton } from "@/components/video/LikeButton";
import { OwnerActions } from "@/components/video/OwnerActions";
import { RelatedList } from "@/components/video/RelatedList";
import { VideoDescription } from "@/components/video/VideoDescription";
import { VideoMeta } from "@/components/video/VideoMeta";
import { VideoPlayer } from "@/components/video/VideoPlayer";
import { NotFoundError } from "@/domain/errors/NotFoundError";
import { container } from "@/lib/container";
import { currentUserId } from "@/lib/http/currentUserId";

export const dynamic = "force-dynamic";

interface WatchPageProps {
  params: Promise<{ id: string }>;
}

async function loadVideo(id: string, viewerId: string | null): Promise<VideoDetailsDTO> {
  try {
    return await container.videos.getDetails(id, viewerId);
  } catch (error) {
    if (error instanceof NotFoundError) notFound();
    throw error;
  }
}

export default async function WatchPage({ params }: WatchPageProps) {
  const { id } = await params;
  const viewerId = await currentUserId();
  const video = await loadVideo(id, viewerId);

  const [comments, related] = await Promise.all([
    container.comments.list(video.id, { limit: 20 }),
    container.videos.listRelated(video.id, 8),
  ]);

  return (
    <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-6">
      <div className="min-w-0">
        <VideoPlayer id={video.id} poster={video.thumbUrl} />

        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <VideoMeta video={video} />
          <div className="flex shrink-0 items-center gap-2">
            <LikeButton
              videoId={video.id}
              initialLiked={video.likedByMe}
              initialLikes={video.likesCount}
              isGuest={!viewerId}
            />
            {viewerId === video.author.id ? <OwnerActions videoId={video.id} /> : null}
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <Avatar handle={video.author.handle} name={video.author.name} />
          <Link href={`/channel/${video.author.handle}`} className="min-w-0">
            <p className="truncate text-sm font-semibold text-neutral-900">{video.author.name}</p>
            <p className="truncate text-xs text-neutral-600">@{video.author.handle}</p>
          </Link>
        </div>

        <div className="mt-3">
          <VideoDescription
            description={video.description}
            views={video.views}
            createdAt={video.createdAt}
            sizeBytes={video.sizeBytes}
          />
        </div>

        <CommentsSection
          videoId={video.id}
          initial={comments}
          currentUserId={viewerId}
          videoAuthorId={video.author.id}
        />
      </div>

      <aside className="mt-8 lg:mt-0">
        <h2 className="mb-3 text-sm font-semibold text-neutral-900">Похожие видео</h2>
        <RelatedList videos={related} />
      </aside>
    </div>
  );
}
