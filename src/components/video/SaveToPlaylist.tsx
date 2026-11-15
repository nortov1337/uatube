"use client";

import { ListPlus, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { PlaylistDTO } from "@/application/dto/PlaylistDTO";
import { useI18n } from "@/components/i18n/I18nProvider";
import { errorMessage, requestJson } from "@/lib/api-client";

interface SaveToPlaylistProps {
  videoId: string;
  isGuest: boolean;
}

export function SaveToPlaylist({ videoId, isGuest }: SaveToPlaylistProps) {
  const router = useRouter();
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [playlists, setPlaylists] = useState<PlaylistDTO[] | null>(null);
  const [title, setTitle] = useState("");
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    if (playlists) return;
    try {
      const result = await requestJson<{ items: PlaylistDTO[] }>("/api/playlists");
      setPlaylists(result.items);
    } catch (requestError) {
      setError(errorMessage(requestError));
    }
  };

  const toggleOpen = () => {
    if (isGuest) {
      router.push(`/login?next=${encodeURIComponent(`/watch/${videoId}`)}`);
      return;
    }
    setOpen((value) => !value);
    void load();
  };

  const add = async (playlistId: string) => {
    setError(null);
    try {
      await requestJson(`/api/playlists/${playlistId}/items`, {
        method: "POST",
        body: JSON.stringify({ videoId }),
      });
      setOpen(false);
      router.refresh();
    } catch (requestError) {
      setError(errorMessage(requestError));
    }
  };

  const create = async () => {
    if (!title.trim()) return;
    try {
      const playlist = await requestJson<PlaylistDTO>("/api/playlists", {
        method: "POST",
        body: JSON.stringify({ title }),
      });
      await add(playlist.id);
      setTitle("");
    } catch (requestError) {
      setError(errorMessage(requestError));
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={toggleOpen}
        aria-expanded={open}
        className="inline-flex h-10 items-center gap-2 rounded-full bg-neutral-100 px-4 text-sm font-medium text-neutral-900 transition-all hover:bg-neutral-200 active:scale-95"
      >
        <ListPlus aria-hidden="true" className="h-4 w-4" />
        {t("video.save")}
      </button>

      {open ? (
        <>
          <button
            type="button"
            aria-label={t("nav.closeMenu")}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 cursor-default"
          />
          <div className="absolute right-0 z-50 mt-2 w-64 animate-pop rounded-xl border border-neutral-200 bg-surface p-2 shadow-lg">
            <div className="max-h-56 overflow-y-auto">
              {playlists === null ? (
                <p className="px-2 py-1.5 text-xs text-neutral-500">{t("video.loading")}</p>
              ) : playlists.length === 0 ? (
                <p className="px-2 py-1.5 text-xs text-neutral-500">{t("video.noPlaylists")}</p>
              ) : (
                playlists.map((playlist) => (
                  <button
                    key={playlist.id}
                    type="button"
                    onClick={() => void add(playlist.id)}
                    className="flex w-full items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-left text-sm transition-colors hover:bg-neutral-100"
                  >
                    <span className="truncate">{playlist.title}</span>
                    <span className="text-xs text-neutral-500">{playlist.itemsCount}</span>
                  </button>
                ))
              )}
            </div>
            <div className="mt-2 flex items-center gap-1 border-t border-neutral-200 pt-2">
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder={t("video.newPlaylist")}
                maxLength={80}
                className="h-9 min-w-0 flex-1 rounded-lg border border-neutral-300 bg-surface px-2 text-sm text-neutral-900 outline-none transition-colors placeholder:text-neutral-400 focus:border-red-500"
              />
              <button
                type="button"
                onClick={() => void create()}
                aria-label={t("video.createPlaylist")}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-strong text-on-strong transition-transform active:scale-95"
              >
                <Plus aria-hidden="true" className="h-4 w-4" />
              </button>
            </div>
            {error ? <p className="mt-1 px-1 text-xs text-red-600">{error}</p> : null}
          </div>
        </>
      ) : null}
    </div>
  );
}
