"use client";

import { ImageUp, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type ChangeEvent, type FormEvent } from "react";
import type { StudioVideoDTO } from "@/application/dto/StudioVideoDTO";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { VIDEO_CATEGORIES } from "@/domain/values/VideoCategory";
import { errorMessage, requestJson } from "@/lib/api-client";
import { toJpegBlob } from "@/lib/image";

interface EditVideoFormProps {
  video: StudioVideoDTO;
}

const SELECT_CLASS =
  "h-11 w-full rounded-xl border border-neutral-300 bg-white px-3 text-sm text-neutral-900 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100";

export function EditVideoForm({ video }: EditVideoFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState(video.title);
  const [description, setDescription] = useState(video.description);
  const [tags, setTags] = useState(video.tags.join(", "));
  const [category, setCategory] = useState(video.category);
  const [visibility, setVisibility] = useState(video.visibility);
  const [thumbUrl, setThumbUrl] = useState(video.thumbUrl);
  const [pending, setPending] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPending(true);
    setError(null);
    setNotice(null);
    try {
      await requestJson<StudioVideoDTO>(`/api/videos/${video.id}`, {
        method: "PATCH",
        body: JSON.stringify({ title, description, tags, category, visibility }),
      });
      setNotice("Сохранено");
      router.refresh();
    } catch (requestError) {
      setError(errorMessage(requestError));
    } finally {
      setPending(false);
    }
  };

  const uploadThumb = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setError(null);
    try {
      const blob = await toJpegBlob(file, 1280);
      const form = new FormData();
      form.append("thumb", blob, "thumb.jpg");
      const result = await requestJson<{ thumbUrl: string }>(`/api/videos/${video.id}/thumb`, {
        method: "POST",
        body: form,
      });
      setThumbUrl(result.thumbUrl);
      router.refresh();
    } catch (requestError) {
      setError(errorMessage(requestError));
    }
  };

  const remove = async () => {
    if (!window.confirm("Удалить видео вместе с файлом?")) return;
    setPending(true);
    try {
      await requestJson<null>(`/api/videos/${video.id}`, { method: "DELETE" });
      router.push("/studio");
      router.refresh();
    } catch (requestError) {
      setError(errorMessage(requestError));
      setPending(false);
    }
  };

  return (
    <form onSubmit={save} className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="aspect-video w-full max-w-xs overflow-hidden rounded-xl bg-neutral-100">
          {thumbUrl ? (
            <img src={thumbUrl} alt="Постер" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-neutral-500">
              Постер не задан
            </div>
          )}
        </div>
        <label className="inline-flex h-10 w-fit cursor-pointer items-center gap-2 rounded-full bg-neutral-100 px-4 text-sm font-medium hover:bg-neutral-200">
          <ImageUp aria-hidden="true" className="h-4 w-4" />
          Заменить постер
          <input type="file" accept="image/*" className="hidden" onChange={uploadThumb} />
        </label>
      </div>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-neutral-900">Название</span>
        <Input value={title} onChange={(event) => setTitle(event.target.value)} maxLength={120} />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-neutral-900">Описание</span>
        <Textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          rows={6}
          maxLength={5000}
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-neutral-900">Теги</span>
        <Input
          value={tags}
          onChange={(event) => setTags(event.target.value)}
          maxLength={400}
          placeholder="коты, музыка, обзор"
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-neutral-900">Категория</span>
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className={SELECT_CLASS}
          >
            <option value="">Без категории</option>
            {VIDEO_CATEGORIES.map((item) => (
              <option key={item.slug} value={item.slug}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-neutral-900">Доступ</span>
          <select
            value={visibility}
            onChange={(event) => setVisibility(event.target.value)}
            className={SELECT_CLASS}
          >
            <option value="public">Открытое</option>
            <option value="unlisted">По ссылке</option>
            <option value="private">Приватное</option>
          </select>
        </label>
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {notice ? <p className="text-sm text-emerald-600">{notice}</p> : null}

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={pending || title.trim().length === 0}>
          {pending ? "Сохраняем…" : "Сохранить"}
        </Button>
        <Button variant="ghost" onClick={remove} disabled={pending}>
          <Trash2 aria-hidden="true" className="h-4 w-4" />
          Удалить видео
        </Button>
      </div>
    </form>
  );
}
