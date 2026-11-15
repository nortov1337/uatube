"use client";

import { useRouter } from "next/navigation";
import { useState, type ChangeEvent } from "react";
import { useI18n } from "@/components/i18n/I18nProvider";
import { Avatar } from "@/components/ui/Avatar";
import { errorMessage, requestJson } from "@/lib/api-client";
import { toJpegBlob } from "@/lib/image";

interface ImageSettingsProps {
  handle: string;
  name: string;
  avatarUrl: string | null;
  bannerUrl: string | null;
}

export function ImageSettings({ handle, name, avatarUrl, bannerUrl }: ImageSettingsProps) {
  const router = useRouter();
  const { t } = useI18n();
  const [avatar, setAvatar] = useState(avatarUrl);
  const [banner, setBanner] = useState(bannerUrl);
  const [error, setError] = useState<string | null>(null);

  const upload = async (kind: "avatar" | "banner", file: File) => {
    setError(null);
    try {
      const blob = await toJpegBlob(file, kind === "avatar" ? 512 : 1920);
      const form = new FormData();
      form.append("image", blob, "image.jpg");
      const result = await requestJson<{ url: string }>(`/api/settings/${kind}`, {
        method: "POST",
        body: form,
      });
      if (kind === "avatar") setAvatar(result.url);
      else setBanner(result.url);
      router.refresh();
    } catch (requestError) {
      setError(errorMessage(requestError));
    }
  };

  const remove = async (kind: "avatar" | "banner") => {
    setError(null);
    try {
      await requestJson<null>(`/api/settings/${kind}`, { method: "DELETE" });
      if (kind === "avatar") setAvatar(null);
      else setBanner(null);
      router.refresh();
    } catch (requestError) {
      setError(errorMessage(requestError));
    }
  };

  const onPick =
    (kind: "avatar" | "banner") => (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) void upload(kind, file);
    };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <Avatar handle={handle} name={name} src={avatar} size="lg" />
        <div className="flex flex-col gap-2">
          <label className="inline-flex h-9 w-fit cursor-pointer items-center rounded-full bg-neutral-100 px-3 text-sm font-medium transition-colors hover:bg-neutral-200">
            {t("settings.uploadAvatar")}
            <input type="file" accept="image/*" className="hidden" onChange={onPick("avatar")} />
          </label>
          {avatar ? (
            <button
              type="button"
              onClick={() => void remove("avatar")}
              className="text-xs text-red-600 hover:underline"
            >
              {t("settings.removeAvatar")}
            </button>
          ) : null}
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-neutral-200">
        <div className="aspect-[6/1] bg-neutral-100">
          {banner ? (
            <img
              src={banner}
              alt={t("settings.bannerAlt")}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-neutral-500">
              {t("settings.bannerEmpty")}
            </div>
          )}
        </div>
        <div className="flex items-center gap-3 p-2">
          <label className="inline-flex h-9 w-fit cursor-pointer items-center rounded-full bg-neutral-100 px-3 text-sm font-medium transition-colors hover:bg-neutral-200">
            {t("settings.uploadBanner")}
            <input type="file" accept="image/*" className="hidden" onChange={onPick("banner")} />
          </label>
          {banner ? (
            <button
              type="button"
              onClick={() => void remove("banner")}
              className="text-xs text-red-600 hover:underline"
            >
              {t("settings.removeBanner")}
            </button>
          ) : null}
        </div>
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
