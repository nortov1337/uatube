"use client";

import { ArrowDown, ArrowUp, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import type { VideoCardDTO } from "@/application/dto/VideoCardDTO";
import { Thumb } from "@/components/ui/Thumb";
import { errorMessage, requestJson } from "@/lib/api-client";
import { formatViews } from "@/lib/format";

interface PlaylistItemsProps {
  playlistId: string;
  items: VideoCardDTO[];
  isOwner: boolean;
}

export function PlaylistItems({ playlistId, items, isOwner }: PlaylistItemsProps) {
  const [order, setOrder] = useState(items.map((item) => item.id));
  const [error, setError] = useState<string | null>(null);
  const byId = new Map(items.map((item) => [item.id, item]));

  const persist = async (nextOrder: string[]) => {
    setOrder(nextOrder);
    try {
      await requestJson(`/api/playlists/${playlistId}/reorder`, {
        method: "POST",
        body: JSON.stringify({ videoIds: nextOrder }),
      });
    } catch (requestError) {
      setError(errorMessage(requestError));
    }
  };

  const move = (index: number, direction: -1 | 1) => {
    const next = [...order];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    void persist(next);
  };

  const remove = async (videoId: string) => {
    setError(null);
    try {
      await requestJson<null>(`/api/playlists/${playlistId}/items?videoId=${videoId}`, {
        method: "DELETE",
      });
      setOrder((current) => current.filter((id) => id !== videoId));
    } catch (requestError) {
      setError(errorMessage(requestError));
    }
  };

  if (order.length === 0) {
    return <p className="text-sm text-neutral-500">В плейлисте пока нет видео.</p>;
  }

  return (
    <div className="flex flex-col gap-1">
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {order.map((id, index) => {
        const video = byId.get(id);
        if (!video) return null;
        return (
          <div key={id} className="group flex items-center gap-3 rounded-xl p-2 hover:bg-neutral-50">
            <span className="w-5 shrink-0 text-center text-xs text-neutral-500">{index + 1}</span>
            <div className="w-28 shrink-0 sm:w-36">
              <Thumb src={video.thumbUrl} title={video.title} durationSec={video.durationSec} />
            </div>
            <div className="min-w-0 flex-1">
              <Link
                href={`/watch/${video.id}?list=${playlistId}`}
                className="line-clamp-2 text-sm font-semibold text-neutral-900 hover:text-red-600"
              >
                {video.title}
              </Link>
              <p className="truncate text-xs text-neutral-600">{video.author.name}</p>
              <p className="text-xs text-neutral-500">{formatViews(video.views)} просмотров</p>
            </div>
            {isOwner ? (
              <div className="flex shrink-0 items-center gap-0.5">
                <button
                  type="button"
                  onClick={() => move(index, -1)}
                  aria-label="Выше"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full text-neutral-600 hover:bg-neutral-200"
                >
                  <ArrowUp aria-hidden="true" className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => move(index, 1)}
                  aria-label="Ниже"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full text-neutral-600 hover:bg-neutral-200"
                >
                  <ArrowDown aria-hidden="true" className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => void remove(id)}
                  aria-label="Убрать из плейлиста"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full text-red-600 hover:bg-red-50"
                >
                  <Trash2 aria-hidden="true" className="h-4 w-4" />
                </button>
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
