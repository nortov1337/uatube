"use client";

import { ThumbsUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/components/i18n/I18nProvider";
import { useLike } from "@/hooks/useLike";
import { formatViews } from "@/lib/format";

interface LikeButtonProps {
  videoId: string;
  initialLiked: boolean;
  initialLikes: number;
  isGuest: boolean;
}

export function LikeButton({ videoId, initialLiked, initialLikes, isGuest }: LikeButtonProps) {
  const router = useRouter();
  const { locale, t } = useI18n();
  const { liked, likes, pending, toggle } = useLike({ videoId, initialLiked, initialLikes });

  const onClick = () => {
    if (isGuest) {
      router.push(`/login?next=${encodeURIComponent(`/watch/${videoId}`)}`);
      return;
    }
    void toggle();
  };

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={liked}
      aria-label={liked ? t("video.unlike") : t("video.like")}
      title={liked ? t("video.unlike") : t("video.like")}
      disabled={pending}
      className={`inline-flex h-10 items-center gap-2 rounded-full px-4 text-sm font-medium transition-all active:scale-95 disabled:opacity-60 ${
        liked ? "bg-red-600 text-white" : "bg-neutral-100 text-neutral-900 hover:bg-neutral-200"
      }`}
    >
      <ThumbsUp aria-hidden="true" className={`h-4 w-4 ${liked ? "fill-current" : ""}`} />
      {formatViews(likes, locale)}
    </button>
  );
}
