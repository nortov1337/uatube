import type { VideoDetailsDTO } from "@/application/dto/VideoDetailsDTO";
import { formatViews, timeAgo } from "@/lib/format";

interface VideoMetaProps {
  video: VideoDetailsDTO;
}

export function VideoMeta({ video }: VideoMetaProps) {
  return (
    <div className="min-w-0">
      <h1 className="text-lg font-semibold leading-snug text-neutral-900 sm:text-xl">
        {video.title}
      </h1>
      <p className="mt-1 text-sm text-neutral-600">
        {formatViews(video.views)} просмотров · {timeAgo(video.createdAt)}
      </p>
    </div>
  );
}
