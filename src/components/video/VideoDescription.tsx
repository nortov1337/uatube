"use client";

import { useState } from "react";
import { useI18n } from "@/components/i18n/I18nProvider";
import { RichText } from "@/components/ui/RichText";

interface VideoDescriptionProps {
  description: string;
}

const COLLAPSE_THRESHOLD = 180;

export function VideoDescription({ description }: VideoDescriptionProps) {
  const [expanded, setExpanded] = useState(false);
  const { t } = useI18n();
  const text = description.trim();
  const collapsible = text.length > COLLAPSE_THRESHOLD;

  return (
    <div className="rounded-xl bg-neutral-100 px-3 py-2.5 text-sm">
      {text ? (
        <div className={`text-neutral-800 ${collapsible && !expanded ? "line-clamp-3" : ""}`}>
          <RichText text={text} />
        </div>
      ) : (
        <p className="text-neutral-500">{t("watch.noDescription")}</p>
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
