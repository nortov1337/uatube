import Link from "next/link";
import { ListVideo } from "lucide-react";
import type { PlaylistDTO } from "@/application/dto/PlaylistDTO";

interface PlaylistCardProps {
  playlist: PlaylistDTO;
}

export function PlaylistCard({ playlist }: PlaylistCardProps) {
  return (
    <Link
      href={`/playlist/${playlist.id}`}
      className="group flex flex-col gap-2 rounded-2xl border border-neutral-200 p-2 hover:border-neutral-300"
    >
      <div className="relative aspect-video overflow-hidden rounded-xl bg-neutral-100">
        {playlist.coverUrl ? (
          <img src={playlist.coverUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-neutral-400">
            <ListVideo aria-hidden="true" className="h-8 w-8" />
          </div>
        )}
        <span className="absolute bottom-1.5 right-1.5 rounded bg-black/80 px-1.5 py-0.5 text-[11px] font-medium text-white">
          {playlist.itemsCount}
        </span>
      </div>
      <div className="px-1 pb-1">
        <p className="line-clamp-1 text-sm font-semibold text-neutral-900 group-hover:text-red-600">
          {playlist.title}
        </p>
        <p className="text-xs text-neutral-500">
          {playlist.kind === "watch_later"
            ? "Приватный список"
            : playlist.visibility === "public"
              ? "Публичный"
              : "Скрытый"}
        </p>
      </div>
    </Link>
  );
}
