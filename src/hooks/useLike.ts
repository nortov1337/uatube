"use client";

import { useState } from "react";
import { errorMessage, requestJson } from "@/lib/api-client";

interface UseLikeParams {
  videoId: string;
  initialLiked: boolean;
  initialLikes: number;
}

interface LikeResult {
  liked: boolean;
  likes: number;
}

export function useLike({ videoId, initialLiked, initialLikes }: UseLikeParams) {
  const [liked, setLiked] = useState(initialLiked);
  const [likes, setLikes] = useState(initialLikes);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggle = async () => {
    if (pending) return;

    const previousLiked = liked;
    const previousLikes = likes;
    const nextLiked = !liked;

    setLiked(nextLiked);
    setLikes(previousLikes + (nextLiked ? 1 : -1));
    setPending(true);
    setError(null);

    try {
      const result = await requestJson<LikeResult>(`/api/videos/${videoId}/like`, {
        method: "POST",
      });
      setLiked(result.liked);
      setLikes(result.likes);
    } catch (requestError) {
      setLiked(previousLiked);
      setLikes(previousLikes);
      setError(errorMessage(requestError));
    } finally {
      setPending(false);
    }
  };

  return { liked, likes, pending, error, toggle };
}
