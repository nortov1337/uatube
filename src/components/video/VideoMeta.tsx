import type { VideoDetailsDTO } from "@/application/dto/VideoDetailsDTO";
import { Chip } from "@/components/ui/Chip";
import { categoryLabel } from "@/domain/values/VideoCategory";
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
        {video.category ? ` · ${categoryLabel(video.category)}` : ""}
        {video.visibility !== "public"
          ? ` · ${video.visibility === "private" ? "приватное" : "по ссылке"}`
          : ""}
      </p>
      {video.tags.length > 0 ? (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {video.tags.map((tag) => (
            <Chip key={tag} href={`/?tag=${encodeURIComponent(tag)}`}>
              #{tag}
            </Chip>
          ))}
        </div>
      ) : null}
    </div>
  );
}
