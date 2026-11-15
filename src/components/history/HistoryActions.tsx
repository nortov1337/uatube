"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { errorMessage, requestJson } from "@/lib/api-client";

interface HistoryActionsProps {
  videoId?: string;
  clearAll?: boolean;
}

export function HistoryActions({ videoId, clearAll = false }: HistoryActionsProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async () => {
    if (clearAll && !window.confirm("Очистить всю историю просмотров?")) return;
    setPending(true);
    setError(null);
    try {
      if (clearAll) {
        await requestJson<null>("/api/history", { method: "DELETE" });
      } else {
        await requestJson<null>(`/api/history/${videoId}`, { method: "DELETE" });
      }
      router.refresh();
    } catch (requestError) {
      setError(errorMessage(requestError));
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={run}
        disabled={pending}
        className={
          clearAll
            ? "inline-flex h-9 items-center gap-2 rounded-full bg-neutral-100 px-3 text-sm font-medium text-neutral-900 hover:bg-neutral-200"
            : "inline-flex h-8 w-8 items-center justify-center rounded-full text-neutral-500 hover:bg-neutral-100"
        }
        aria-label={clearAll ? "Очистить историю" : "Удалить из истории"}
      >
        <Trash2 aria-hidden="true" className={clearAll ? "h-4 w-4" : "h-3.5 w-3.5"} />
        {clearAll ? "Очистить историю" : null}
      </button>
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
