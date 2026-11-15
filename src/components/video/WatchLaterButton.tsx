"use client";

import { Check, Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useI18n } from "@/components/i18n/I18nProvider";
import { errorMessage, requestJson } from "@/lib/api-client";

interface WatchLaterButtonProps {
  videoId: string;
  initialSaved: boolean;
  isGuest: boolean;
}

export function WatchLaterButton({ videoId, initialSaved, isGuest }: WatchLaterButtonProps) {
  const router = useRouter();
  const { t } = useI18n();
  const [saved, setSaved] = useState(initialSaved);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggle = async () => {
    if (isGuest) {
      router.push(`/login?next=${encodeURIComponent(`/watch/${videoId}`)}`);
      return;
    }
    setPending(true);
    setError(null);
    try {
      const result = await requestJson<{ saved: boolean }>("/api/watch-later", {
        method: "POST",
        body: JSON.stringify({ videoId }),
      });
      setSaved(result.saved);
    } catch (requestError) {
      setError(errorMessage(requestError));
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-1">
      <button
        type="button"
        onClick={toggle}
        disabled={pending}
        aria-pressed={saved}
        className={`inline-flex h-10 items-center gap-2 rounded-full px-4 text-sm font-medium transition-all active:scale-95 disabled:opacity-60 ${
          saved
            ? "bg-strong text-on-strong"
            : "bg-neutral-100 text-neutral-900 hover:bg-neutral-200"
        }`}
      >
        {saved ? (
          <Check aria-hidden="true" className="h-4 w-4" />
        ) : (
          <Clock aria-hidden="true" className="h-4 w-4" />
        )}
        {saved ? t("video.saved") : t("video.later")}
      </button>
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
