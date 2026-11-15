"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useI18n } from "@/components/i18n/I18nProvider";
import { Button } from "@/components/ui/Button";
import { errorMessage, requestJson } from "@/lib/api-client";
import { formatViews } from "@/lib/format";

interface SubscribeButtonProps {
  handle: string;
  initialSubscribed: boolean;
  initialSubscribers: number;
  isGuest: boolean;
  isOwner: boolean;
}

export function SubscribeButton({
  handle,
  initialSubscribed,
  initialSubscribers,
  isGuest,
  isOwner,
}: SubscribeButtonProps) {
  const router = useRouter();
  const { locale, t } = useI18n();
  const [subscribed, setSubscribed] = useState(initialSubscribed);
  const [subscribers, setSubscribers] = useState(initialSubscribers);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (isOwner) return null;

  const toggle = async () => {
    if (isGuest) {
      router.push(`/login?next=${encodeURIComponent(`/channel/${handle}`)}`);
      return;
    }

    setPending(true);
    setError(null);
    try {
      const result = await requestJson<{ subscribed: boolean; subscribers: number }>(
        "/api/subscriptions",
        { method: "POST", body: JSON.stringify({ handle }) },
      );
      setSubscribed(result.subscribed);
      setSubscribers(result.subscribers);
      router.refresh();
    } catch (requestError) {
      setError(errorMessage(requestError));
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        variant={subscribed ? "ghost" : "primary"}
        onClick={toggle}
        disabled={pending}
        aria-pressed={subscribed}
      >
        {subscribed ? t("video.subscribed") : t("video.subscribe")}
        <span className="text-xs opacity-80">{formatViews(subscribers, locale)}</span>
      </Button>
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
