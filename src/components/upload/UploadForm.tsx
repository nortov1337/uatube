"use client";

import { DropZone } from "@/components/upload/DropZone";
import { UploadPreview } from "@/components/upload/UploadPreview";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Spinner } from "@/components/ui/Spinner";
import { Textarea } from "@/components/ui/Textarea";
import { VIDEO_CATEGORIES } from "@/domain/values/VideoCategory";
import { useUploadForm } from "@/hooks/useUploadForm";

const SELECT_CLASS =
  "h-11 w-full rounded-xl border border-neutral-300 bg-white px-3 text-sm text-neutral-900 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100";

export function UploadForm() {
  const form = useUploadForm();

  return (
    <form onSubmit={form.submit} className="flex flex-col gap-4">
      {form.file ? (
        <UploadPreview file={form.file} metadata={form.metadata} />
      ) : (
        <DropZone onSelect={form.selectFile} disabled={form.pending} />
      )}

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-neutral-900">Название</span>
        <Input
          value={form.title}
          onChange={(event) => form.setTitle(event.target.value)}
          maxLength={120}
          placeholder="О чём это видео"
          required
          disabled={form.pending}
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-neutral-900">Описание</span>
        <Textarea
          value={form.description}
          onChange={(event) => form.setDescription(event.target.value)}
          maxLength={5000}
          rows={5}
          placeholder="Расскажите о видео. #хештеги в описании станут тегами"
          disabled={form.pending}
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-neutral-900">Теги</span>
        <Input
          value={form.tags}
          onChange={(event) => form.setTags(event.target.value)}
          maxLength={400}
          placeholder="коты, музыка, обзор"
          disabled={form.pending}
        />
        <span className="text-xs text-neutral-500">
          До 10 тегов через запятую. Улучшают подбор видео в рекомендациях.
        </span>
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-neutral-900">Категория</span>
          <select
            value={form.category}
            onChange={(event) => form.setCategory(event.target.value)}
            disabled={form.pending}
            className={SELECT_CLASS}
          >
            <option value="">Без категории</option>
            {VIDEO_CATEGORIES.map((category) => (
              <option key={category.slug} value={category.slug}>
                {category.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-neutral-900">Доступ</span>
          <select
            value={form.visibility}
            onChange={(event) => form.setVisibility(event.target.value)}
            disabled={form.pending}
            className={SELECT_CLASS}
          >
            <option value="public">Открытое — видно всем</option>
            <option value="unlisted">По ссылке — не в ленте</option>
            <option value="private">Приватное — только мне</option>
          </select>
        </label>
      </div>

      {form.pending ? (
        <div className="flex flex-col gap-2">
          <Spinner label="Загружаем видео…" />
          <div className="flex items-center gap-3">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-neutral-200">
              <div
                className="h-full rounded-full bg-red-600 transition-all"
                style={{ width: `${form.progress}%` }}
              />
            </div>
            <span className="w-10 text-right text-xs text-neutral-600">{form.progress}%</span>
          </div>
        </div>
      ) : null}

      {form.error ? <p className="text-sm text-red-600">{form.error}</p> : null}

      <div className="flex items-center gap-3">
        <Button
          type="submit"
          disabled={!form.file || form.pending || form.title.trim().length === 0}
        >
          {form.pending ? "Загружаем…" : "Опубликовать"}
        </Button>
        {form.file ? (
          <Button variant="ghost" onClick={() => window.location.reload()} disabled={form.pending}>
            Сбросить
          </Button>
        ) : null}
      </div>
    </form>
  );
}
