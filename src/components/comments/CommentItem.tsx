"use client";

import { Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import type { CommentDTO } from "@/application/dto/CommentDTO";
import { Avatar } from "@/components/ui/Avatar";
import { errorMessage } from "@/lib/api-client";
import { timeAgo } from "@/lib/format";

interface CommentItemProps {
  comment: CommentDTO;
  canDelete: boolean;
  onDelete: (commentId: string) => Promise<void>;
}

export function CommentItem({ comment, canDelete, onDelete }: CommentItemProps) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const remove = async () => {
    if (pending) return;
    setPending(true);
    setError(null);
    try {
      await onDelete(comment.id);
    } catch (deleteError) {
      setError(errorMessage(deleteError));
      setPending(false);
    }
  };

  return (
    <article className="flex gap-3">
      <Avatar handle={comment.author.handle} name={comment.author.name} size="sm" />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2">
          <Link
            href={`/channel/${comment.author.handle}`}
            className="truncate text-sm font-semibold text-neutral-900 hover:text-red-600"
          >
            {comment.author.name}
          </Link>
          <span className="text-xs text-neutral-500">{timeAgo(comment.createdAt)}</span>
          {canDelete ? (
            <button
              type="button"
              onClick={remove}
              disabled={pending}
              aria-label="Удалить комментарий"
              className="ml-auto inline-flex h-8 w-8 items-center justify-center rounded-full text-neutral-500 hover:bg-neutral-100 hover:text-red-600 disabled:opacity-60"
            >
              <Trash2 aria-hidden="true" className="h-4 w-4" />
            </button>
          ) : null}
        </div>
        <p className="mt-1 whitespace-pre-wrap break-words text-sm text-neutral-800">
          {comment.body}
        </p>
        {error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null}
      </div>
    </article>
  );
}
