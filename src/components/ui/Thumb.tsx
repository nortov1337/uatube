import { formatDuration } from "@/lib/format";

interface ThumbProps {
  src: string | null;
  title: string;
  durationSec?: number;
  className?: string;
}

export function Thumb({ src, title, durationSec, className = "" }: ThumbProps) {
  const initial = (title.trim().charAt(0) || "?").toUpperCase();

  return (
    <div
      className={`relative aspect-video w-full overflow-hidden rounded-xl bg-neutral-100 ${className}`}
    >
      {src ? (
        <img src={src} alt={title} loading="lazy" className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-neutral-200 via-neutral-300 to-neutral-400 text-4xl font-semibold text-white">
          {initial}
        </div>
      )}
      {durationSec ? (
        <span className="absolute bottom-1.5 right-1.5 rounded bg-black/80 px-1.5 py-0.5 text-[11px] font-medium tabular-nums text-white">
          {formatDuration(durationSec)}
        </span>
      ) : null}
    </div>
  );
}
