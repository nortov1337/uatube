"use client";

import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { errorMessage, requestJson } from "@/lib/api-client";

export function CreatePlaylistForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!title.trim() || pending) return;
    setPending(true);
    setError(null);
    try {
      await requestJson("/api/playlists", {
        method: "POST",
        body: JSON.stringify({ title }),
      });
      setTitle("");
      router.refresh();
    } catch (requestError) {
      setError(errorMessage(requestError));
    } finally {
      setPending(false);
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-wrap items-start gap-2">
      <input
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="Название нового плейлиста"
        maxLength={80}
        className="h-10 min-w-0 flex-1 rounded-xl border border-neutral-300 px-3 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
      />
      <button
        type="submit"
        disabled={pending || title.trim().length === 0}
        className="inline-flex h-10 items-center gap-2 rounded-full bg-red-600 px-4 text-sm font-medium text-white hover:bg-red-700 disabled:bg-red-300"
      >
        <Plus aria-hidden="true" className="h-4 w-4" />
        Создать
      </button>
      {error ? <p className="w-full text-sm text-red-600">{error}</p> : null}
    </form>
  );
}
