import Link from "next/link";
import { redirect } from "next/navigation";
import { Clapperboard, Upload } from "lucide-react";
import { StudioActions } from "@/components/studio/StudioActions";
import { Chip } from "@/components/ui/Chip";
import { EmptyState } from "@/components/ui/EmptyState";
import { container } from "@/lib/container";
import { currentUserId } from "@/lib/http/currentUserId";
import { formatDuration, timeAgo } from "@/lib/format";
import { getI18n } from "@/lib/i18n/server";
import { countOf } from "@/lib/i18n/units";

export const dynamic = "force-dynamic";

export default async function StudioPage() {
  const userId = await currentUserId();
  if (!userId) redirect("/login?next=/studio");

  const { locale, t } = await getI18n();
  const [videos, topTags] = await Promise.all([
    container.studio.list(userId),
    container.studio.topTags(userId),
  ]);

  const visibilityLabels: Record<string, string> = {
    public: t("studio.visibilityPublic"),
    unlisted: t("studio.visibilityUnlisted"),
    private: t("studio.visibilityPrivate"),
  };

  const totals = videos.reduce(
    (acc, video) => ({
      views: acc.views + video.views,
      likes: acc.likes + video.likes,
      comments: acc.comments + video.comments,
    }),
    { views: 0, likes: 0, comments: 0 },
  );

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">{t("studio.title")}</h1>
          <p className="mt-1 text-sm text-neutral-600">
            {countOf("videos", videos.length, locale)} · {countOf("views", totals.views, locale)} ·{" "}
            {countOf("likes", totals.likes, locale)} · {countOf("comments", totals.comments, locale)}
          </p>
        </div>
        <Link
          href="/upload"
          className="inline-flex h-10 items-center gap-2 rounded-full bg-red-600 px-4 text-sm font-medium text-white shadow-sm transition-all hover:bg-red-700 active:scale-95"
        >
          <Upload aria-hidden="true" className="h-4 w-4" />
          {t("studio.upload")}
        </Link>
      </div>

      {topTags.length > 0 ? (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
            {t("studio.yourTags")}
          </span>
          {topTags.map((tag) => (
            <Chip key={tag}>#{tag}</Chip>
          ))}
        </div>
      ) : null}

      {videos.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            icon={<Clapperboard className="h-10 w-10" />}
            title={t("studio.empty")}
            description={t("studio.emptyDesc")}
          />
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-2xl border border-neutral-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-neutral-50 text-xs uppercase tracking-wide text-neutral-500">
              <tr>
                <th className="px-3 py-2 font-medium">{t("studio.video")}</th>
                <th className="hidden px-3 py-2 font-medium sm:table-cell">{t("studio.access")}</th>
                <th className="hidden px-3 py-2 font-medium md:table-cell">{t("studio.views")}</th>
                <th className="hidden px-3 py-2 font-medium md:table-cell">{t("studio.likes")}</th>
                <th className="hidden px-3 py-2 font-medium md:table-cell">
                  {t("studio.comments")}
                </th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody>
              {videos.map((video) => (
                <tr
                  key={video.id}
                  className="border-t border-neutral-200 transition-colors hover:bg-neutral-50"
                >
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-20 shrink-0 overflow-hidden rounded-lg bg-neutral-100">
                        {video.thumbUrl ? (
                          <img src={video.thumbUrl} alt="" className="h-full w-full object-cover" />
                        ) : null}
                      </div>
                      <div className="min-w-0">
                        <Link
                          href={`/watch/${video.id}`}
                          className="line-clamp-2 font-medium text-neutral-900 transition-colors hover:text-red-600"
                        >
                          {video.title}
                        </Link>
                        <p className="text-xs text-neutral-500">
                          {formatDuration(video.durationSec)} · {timeAgo(video.createdAt, locale)}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="hidden px-3 py-2 text-neutral-700 sm:table-cell">
                    {visibilityLabels[video.visibility] ?? video.visibility}
                  </td>
                  <td className="hidden px-3 py-2 tabular-nums md:table-cell">{video.views}</td>
                  <td className="hidden px-3 py-2 tabular-nums md:table-cell">{video.likes}</td>
                  <td className="hidden px-3 py-2 tabular-nums md:table-cell">{video.comments}</td>
                  <td className="px-3 py-2">
                    <StudioActions videoId={video.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
