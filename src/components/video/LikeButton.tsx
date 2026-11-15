"use client";

import { ThumbsUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLike } from "@/hooks/useLike";

interface LikeButtonProps {
  videoId: string;
  initialLiked: boolean;
  initialLikes: number;
  isGuest: boolean;
}

export function LikeButton({ videoId, initialLiked, initialLikes, isGuest }: LikeButtonProps) {
  const router = useRouter();
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
      aria-label={liked ? "Убрать лайк" : "Поставить лайк"}
      disabled={pending}
      className={`inline-flex h-10 items-center gap-2 rounded-full px-4 text-sm font-medium transition-colors disabled:opacity-60 ${
        liked ? "bg-red-600 text-white" : "bg-neutral-100 text-neutral-900 hover:bg-neutral-200"
      }`}
    >
      <ThumbsUp aria-hidden="true" className={`h-4 w-4 ${liked ? "fill-current" : ""}`} />
      {likes}
    </button>
  );
}
