"use client";

import { useState, type FormEvent } from "react";
import { useI18n } from "@/components/i18n/I18nProvider";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { errorMessage, requestJson } from "@/lib/api-client";

export function PasswordSettingsForm() {
  const { t } = useI18n();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPending(true);
    setError(null);
    setNotice(null);
    try {
      await requestJson<null>("/api/settings/password", {
        method: "POST",
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      setCurrentPassword("");
      setNewPassword("");
      setNotice(t("settings.passwordChanged"));
    } catch (requestError) {
      setError(errorMessage(requestError));
    } finally {
      setPending(false);
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-3">
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-neutral-900">{t("settings.currentPassword")}</span>
        <Input
          type="password"
          value={currentPassword}
          onChange={(event) => setCurrentPassword(event.target.value)}
          autoComplete="current-password"
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-neutral-900">{t("settings.newPassword")}</span>
        <Input
          type="password"
          value={newPassword}
          onChange={(event) => setNewPassword(event.target.value)}
          autoComplete="new-password"
          minLength={8}
        />
      </label>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {notice ? <p className="text-sm text-emerald-600">{notice}</p> : null}
      <div>
        <Button type="submit" disabled={pending || !currentPassword || newPassword.length < 8}>
          {pending ? t("settings.changing") : t("settings.changePassword")}
        </Button>
      </div>
    </form>
  );
}
