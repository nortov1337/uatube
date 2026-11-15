"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { errorMessage } from "@/lib/api-client";

interface CommentFormProps {
  onSubmit: (body: string) => Promise<unknown>;
  placeholder?: string;
  submitLabel?: string;
  compact?: boolean;
  onCancel?: () => void;
}

export function CommentForm({
  onSubmit,
  placeholder = "Оставьте комментарий",
  submitLabel = "Отправить",
  compact = false,
  onCancel,
}: CommentFormProps) {
  const [body, setBody] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = body.trim();
    if (!value || pending) return;

    setPending(true);
    setError(null);
    try {
      await onSubmit(value);
      setBody("");
      onCancel?.();
    } catch (requestError) {
      setError(errorMessage(requestError));
    } finally {
      setPending(false);
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-2">
      <Textarea
        value={body}
        onChange={(event) => setBody(event.target.value)}
        placeholder={placeholder}
        rows={compact ? 2 : 3}
        maxLength={1000}
        disabled={pending}
      />
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
      <div className="flex items-center gap-2">
        <Button type="submit" size="sm" disabled={pending || body.trim().length === 0}>
          {pending ? "Отправляем…" : submitLabel}
        </Button>
        {onCancel ? (
          <Button variant="ghost" size="sm" onClick={onCancel} disabled={pending}>
            Отмена
          </Button>
        ) : null}
      </div>
    </form>
  );
}
