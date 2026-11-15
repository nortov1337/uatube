"use client";

import { useState } from "react";
import { formatBytes } from "@/lib/format";

interface VideoDescriptionProps {
  description: string;
  sizeBytes: number;
}

const COLLAPSE_THRESHOLD = 180;

export function VideoDescription({ description, sizeBytes }: VideoDescriptionProps) {
  const [expanded, setExpanded] = useState(false);
  const text = description.trim();
  const collapsible = text.length > COLLAPSE_THRESHOLD;

  return (
    <div className="rounded-xl bg-neutral-100 px-3 py-2.5 text-sm">
      <p className="font-medium text-neutral-900">{formatBytes(sizeBytes)} · исходный файл</p>
      {text ? (
        <p
          className={`mt-2 whitespace-pre-wrap break-words text-neutral-800 ${
            collapsible && !expanded ? "line-clamp-3" : ""
          }`}
        >
          {text}
        </p>
      ) : (
        <p className="mt-2 text-neutral-500">Описание не добавлено.</p>
      )}
      {collapsible ? (
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="mt-1 text-sm font-semibold text-neutral-900 hover:underline"
        >
          {expanded ? "Свернуть" : "Ещё"}
        </button>
      ) : null}
    </div>
  );
}
