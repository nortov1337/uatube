"use client";

import { useEffect, useMemo } from "react";
import { useI18n } from "@/components/i18n/I18nProvider";
import type { VideoMetadata } from "@/hooks/useVideoMetadata";
import { formatBytes, formatDuration } from "@/lib/format";

interface UploadPreviewProps {
  file: File;
  metadata: VideoMetadata | null;
}

export function UploadPreview({ file, metadata }: UploadPreviewProps) {
  const { locale, t } = useI18n();
  const posterUrl = useMemo(
    () => (metadata?.thumbBlob ? URL.createObjectURL(metadata.thumbBlob) : null),
    [metadata],
  );

  useEffect(() => {
    if (!posterUrl) return;
    return () => URL.revokeObjectURL(posterUrl);
  }, [posterUrl]);

  return (
    <div className="flex gap-3 rounded-2xl border border-neutral-200 p-3">
      <div className="aspect-video w-40 shrink-0 overflow-hidden rounded-lg bg-neutral-100">
        {posterUrl ? (
          <img
            src={posterUrl}
            alt={t("upload.posterAlt")}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-neutral-500">
            {metadata ? t("upload.noFrame") : t("upload.processing")}
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1 text-sm">
        <p className="truncate font-medium text-neutral-900">{file.name}</p>
        <p className="mt-1 text-neutral-600">{formatBytes(file.size, locale)}</p>
        <p className="text-neutral-600">
          {metadata ? formatDuration(metadata.durationSec) : t("upload.durationPending")}
        </p>
      </div>
    </div>
  );
}
