"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { errorMessage } from "@/lib/api-client";

interface CommentFormProps {
  onSubmit: (body: string) => Promise<void>;
}

export function CommentForm({ onSubmit }: CommentFormProps) {
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
    } catch (submitError) {
      setError(errorMessage(submitError));
    } finally {
      setPending(false);
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-2">
      <Textarea
        value={body}
        onChange={(event) => setBody(event.target.value)}
        placeholder="Оставьте комментарий"
        rows={3}
        maxLength={1000}
        invalid={Boolean(error)}
      />
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-neutral-500">{body.length}/1000</span>
        <Button type="submit" size="sm" disabled={pending || body.trim().length === 0}>
          {pending ? "Отправляем…" : "Отправить"}
        </Button>
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </form>
  );
}
