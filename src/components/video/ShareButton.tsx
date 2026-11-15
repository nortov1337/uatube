"use client";

import { Check, Download, Share2 } from "lucide-react";
import { useState } from "react";

interface ShareButtonProps {
  videoId: string;
  title: string;
}

export function ShareButton({ videoId, title }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const share = async () => {
    const url = `${window.location.origin}/watch/${videoId}`;
    if (navigator.share) {
      await navigator.share({ title, url }).catch(() => null);
      return;
    }
    await navigator.clipboard.writeText(url).catch(() => null);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={share}
        className="inline-flex h-10 items-center gap-2 rounded-full bg-neutral-100 px-4 text-sm font-medium text-neutral-900 hover:bg-neutral-200"
      >
        {copied ? (
          <Check aria-hidden="true" className="h-4 w-4" />
        ) : (
          <Share2 aria-hidden="true" className="h-4 w-4" />
        )}
        {copied ? "Ссылка скопирована" : "Поделиться"}
      </button>
      <a
        href={`/api/media/${videoId}`}
        download
        aria-label="Скачать видео"
        className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 text-neutral-900 hover:bg-neutral-200"
      >
        <Download aria-hidden="true" className="h-4 w-4" />
      </a>
    </div>
  );
}
