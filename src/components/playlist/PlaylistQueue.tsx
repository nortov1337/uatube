import Link from "next/link";
import type { VideoCardDTO } from "@/application/dto/VideoCardDTO";
import { Thumb } from "@/components/ui/Thumb";
import { formatDuration } from "@/lib/format";

interface PlaylistQueueProps {
  playlistId: string;
  title: string;
  items: VideoCardDTO[];
  activeId: string;
}

export function PlaylistQueue({ playlistId, title, items, activeId }: PlaylistQueueProps) {
  return (
    <div className="rounded-2xl border border-neutral-200">
      <div className="border-b border-neutral-200 px-3 py-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Очередь</p>
        <p className="line-clamp-1 text-sm font-semibold text-neutral-900">{title}</p>
        <p className="text-xs text-neutral-500">{items.length} видео</p>
      </div>
      <div className="max-h-[420px] overflow-y-auto p-1">
        {items.map((video, index) => (
          <Link
            key={video.id}
            href={`/watch/${video.id}?list=${playlistId}`}
            className={`flex items-center gap-2 rounded-lg p-1.5 ${
              video.id === activeId ? "bg-neutral-100" : "hover:bg-neutral-50"
            }`}
          >
            <span className="w-4 shrink-0 text-center text-[11px] text-neutral-500">
              {video.id === activeId ? "▶" : index + 1}
            </span>
            <div className="w-20 shrink-0">
              <Thumb src={video.thumbUrl} title={video.title} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="line-clamp-2 text-xs font-semibold text-neutral-900">{video.title}</p>
              <p className="truncate text-[11px] text-neutral-600">{video.author.name}</p>
              <p className="text-[11px] text-neutral-500">{formatDuration(video.durationSec)}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
