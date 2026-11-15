"use client";

import { useState } from "react";
import type { CommentDTO } from "@/application/dto/CommentDTO";
import type { Page } from "@/application/dto/Page";
import { errorMessage, requestJson } from "@/lib/api-client";

export type CommentSortValue = "new" | "top";

interface RepliesPage {
  items: CommentDTO[];
  nextCursor: string | null;
}

interface UseCommentsParams {
  videoId: string;
  initial: Page<CommentDTO>;
  initialSort: CommentSortValue;
}

interface LikeResult {
  liked: boolean;
  likes: number;
}

export function useComments({ videoId, initial, initialSort }: UseCommentsParams) {
  const [items, setItems] = useState<CommentDTO[]>(initial.items);
  const [nextCursor, setNextCursor] = useState<string | null>(initial.nextCursor);
  const [sort, setSort] = useState<CommentSortValue>(initialSort);
  const [replies, setReplies] = useState<Record<string, RepliesPage>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const replace = (commentId: string, patch: Partial<CommentDTO>) => {
    setItems((current) =>
      current.map((item) => (item.id === commentId ? { ...item, ...patch } : item)),
    );
    setReplies((current) => {
      const next: Record<string, RepliesPage> = {};
      for (const [parentId, page] of Object.entries(current)) {
        next[parentId] = {
          ...page,
          items: page.items.map((item) =>
            item.id === commentId ? { ...item, ...patch } : item,
          ),
        };
      }
      return next;
    });
  };

  const changeSort = async (value: CommentSortValue) => {
    if (value === sort || loading) return;
    setSort(value);
    setLoading(true);
    setError(null);
    try {
      const page = await requestJson<Page<CommentDTO>>(
        `/api/videos/${videoId}/comments?sort=${value}`,
      );
      setItems(page.items);
      setNextCursor(page.nextCursor);
      setReplies({});
    } catch (requestError) {
      setError(errorMessage(requestError));
    } finally {
      setLoading(false);
    }
  };

  const loadMore = async () => {
    if (!nextCursor || loading) return;
    setLoading(true);
    setError(null);
    try {
      const page = await requestJson<Page<CommentDTO>>(
        `/api/videos/${videoId}/comments?sort=${sort}&cursor=${encodeURIComponent(nextCursor)}`,
      );
      setItems((current) => [...current, ...page.items]);
      setNextCursor(page.nextCursor);
    } catch (requestError) {
      setError(errorMessage(requestError));
    } finally {
      setLoading(false);
    }
  };

  const loadReplies = async (commentId: string, cursor?: string) => {
    setError(null);
    try {
      const page = await requestJson<Page<CommentDTO>>(
        `/api/comments/${commentId}/replies${cursor ? `?cursor=${encodeURIComponent(cursor)}` : ""}`,
      );
      setReplies((current) => ({
        ...current,
        [commentId]: {
          items: [...(cursor ? (current[commentId]?.items ?? []) : []), ...page.items],
          nextCursor: page.nextCursor,
        },
      }));
    } catch (requestError) {
      setError(errorMessage(requestError));
    }
  };

  const add = async (body: string, parentId?: string | null) => {
    const comment = await requestJson<CommentDTO>(`/api/videos/${videoId}/comments`, {
      method: "POST",
      body: JSON.stringify({ body, parentId: parentId ?? null }),
    });
    if (parentId) {
      setReplies((current) => ({
        ...current,
        [parentId]: {
          items: [...(current[parentId]?.items ?? []), comment],
          nextCursor: current[parentId]?.nextCursor ?? null,
        },
      }));
      setItems((current) =>
        current.map((item) =>
          item.id === parentId ? { ...item, repliesCount: item.repliesCount + 1 } : item,
        ),
      );
    } else {
      setItems((current) => [comment, ...current]);
    }
    return comment;
  };

  const update = async (commentId: string, body: string) => {
    const comment = await requestJson<CommentDTO>(`/api/comments/${commentId}`, {
      method: "PATCH",
      body: JSON.stringify({ body }),
    });
    replace(commentId, { body: comment.body, updatedAt: comment.updatedAt });
  };

  const remove = async (commentId: string, parentId?: string | null) => {
    await requestJson<null>(`/api/comments/${commentId}`, { method: "DELETE" });
    if (parentId) {
      setReplies((current) => ({
        ...current,
        [parentId]: {
          items: (current[parentId]?.items ?? []).filter((item) => item.id !== commentId),
          nextCursor: current[parentId]?.nextCursor ?? null,
        },
      }));
      return;
    }
    setItems((current) => current.filter((item) => item.id !== commentId));
  };

  const toggleLike = async (commentId: string) => {
    const result = await requestJson<LikeResult>(`/api/comments/${commentId}/like`, {
      method: "POST",
    });
    replace(commentId, { likedByMe: result.liked, likesCount: result.likes });
  };

  return {
    items,
    replies,
    nextCursor,
    sort,
    loading,
    error,
    changeSort,
    loadMore,
    loadReplies,
    add,
    update,
    remove,
    toggleLike,
  };
}
