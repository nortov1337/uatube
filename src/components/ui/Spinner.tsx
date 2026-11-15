"use client";

import { Loader2 } from "lucide-react";
import { useI18n } from "@/components/i18n/I18nProvider";

interface SpinnerProps {
  label?: string;
}

export function Spinner({ label }: SpinnerProps) {
  const { t } = useI18n();

  return (
    <span className="inline-flex items-center gap-2 text-sm text-neutral-600">
      <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />
      {label ? <span>{label}</span> : <span className="sr-only">{t("common.loading")}</span>}
    </span>
  );
}
