"use client";

import { useState } from "react";
import { useI18n } from "@/components/i18n/I18nProvider";
import { RichText } from "@/components/ui/RichText";
import { formatBytes } from "@/lib/format";

interface VideoDescriptionProps {
  description: string;
  sizeBytes: number;
}

const COLLAPSE_THRESHOLD = 180;

export function VideoDescription({ description, sizeBytes }: VideoDescriptionProps) {
  const [expanded, setExpanded] = useState(false);
  const { locale, t } = useI18n();
  const text = description.trim();
  const collapsible = text.length > COLLAPSE_THRESHOLD;

  return (
    <div className="rounded-xl bg-neutral-100 px-3 py-2.5 text-sm">
      <p className="font-medium text-neutral-900">
        {formatBytes(sizeBytes, locale)} · {t("watch.sourceFile")}
      </p>
      {text ? (
        <div className={`mt-2 text-neutral-800 ${collapsible && !expanded ? "line-clamp-3" : ""}`}>
          <RichText text={text} />
        </div>
      ) : (
        <p className="mt-2 text-neutral-500">{t("watch.noDescription")}</p>
      )}
      {collapsible ? (
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="mt-1 text-sm font-semibold text-neutral-900 hover:underline"
        >
          {expanded ? t("watch.collapse") : t("watch.more")}
        </button>
      ) : null}
    </div>
  );
}
