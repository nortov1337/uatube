"use client";

import Link from "next/link";
import type { CommentDTO } from "@/application/dto/CommentDTO";
import type { Page } from "@/application/dto/Page";
import { CommentForm } from "@/components/comments/CommentForm";
import { CommentItem } from "@/components/comments/CommentItem";
import { useComments } from "@/hooks/useComments";

interface CommentsSectionProps {
  videoId: string;
  initial: Page<CommentDTO>;
  currentUserId: string | null;
  videoAuthorId: string;
}

export function CommentsSection({
  videoId,
  initial,
  currentUserId,
  videoAuthorId,
}: CommentsSectionProps) {
  const { items, nextCursor, loading, error, loadMore, add, remove } = useComments({
    videoId,
    initial,
  });

  return (
    <section className="mt-6">
      <h2 className="text-base font-semibold text-neutral-900">{items.length} комментариев</h2>

      {currentUserId ? (
        <div className="mt-3">
          <CommentForm onSubmit={add} />
        </div>
      ) : (
        <p className="mt-3 rounded-xl bg-neutral-100 px-3 py-2.5 text-sm text-neutral-700">
          <Link
            href={`/login?next=${encodeURIComponent(`/watch/${videoId}`)}`}
            className="font-semibold text-red-600 hover:underline"
          >
            Войдите
          </Link>
          , чтобы оставить комментарий.
        </p>
      )}

      {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}

      <div className="mt-4 flex flex-col gap-4">
        {items.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            canDelete={
              currentUserId !== null &&
              (comment.author.id === currentUserId || videoAuthorId === currentUserId)
            }
            onDelete={remove}
          />
        ))}
      </div>

      {items.length === 0 ? (
        <p className="mt-4 text-sm text-neutral-500">Комментариев пока нет.</p>
      ) : null}

      {nextCursor ? (
        <button
          type="button"
          onClick={loadMore}
          disabled={loading}
          className="mt-4 inline-flex h-10 items-center rounded-full bg-neutral-100 px-4 text-sm font-medium text-neutral-900 hover:bg-neutral-200 disabled:opacity-60"
        >
          {loading ? "Загружаем…" : "Показать ещё"}
        </button>
      ) : null}
    </section>
  );
}
