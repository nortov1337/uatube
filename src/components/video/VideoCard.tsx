import Link from "next/link";
import type { VideoCardDTO } from "@/application/dto/VideoCardDTO";
import { Avatar } from "@/components/ui/Avatar";
import { Thumb } from "@/components/ui/Thumb";
import { formatViews, timeAgo } from "@/lib/format";

interface VideoCardProps {
  video: VideoCardDTO;
}

export function VideoCard({ video }: VideoCardProps) {
  return (
    <Link href={`/watch/${video.id}`} className="group flex flex-col gap-3">
      <Thumb src={video.thumbUrl} title={video.title} durationSec={video.durationSec} />
      <div className="flex gap-3">
        <Avatar
          handle={video.author.handle}
          name={video.author.name}
          src={video.author.avatarUrl}
          size="sm"
        />
        <div className="min-w-0 flex-1">
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-neutral-900 group-hover:text-red-600">
            {video.title}
          </h3>
          <p className="mt-1 truncate text-xs text-neutral-600">{video.author.name}</p>
          <p className="text-xs text-neutral-600">
            {formatViews(video.views)} просмотров · {timeAgo(video.createdAt)}
          </p>
        </div>
      </div>
    </Link>
  );
}
