"use client";

import { UploadCloud } from "lucide-react";
import { useRef, useState } from "react";

interface DropZoneProps {
  onSelect: (file: File) => void;
  disabled?: boolean;
}

export function DropZone({ onSelect, disabled = false }: DropZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const pick = (files: FileList | null) => {
    const file = files?.[0];
    if (file) onSelect(file);
  };

  return (
    <div
      onDragOver={(event) => {
        event.preventDefault();
        if (!disabled) setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(event) => {
        event.preventDefault();
        setDragging(false);
        if (!disabled) pick(event.dataTransfer.files);
      }}
      className={`rounded-2xl border-2 border-dashed transition-colors ${
        dragging ? "border-red-500 bg-red-50" : "border-neutral-300 bg-neutral-50"
      }`}
    >
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={disabled}
        className="flex w-full flex-col items-center gap-2 px-6 py-10 text-center disabled:opacity-60"
      >
        <UploadCloud aria-hidden="true" className="h-8 w-8 text-neutral-400" />
        <span className="text-sm font-medium text-neutral-900">
          Перетащите видео сюда или выберите файл
        </span>
        <span className="text-xs text-neutral-500">MP4 или WebM, до 200 МБ</span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="video/mp4,video/webm"
        className="hidden"
        onChange={(event) => pick(event.target.files)}
      />
    </div>
  );
}
