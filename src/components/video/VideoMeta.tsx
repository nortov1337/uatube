import type { VideoDetailsDTO } from "@/application/dto/VideoDetailsDTO";
import { Chip } from "@/components/ui/Chip";
import { categoryLabel } from "@/domain/values/VideoCategory";
import { timeAgo } from "@/lib/format";
import { getI18n } from "@/lib/i18n/server";
import { countOf } from "@/lib/i18n/units";

interface VideoMetaProps {
  video: VideoDetailsDTO;
}

export async function VideoMeta({ video }: VideoMetaProps) {
  const { locale, t } = await getI18n();

  return (
    <div className="min-w-0">
      <h1 className="text-lg font-semibold leading-snug text-neutral-900 sm:text-xl">
        {video.title}
      </h1>
      <p className="mt-1 text-sm text-neutral-600">
        {countOf("views", video.views, locale)} · {timeAgo(video.createdAt, locale)}
        {video.category ? ` · ${categoryLabel(video.category, locale)}` : ""}
        {video.visibility !== "public"
          ? ` · ${video.visibility === "private" ? t("watch.private") : t("watch.unlisted")}`
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
