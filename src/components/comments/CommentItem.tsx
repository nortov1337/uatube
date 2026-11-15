"use client";

import Link from "next/link";
import { Pencil, Reply, ThumbsUp, Trash2 } from "lucide-react";
import { useState } from "react";
import type { CommentDTO } from "@/application/dto/CommentDTO";
import { CommentForm } from "@/components/comments/CommentForm";
import { Avatar } from "@/components/ui/Avatar";
import { RichText } from "@/components/ui/RichText";
import { timeAgo } from "@/lib/format";

interface CommentItemProps {
  comment: CommentDTO;
  currentUserId: string | null;
  videoAuthorId: string;
  onDelete: (commentId: string, parentId?: string | null) => Promise<void>;
  onUpdate: (commentId: string, body: string) => Promise<void>;
  onToggleLike: (commentId: string) => Promise<void>;
  onReply?: (body: string) => Promise<unknown>;
}

export function CommentItem({
  comment,
  currentUserId,
  videoAuthorId,
  onDelete,
  onUpdate,
  onToggleLike,
  onReply,
}: CommentItemProps) {
  const [editing, setEditing] = useState(false);
  const [replying, setReplying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isOwner = currentUserId !== null && comment.author.id === currentUserId;
  const canDelete = isOwner || videoAuthorId === currentUserId;
  const edited = comment.updatedAt !== comment.createdAt;

  const remove = async () => {
    if (!window.confirm("Удалить комментарий?")) return;
    try {
      await onDelete(comment.id, comment.parentId);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Не удалось удалить");
    }
  };

  return (
    <article className="flex gap-3">
      <Avatar
        handle={comment.author.handle}
        name={comment.author.name}
        src={comment.author.avatarUrl}
        size="sm"
      />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
          <Link
            href={`/channel/${comment.author.handle}`}
            className="font-semibold text-neutral-900 hover:underline"
          >
            {comment.author.name}
          </Link>
          <span className="text-neutral-500">{timeAgo(comment.createdAt)}</span>
          {edited ? <span className="text-neutral-400">изменён</span> : null}
        </div>

        {editing ? (
          <div className="mt-2">
            <CommentForm
              compact
              submitLabel="Сохранить"
              placeholder="Текст комментария"
              onSubmit={async (body) => {
                await onUpdate(comment.id, body);
                setEditing(false);
              }}
              onCancel={() => setEditing(false)}
            />
          </div>
        ) : (
          <RichText text={comment.body} className="mt-1 text-sm text-neutral-800" />
        )}

        <div className="mt-1 flex flex-wrap items-center gap-1">
          <button
            type="button"
            onClick={() => void onToggleLike(comment.id)}
            aria-pressed={comment.likedByMe}
            className={`inline-flex h-8 items-center gap-1 rounded-full px-2 text-xs font-medium ${
              comment.likedByMe ? "text-red-600" : "text-neutral-600 hover:bg-neutral-100"
            }`}
          >
            <ThumbsUp aria-hidden="true" className={`h-3.5 w-3.5 ${comment.likedByMe ? "fill-current" : ""}`} />
            {comment.likesCount > 0 ? comment.likesCount : "Нравится"}
          </button>
          {onReply ? (
            <button
              type="button"
              onClick={() => setReplying((value) => !value)}
              className="inline-flex h-8 items-center gap-1 rounded-full px-2 text-xs font-medium text-neutral-600 hover:bg-neutral-100"
            >
              <Reply aria-hidden="true" className="h-3.5 w-3.5" />
              Ответить
            </button>
          ) : null}
          {isOwner ? (
            <button
              type="button"
              onClick={() => setEditing(true)}
              aria-label="Изменить комментарий"
              className="inline-flex h-8 w-8 items-center justify-center rounded-full text-neutral-600 hover:bg-neutral-100"
            >
              <Pencil aria-hidden="true" className="h-3.5 w-3.5" />
            </button>
          ) : null}
          {canDelete ? (
            <button
              type="button"
              onClick={remove}
              aria-label="Удалить комментарий"
              className="inline-flex h-8 w-8 items-center justify-center rounded-full text-neutral-600 hover:bg-neutral-100"
            >
              <Trash2 aria-hidden="true" className="h-3.5 w-3.5" />
            </button>
          ) : null}
        </div>

        {error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null}

        {replying && onReply ? (
          <div className="mt-2">
            <CommentForm
              compact
              placeholder={`Ответ ${comment.author.name}`}
              submitLabel="Ответить"
              onSubmit={onReply}
              onCancel={() => setReplying(false)}
            />
          </div>
        ) : null}
      </div>
    </article>
  );
}
