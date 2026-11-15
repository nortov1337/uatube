import Link from "next/link";
import type { VideoCardDTO } from "@/application/dto/VideoCardDTO";
import { Avatar } from "@/components/ui/Avatar";
import { Thumb } from "@/components/ui/Thumb";
import { timeAgo } from "@/lib/format";
import { getI18n } from "@/lib/i18n/server";
import { countOf } from "@/lib/i18n/units";

interface VideoCardProps {
  video: VideoCardDTO;
}

export async function VideoCard({ video }: VideoCardProps) {
  const { locale } = await getI18n();

  return (
    <Link
      href={`/watch/${video.id}`}
      className="group flex flex-col gap-3 transition-transform duration-300 ease-out hover:-translate-y-0.5"
    >
      <Thumb src={video.thumbUrl} title={video.title} durationSec={video.durationSec} />
      <div className="flex gap-3">
        <Avatar
          handle={video.author.handle}
          name={video.author.name}
          src={video.author.avatarUrl}
          size="sm"
        />
        <div className="min-w-0 flex-1">
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-neutral-900 transition-colors group-hover:text-red-600">
            {video.title}
          </h3>
          <p className="mt-1 truncate text-xs text-neutral-600">{video.author.name}</p>
          <p className="text-xs text-neutral-600">
            {countOf("views", video.views, locale)} · {timeAgo(video.createdAt, locale)}
          </p>
        </div>
      </div>
    </Link>
  );
}
