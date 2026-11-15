"use client";

import { ArrowDown, ArrowUp, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import type { VideoCardDTO } from "@/application/dto/VideoCardDTO";
import { useI18n } from "@/components/i18n/I18nProvider";
import { Thumb } from "@/components/ui/Thumb";
import { errorMessage, requestJson } from "@/lib/api-client";
import { countOf } from "@/lib/i18n/units";

interface PlaylistItemsProps {
  playlistId: string;
  items: VideoCardDTO[];
  isOwner: boolean;
}

export function PlaylistItems({ playlistId, items, isOwner }: PlaylistItemsProps) {
  const { locale, t } = useI18n();
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
    return <p className="text-sm text-neutral-500">{t("playlist.empty")}</p>;
  }

  return (
    <div className="flex flex-col gap-1">
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {order.map((id, index) => {
        const video = byId.get(id);
        if (!video) return null;
        return (
          <div
            key={id}
            className="group flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-neutral-50"
          >
            <span className="w-5 shrink-0 text-center text-xs text-neutral-500">{index + 1}</span>
            <div className="w-28 shrink-0 sm:w-36">
              <Thumb src={video.thumbUrl} title={video.title} durationSec={video.durationSec} />
            </div>
            <div className="min-w-0 flex-1">
              <Link
                href={`/watch/${video.id}?list=${playlistId}`}
                className="line-clamp-2 text-sm font-semibold text-neutral-900 transition-colors hover:text-red-600"
              >
                {video.title}
              </Link>
              <p className="truncate text-xs text-neutral-600">{video.author.name}</p>
              <p className="text-xs text-neutral-500">{countOf("views", video.views, locale)}</p>
            </div>
            {isOwner ? (
              <div className="flex shrink-0 items-center gap-0.5">
                <button
                  type="button"
                  onClick={() => move(index, -1)}
                  aria-label={t("playlist.moveUp")}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full text-neutral-600 transition-colors hover:bg-neutral-200"
                >
                  <ArrowUp aria-hidden="true" className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => move(index, 1)}
                  aria-label={t("playlist.moveDown")}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full text-neutral-600 transition-colors hover:bg-neutral-200"
                >
                  <ArrowDown aria-hidden="true" className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => void remove(id)}
                  aria-label={t("playlist.remove")}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full text-red-600 transition-colors hover:bg-red-600/10"
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
