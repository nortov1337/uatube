import Link from "next/link";
import { redirect } from "next/navigation";
import { History } from "lucide-react";
import { HistoryActions } from "@/components/history/HistoryActions";
import { EmptyState } from "@/components/ui/EmptyState";
import { Thumb } from "@/components/ui/Thumb";
import { container } from "@/lib/container";
import { currentUserId } from "@/lib/http/currentUserId";
import { formatViews, timeAgo } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function HistoryPage() {
  const userId = await currentUserId();
  if (!userId) redirect("/login?next=/history");

  const page = await container.history.list(userId, { limit: 50 });

  return (
    <div className="mx-auto w-full max-w-4xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-neutral-900">История просмотров</h1>
        {page.items.length > 0 ? <HistoryActions clearAll /> : null}
      </div>

      {page.items.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            icon={<History className="h-10 w-10" />}
            title="История пуста"
            description="Здесь появятся видео, которые вы смотрели."
            action={
              <Link
                href="/"
                className="inline-flex h-10 items-center rounded-full bg-red-600 px-4 text-sm font-medium text-white hover:bg-red-700"
              >
                Смотреть видео
              </Link>
            }
          />
        </div>
      ) : (
        <div className="mt-5 flex flex-col gap-2">
          {page.items.map((item) => {
            const total = item.video.durationSec || 1;
            const percent = Math.min(100, Math.round((item.positionSec / total) * 100));
            return (
              <div
                key={item.video.id}
                className="flex items-center gap-3 rounded-xl p-2 hover:bg-neutral-50"
              >
                <div className="w-32 shrink-0 sm:w-40">
                  <Thumb
                    src={item.video.thumbUrl}
                    title={item.video.title}
                    durationSec={item.video.durationSec}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/watch/${item.video.id}`}
                    className="line-clamp-2 text-sm font-semibold text-neutral-900 hover:text-red-600"
                  >
                    {item.video.title}
                  </Link>
                  <p className="truncate text-xs text-neutral-600">{item.video.author.name}</p>
                  <p className="text-xs text-neutral-500">
                    {formatViews(item.video.views)} просмотров · {timeAgo(item.watchedAt)}
                  </p>
                  {percent > 0 ? (
                    <div className="mt-1 h-1 w-full max-w-xs rounded-full bg-neutral-200">
                      <div
                        className="h-full rounded-full bg-red-600"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  ) : null}
                </div>
                <HistoryActions videoId={item.video.id} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
