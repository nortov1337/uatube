"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useI18n } from "@/components/i18n/I18nProvider";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { errorMessage, requestJson } from "@/lib/api-client";

export function DeleteAccount() {
  const router = useRouter();
  const { t } = useI18n();
  const [confirmation, setConfirmation] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const remove = async () => {
    if (confirmation !== t("settings.deleteKeyword")) return;
    setPending(true);
    setError(null);
    try {
      await requestJson<null>("/api/settings/account", { method: "DELETE" });
      router.push("/");
      router.refresh();
    } catch (requestError) {
      setError(errorMessage(requestError));
      setPending(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm text-neutral-700">
        {t("settings.deleteWarning")}{" "}
        <span className="font-semibold">{t("settings.deleteKeyword")}</span>.
      </p>
      <div className="flex flex-wrap gap-2">
        <Input
          value={confirmation}
          onChange={(event) => setConfirmation(event.target.value)}
          placeholder={t("settings.deleteKeyword")}
          className="max-w-48"
        />
        <Button
          variant="secondary"
          onClick={remove}
          disabled={pending || confirmation !== t("settings.deleteKeyword")}
          className="!border-red-300 !text-red-600 hover:!bg-red-600/10"
        >
          {pending ? t("settings.deleting") : t("settings.deleteButton")}
        </Button>
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
