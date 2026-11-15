"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { errorMessage, requestJson } from "@/lib/api-client";

interface OwnerActionsProps {
  videoId: string;
}

export function OwnerActions({ videoId }: OwnerActionsProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const remove = async () => {
    if (!window.confirm("Удалить видео навсегда?")) return;

    setPending(true);
    setError(null);
    try {
      await requestJson<null>(`/api/videos/${videoId}`, { method: "DELETE" });
      router.push("/");
      router.refresh();
    } catch (requestError) {
      setError(errorMessage(requestError));
      setPending(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={remove}
        disabled={pending}
        className="inline-flex h-10 items-center gap-2 rounded-full bg-neutral-100 px-4 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-60"
      >
        <Trash2 aria-hidden="true" className="h-4 w-4" />
        Удалить
      </button>
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
