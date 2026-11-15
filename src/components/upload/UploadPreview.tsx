"use client";

import { useEffect, useState } from "react";
import type { VideoMetadata } from "@/hooks/useVideoMetadata";
import { formatBytes, formatDuration } from "@/lib/format";

interface UploadPreviewProps {
  file: File;
  metadata: VideoMetadata | null;
}

export function UploadPreview({ file, metadata }: UploadPreviewProps) {
  const [posterUrl, setPosterUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!metadata?.thumbBlob) {
      setPosterUrl(null);
      return;
    }
    const url = URL.createObjectURL(metadata.thumbBlob);
    setPosterUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [metadata]);

  return (
    <div className="flex gap-3 rounded-2xl border border-neutral-200 p-3">
      <div className="aspect-video w-40 shrink-0 overflow-hidden rounded-lg bg-neutral-100">
        {posterUrl ? (
          <img src={posterUrl} alt="Постер видео" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-neutral-500">
            {metadata ? "Нет кадра" : "Обработка…"}
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1 text-sm">
        <p className="truncate font-medium text-neutral-900">{file.name}</p>
        <p className="mt-1 text-neutral-600">{formatBytes(file.size)}</p>
        <p className="text-neutral-600">
          {metadata ? formatDuration(metadata.durationSec) : "Длительность определяется…"}
        </p>
      </div>
    </div>
  );
}
