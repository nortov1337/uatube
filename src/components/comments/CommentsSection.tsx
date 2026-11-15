"use client";

import Link from "next/link";
import type { CommentDTO } from "@/application/dto/CommentDTO";
import type { Page } from "@/application/dto/Page";
import { CommentForm } from "@/components/comments/CommentForm";
import { CommentItem } from "@/components/comments/CommentItem";
import { CommentSkeleton } from "@/components/comments/CommentSkeleton";
import { useI18n } from "@/components/i18n/I18nProvider";
import { useComments, type CommentSortValue } from "@/hooks/useComments";
import { countOf } from "@/lib/i18n/units";

interface CommentsSectionProps {
  videoId: string;
  initial: Page<CommentDTO>;
  initialSort: CommentSortValue;
  totalCount: number;
  currentUserId: string | null;
  videoAuthorId: string;
}

export function CommentsSection({
  videoId,
  initial,
  initialSort,
  totalCount,
  currentUserId,
  videoAuthorId,
}: CommentsSectionProps) {
  const { locale, t } = useI18n();
  const comments = useComments({ videoId, initial, initialSort });
  const count = Math.max(totalCount, comments.items.length);

  const sorts: Array<{ value: CommentSortValue; label: string }> = [
    { value: "new", label: t("comments.newest") },
    { value: "top", label: t("comments.top") },
  ];

  return (
    <section className="mt-6">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-base font-semibold text-neutral-900">
          {countOf("comments", count, locale)}
        </h2>
        <div className="flex items-center gap-1 rounded-full bg-neutral-100 p-1">
          {sorts.map((sort) => (
            <button
              key={sort.value}
              type="button"
              onClick={() => void comments.changeSort(sort.value)}
              className={`h-7 rounded-full px-2.5 text-xs font-medium transition-all ${
                comments.sort === sort.value
                  ? "bg-surface text-neutral-900 shadow-sm"
                  : "text-neutral-600 hover:text-neutral-900"
              }`}
            >
              {sort.label}
            </button>
          ))}
        </div>
      </div>

      {currentUserId ? (
        <div className="mt-3">
          <CommentForm onSubmit={(body) => comments.add(body)} />
        </div>
      ) : (
        <p className="mt-3 rounded-xl bg-neutral-100 px-3 py-2.5 text-sm text-neutral-700">
          <Link
            href={`/login?next=${encodeURIComponent(`/watch/${videoId}`)}`}
            className="font-semibold text-red-600 hover:underline"
          >
            {t("comments.loginPrefix")}
          </Link>
          {t("comments.loginSuffix")}
        </p>
      )}

      {comments.error ? <p className="mt-2 text-sm text-red-600">{comments.error}</p> : null}

      <div className="mt-4 flex flex-col gap-5">
        {comments.items.map((comment) => {
          const loaded = comments.replies[comment.id];
          return (
            <div key={comment.id} className="flex flex-col gap-3">
              <CommentItem
                comment={comment}
                currentUserId={currentUserId}
                videoAuthorId={videoAuthorId}
                onDelete={comments.remove}
                onUpdate={comments.update}
                onToggleLike={comments.toggleLike}
                onReply={
                  currentUserId ? (body) => comments.add(body, comment.id) : undefined
                }
              />

              {loaded && loaded.items.length > 0 ? (
                <div className="ml-10 flex flex-col gap-4 border-l border-neutral-200 pl-3">
                  {loaded.items.map((reply) => (
                    <CommentItem
                      key={reply.id}
                      comment={reply}
                      currentUserId={currentUserId}
                      videoAuthorId={videoAuthorId}
                      onDelete={comments.remove}
                      onUpdate={comments.update}
                      onToggleLike={comments.toggleLike}
                    />
                  ))}
                  {loaded.nextCursor ? (
                    <button
                      type="button"
                      onClick={() =>
                        void comments.loadReplies(comment.id, loaded.nextCursor ?? undefined)
                      }
                      className="w-fit text-xs font-semibold text-red-600 hover:underline"
                    >
                      {t("comments.showMoreReplies")}
                    </button>
                  ) : null}
                </div>
              ) : comment.repliesCount > 0 ? (
                <button
                  type="button"
                  onClick={() => void comments.loadReplies(comment.id)}
                  className="ml-10 w-fit text-xs font-semibold text-red-600 hover:underline"
                >
                  {t("comments.showReplies", { count: comment.repliesCount })}
                </button>
              ) : null}
            </div>
          );
        })}
        {comments.loading ? <CommentSkeleton /> : null}
      </div>

      {comments.items.length === 0 ? (
        <p className="mt-4 text-sm text-neutral-500">{t("comments.empty")}</p>
      ) : null}

      {comments.nextCursor ? (
        <button
          type="button"
          onClick={() => void comments.loadMore()}
          disabled={comments.loading}
          className="mt-4 inline-flex h-10 items-center rounded-full bg-neutral-100 px-4 text-sm font-medium text-neutral-900 transition-colors hover:bg-neutral-200 disabled:opacity-60"
        >
          {comments.loading ? t("comments.loadingMore") : t("comments.more")}
        </button>
      ) : null}
    </section>
  );
}
