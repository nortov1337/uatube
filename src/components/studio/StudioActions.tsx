"use client";

import { Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useI18n } from "@/components/i18n/I18nProvider";
import { errorMessage, requestJson } from "@/lib/api-client";

interface StudioActionsProps {
  videoId: string;
}

export function StudioActions({ videoId }: StudioActionsProps) {
  const router = useRouter();
  const { t } = useI18n();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const remove = async () => {
    if (!window.confirm(t("studio.deleteConfirm"))) return;
    setPending(true);
    setError(null);
    try {
      await requestJson<null>(`/api/videos/${videoId}`, { method: "DELETE" });
      router.refresh();
    } catch (requestError) {
      setError(errorMessage(requestError));
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex items-center gap-1">
        <Link
          href={`/studio/${videoId}`}
          aria-label={t("studio.editLabel")}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full text-neutral-700 transition-colors hover:bg-neutral-100"
        >
          <Pencil aria-hidden="true" className="h-4 w-4" />
        </Link>
        <button
          type="button"
          onClick={remove}
          disabled={pending}
          aria-label={t("video.delete")}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full text-red-600 transition-colors hover:bg-red-600/10 disabled:opacity-60"
        >
          <Trash2 aria-hidden="true" className="h-4 w-4" />
        </button>
      </div>
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
