"use client";

import { useState, type FormEvent } from "react";
import { useI18n } from "@/components/i18n/I18nProvider";
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
  placeholder,
  submitLabel,
  compact = false,
  onCancel,
}: CommentFormProps) {
  const { t } = useI18n();
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
        placeholder={placeholder ?? t("comments.leave")}
        rows={compact ? 2 : 3}
        maxLength={1000}
        disabled={pending}
      />
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
      <div className="flex items-center gap-2">
        <Button type="submit" size="sm" disabled={pending || body.trim().length === 0}>
          {pending ? t("comments.sending") : (submitLabel ?? t("comments.send"))}
        </Button>
        {onCancel ? (
          <Button variant="ghost" size="sm" onClick={onCancel} disabled={pending}>
            {t("comments.cancel")}
          </Button>
        ) : null}
      </div>
    </form>
  );
}
