"use client";

import { useState } from "react";
import type { CommentDTO } from "@/application/dto/CommentDTO";
import type { Page } from "@/application/dto/Page";
import { errorMessage, requestJson } from "@/lib/api-client";

interface UseCommentsParams {
  videoId: string;
  initial: Page<CommentDTO>;
}

export function useComments({ videoId, initial }: UseCommentsParams) {
  const [items, setItems] = useState<CommentDTO[]>(initial.items);
  const [nextCursor, setNextCursor] = useState<string | null>(initial.nextCursor);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadMore = async () => {
    if (!nextCursor || loading) return;

    setLoading(true);
    setError(null);
    try {
      const page = await requestJson<Page<CommentDTO>>(
        `/api/videos/${videoId}/comments?cursor=${encodeURIComponent(nextCursor)}`,
      );
      setItems((current) => [...current, ...page.items]);
      setNextCursor(page.nextCursor);
    } catch (requestError) {
      setError(errorMessage(requestError));
    } finally {
      setLoading(false);
    }
  };

  const add = async (body: string) => {
    const comment = await requestJson<CommentDTO>(`/api/videos/${videoId}/comments`, {
      method: "POST",
      body: JSON.stringify({ body }),
    });
    setItems((current) => [comment, ...current]);
  };

  const remove = async (commentId: string) => {
    await requestJson<null>(`/api/comments/${commentId}`, { method: "DELETE" });
    setItems((current) => current.filter((item) => item.id !== commentId));
  };

  return { items, nextCursor, loading, error, loadMore, add, remove };
}
