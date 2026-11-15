"use client";

import { ImageUp, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type ChangeEvent, type FormEvent } from "react";
import type { StudioVideoDTO } from "@/application/dto/StudioVideoDTO";
import { useI18n } from "@/components/i18n/I18nProvider";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { VIDEO_CATEGORIES, categoryLabel } from "@/domain/values/VideoCategory";
import { errorMessage, requestJson } from "@/lib/api-client";
import { toJpegBlob } from "@/lib/image";

interface EditVideoFormProps {
  video: StudioVideoDTO;
}

const SELECT_CLASS =
  "h-11 w-full rounded-xl border border-neutral-300 bg-surface px-3 text-sm text-neutral-900 outline-none transition-colors focus:border-red-500 focus:ring-2 focus:ring-red-100";

export function EditVideoForm({ video }: EditVideoFormProps) {
  const router = useRouter();
  const { locale, t } = useI18n();
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
      setNotice(t("studio.saved"));
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
    if (!window.confirm(t("studio.deleteConfirm"))) return;
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
            <img src={thumbUrl} alt={t("studio.poster")} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-neutral-500">
              {t("studio.posterEmpty")}
            </div>
          )}
        </div>
        <label className="inline-flex h-10 w-fit cursor-pointer items-center gap-2 rounded-full bg-neutral-100 px-4 text-sm font-medium transition-colors hover:bg-neutral-200">
          <ImageUp aria-hidden="true" className="h-4 w-4" />
          {t("studio.replacePoster")}
          <input type="file" accept="image/*" className="hidden" onChange={uploadThumb} />
        </label>
      </div>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-neutral-900">{t("studio.fieldTitle")}</span>
        <Input value={title} onChange={(event) => setTitle(event.target.value)} maxLength={120} />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-neutral-900">{t("studio.fieldDescription")}</span>
        <Textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          rows={6}
          maxLength={5000}
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-neutral-900">{t("studio.fieldTags")}</span>
        <Input
          value={tags}
          onChange={(event) => setTags(event.target.value)}
          maxLength={400}
          placeholder={t("upload.tagsPlaceholder")}
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-neutral-900">{t("studio.fieldCategory")}</span>
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className={SELECT_CLASS}
          >
            <option value="">{t("studio.noCategory")}</option>
            {VIDEO_CATEGORIES.map((item) => (
              <option key={item.slug} value={item.slug}>
                {categoryLabel(item.slug, locale)}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-neutral-900">{t("studio.access")}</span>
          <select
            value={visibility}
            onChange={(event) => setVisibility(event.target.value)}
            className={SELECT_CLASS}
          >
            <option value="public">{t("studio.visibilityPublic")}</option>
            <option value="unlisted">{t("studio.visibilityUnlisted")}</option>
            <option value="private">{t("studio.visibilityPrivate")}</option>
          </select>
        </label>
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {notice ? <p className="text-sm text-emerald-600">{notice}</p> : null}

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={pending || title.trim().length === 0}>
          {pending ? t("studio.saving") : t("studio.save")}
        </Button>
        <Button variant="ghost" onClick={remove} disabled={pending}>
          <Trash2 aria-hidden="true" className="h-4 w-4" />
          {t("studio.deleteVideo")}
        </Button>
      </div>
    </form>
  );
}
