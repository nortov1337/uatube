import Link from "next/link";
import { History } from "lucide-react";
import type { HistoryItemDTO } from "@/application/dto/HistoryItemDTO";
import { Thumb } from "@/components/ui/Thumb";
import { timeAgo } from "@/lib/format";

interface ContinueWatchingProps {
  items: HistoryItemDTO[];
}

export function ContinueWatching({ items }: ContinueWatchingProps) {
  if (items.length === 0) return null;

  return (
    <section className="mb-8">
      <div className="mb-3 flex items-center gap-2">
        <History aria-hidden="true" className="h-4 w-4 text-neutral-500" />
        <h2 className="text-sm font-semibold text-neutral-900">Продолжить просмотр</h2>
      </div>
      <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
        {items.map((item) => {
          const total = item.video.durationSec || 1;
          const percent = Math.min(100, Math.round((item.positionSec / total) * 100));
          return (
            <Link
              key={item.video.id}
              href={`/watch/${item.video.id}`}
              className="group w-56 shrink-0"
            >
              <div className="relative">
                <Thumb
                  src={item.video.thumbUrl}
                  title={item.video.title}
                  durationSec={item.video.durationSec}
                />
                <div className="absolute inset-x-0 bottom-0 h-1 rounded-b-xl bg-black/40">
                  <div className="h-full rounded-bl-xl bg-red-600" style={{ width: `${percent}%` }} />
                </div>
              </div>
              <p className="mt-2 line-clamp-2 text-sm font-semibold text-neutral-900 group-hover:text-red-600">
                {item.video.title}
              </p>
              <p className="mt-0.5 truncate text-xs text-neutral-600">
                {item.video.author.name} · {timeAgo(item.watchedAt)}
              </p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
