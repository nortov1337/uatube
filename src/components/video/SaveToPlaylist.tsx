"use client";

import { ListPlus, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { PlaylistDTO } from "@/application/dto/PlaylistDTO";
import { errorMessage, requestJson } from "@/lib/api-client";

interface SaveToPlaylistProps {
  videoId: string;
  isGuest: boolean;
}

export function SaveToPlaylist({ videoId, isGuest }: SaveToPlaylistProps) {
  const router = useRouter();
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
        className="inline-flex h-10 items-center gap-2 rounded-full bg-neutral-100 px-4 text-sm font-medium text-neutral-900 hover:bg-neutral-200"
      >
        <ListPlus aria-hidden="true" className="h-4 w-4" />
        Сохранить
      </button>

      {open ? (
        <>
          <button
            type="button"
            aria-label="Закрыть"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 cursor-default"
          />
          <div className="absolute right-0 z-50 mt-2 w-64 rounded-xl border border-neutral-200 bg-white p-2 shadow-lg">
            <div className="max-h-56 overflow-y-auto">
              {playlists === null ? (
                <p className="px-2 py-1.5 text-xs text-neutral-500">Загружаем…</p>
              ) : playlists.length === 0 ? (
                <p className="px-2 py-1.5 text-xs text-neutral-500">Плейлистов пока нет</p>
              ) : (
                playlists.map((playlist) => (
                  <button
                    key={playlist.id}
                    type="button"
                    onClick={() => void add(playlist.id)}
                    className="flex w-full items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-left text-sm hover:bg-neutral-100"
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
                placeholder="Новый плейлист"
                maxLength={80}
                className="h-9 min-w-0 flex-1 rounded-lg border border-neutral-300 px-2 text-sm outline-none focus:border-red-500"
              />
              <button
                type="button"
                onClick={() => void create()}
                aria-label="Создать плейлист"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-900 text-white"
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
