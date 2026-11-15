"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import type { SettingsDTO } from "@/application/dto/SettingsDTO";
import { useI18n } from "@/components/i18n/I18nProvider";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { errorMessage, requestJson } from "@/lib/api-client";

interface ProfileSettingsFormProps {
  settings: SettingsDTO;
}

export function ProfileSettingsForm({ settings }: ProfileSettingsFormProps) {
  const router = useRouter();
  const { t } = useI18n();
  const [name, setName] = useState(settings.name);
  const [handle, setHandle] = useState(settings.handle);
  const [bio, setBio] = useState(settings.bio);
  const [pending, setPending] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPending(true);
    setError(null);
    setNotice(null);
    try {
      await requestJson<SettingsDTO>("/api/settings/profile", {
        method: "PATCH",
        body: JSON.stringify({ name, handle, bio }),
      });
      setNotice(t("settings.profileUpdated"));
      router.refresh();
    } catch (requestError) {
      setError(errorMessage(requestError));
    } finally {
      setPending(false);
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-3">
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-neutral-900">{t("settings.channelName")}</span>
        <Input value={name} onChange={(event) => setName(event.target.value)} maxLength={60} />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-neutral-900">{t("settings.channelHandle")}</span>
        <Input
          value={handle}
          onChange={(event) => setHandle(event.target.value.toLowerCase())}
          maxLength={20}
        />
        <span className="text-xs text-neutral-500">/channel/{handle || "handle"}</span>
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-neutral-900">{t("settings.about")}</span>
        <Textarea
          value={bio}
          onChange={(event) => setBio(event.target.value)}
          rows={4}
          maxLength={500}
          placeholder={t("settings.aboutPlaceholder")}
        />
      </label>
      <div className="text-xs text-neutral-500">Email: {settings.email}</div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {notice ? <p className="text-sm text-emerald-600">{notice}</p> : null}
      <div>
        <Button type="submit" disabled={pending}>
          {pending ? t("settings.saving") : t("settings.saveProfile")}
        </Button>
      </div>
    </form>
  );
}
