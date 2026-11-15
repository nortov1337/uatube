"use client";

import { DropZone } from "@/components/upload/DropZone";
import { UploadPreview } from "@/components/upload/UploadPreview";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Spinner } from "@/components/ui/Spinner";
import { Textarea } from "@/components/ui/Textarea";
import { useUploadForm } from "@/hooks/useUploadForm";

export function UploadForm() {
  const {
    file,
    title,
    description,
    metadata,
    progress,
    pending,
    error,
    selectFile,
    setTitle,
    setDescription,
    submit,
  } = useUploadForm();

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      {file ? (
        <UploadPreview file={file} metadata={metadata} />
      ) : (
        <DropZone onSelect={selectFile} disabled={pending} />
      )}

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-neutral-900">Название</span>
        <Input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          maxLength={120}
          placeholder="О чём это видео"
          required
          disabled={pending}
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-neutral-900">Описание</span>
        <Textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          maxLength={5000}
          rows={5}
          placeholder="Расскажите о видео (необязательно)"
          disabled={pending}
        />
      </label>

      {pending ? (
        <div className="flex flex-col gap-2">
          <Spinner label="Загружаем видео…" />
          <div className="flex items-center gap-3">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-neutral-200">
              <div
                className="h-full rounded-full bg-red-600 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="w-10 text-right text-xs text-neutral-600">{progress}%</span>
          </div>
        </div>
      ) : null}

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={!file || pending || title.trim().length === 0}>
          {pending ? "Загружаем…" : "Опубликовать"}
        </Button>
        {file ? (
          <Button
            variant="ghost"
            onClick={() => window.location.reload()}
            disabled={pending}
          >
            Сбросить
          </Button>
        ) : null}
      </div>
    </form>
  );
}
