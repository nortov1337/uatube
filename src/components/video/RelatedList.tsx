import Link from "next/link";
import type { VideoCardDTO } from "@/application/dto/VideoCardDTO";
import { Thumb } from "@/components/ui/Thumb";
import { timeAgo } from "@/lib/format";
import { getI18n } from "@/lib/i18n/server";
import { countOf } from "@/lib/i18n/units";

interface RelatedListProps {
  videos: VideoCardDTO[];
}

export async function RelatedList({ videos }: RelatedListProps) {
  const { locale, t } = await getI18n();

  if (videos.length === 0) {
    return <p className="text-sm text-neutral-500">{t("watch.noRelated")}</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {videos.map((video) => (
        <Link
          key={video.id}
          href={`/watch/${video.id}`}
          className="group flex gap-2 rounded-xl transition-colors hover:bg-neutral-50"
        >
          <div className="w-40 shrink-0">
            <Thumb src={video.thumbUrl} title={video.title} durationSec={video.durationSec} />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-neutral-900 transition-colors group-hover:text-red-600">
              {video.title}
            </h3>
            <p className="mt-1 truncate text-xs text-neutral-600">{video.author.name}</p>
            <p className="text-xs text-neutral-600">
              {countOf("views", video.views, locale)} · {timeAgo(video.createdAt, locale)}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}
