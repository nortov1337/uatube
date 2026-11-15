"use client";

import { useI18n } from "@/components/i18n/I18nProvider";
import { DropZone } from "@/components/upload/DropZone";
import { UploadPreview } from "@/components/upload/UploadPreview";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Spinner } from "@/components/ui/Spinner";
import { Textarea } from "@/components/ui/Textarea";
import { VIDEO_CATEGORIES, categoryLabel } from "@/domain/values/VideoCategory";
import { useUploadForm } from "@/hooks/useUploadForm";

const SELECT_CLASS =
  "h-11 w-full rounded-xl border border-neutral-300 bg-surface px-3 text-sm text-neutral-900 outline-none transition-colors focus:border-red-500 focus:ring-2 focus:ring-red-100";

export function UploadForm() {
  const { locale, t } = useI18n();
  const form = useUploadForm();

  return (
    <form onSubmit={form.submit} className="flex flex-col gap-4">
      {form.file ? (
        <UploadPreview file={form.file} metadata={form.metadata} />
      ) : (
        <DropZone onSelect={form.selectFile} disabled={form.pending} />
      )}

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-neutral-900">{t("studio.fieldTitle")}</span>
        <Input
          value={form.title}
          onChange={(event) => form.setTitle(event.target.value)}
          maxLength={120}
          placeholder={t("upload.titlePlaceholder")}
          required
          disabled={form.pending}
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-neutral-900">{t("studio.fieldDescription")}</span>
        <Textarea
          value={form.description}
          onChange={(event) => form.setDescription(event.target.value)}
          maxLength={5000}
          rows={5}
          placeholder={t("upload.descriptionPlaceholder")}
          disabled={form.pending}
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-neutral-900">{t("upload.tags")}</span>
        <Input
          value={form.tags}
          onChange={(event) => form.setTags(event.target.value)}
          maxLength={400}
          placeholder={t("upload.tagsPlaceholder")}
          disabled={form.pending}
        />
        <span className="text-xs text-neutral-500">{t("upload.tagsHint")}</span>
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-neutral-900">{t("studio.fieldCategory")}</span>
          <select
            value={form.category}
            onChange={(event) => form.setCategory(event.target.value)}
            disabled={form.pending}
            className={SELECT_CLASS}
          >
            <option value="">{t("studio.noCategory")}</option>
            {VIDEO_CATEGORIES.map((category) => (
              <option key={category.slug} value={category.slug}>
                {categoryLabel(category.slug, locale)}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-neutral-900">{t("studio.access")}</span>
          <select
            value={form.visibility}
            onChange={(event) => form.setVisibility(event.target.value)}
            disabled={form.pending}
            className={SELECT_CLASS}
          >
            <option value="public">{t("upload.public")}</option>
            <option value="unlisted">{t("upload.unlisted")}</option>
            <option value="private">{t("upload.private")}</option>
          </select>
        </label>
      </div>

      {form.pending ? (
        <div className="flex flex-col gap-2">
          <Spinner label={t("upload.uploadingVideo")} />
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
          {form.pending ? t("upload.uploading") : t("upload.publish")}
        </Button>
        {form.file ? (
          <Button variant="ghost" onClick={() => window.location.reload()} disabled={form.pending}>
            {t("upload.reset")}
          </Button>
        ) : null}
      </div>
    </form>
  );
}
