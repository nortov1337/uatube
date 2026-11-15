"use client";

import { useRef, useState } from "react";
import { formatDuration } from "@/lib/format";

interface PlayerProgressProps {
  current: number;
  duration: number;
  buffered: number;
  label: string;
  onSeek: (time: number) => void;
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export function PlayerProgress({ current, duration, buffered, label, onSeek }: PlayerProgressProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [dragging, setDragging] = useState(false);

  const percent = (value: number) =>
    duration > 0 ? (clamp(value, 0, duration) / duration) * 100 : 0;

  const timeAt = (clientX: number) => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0 || duration <= 0) return 0;
    return clamp(((clientX - rect.left) / rect.width) * duration, 0, duration);
  };

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    setDragging(true);
    setHoverTime(timeAt(event.clientX));
    onSeek(timeAt(event.clientX));
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    setHoverTime(timeAt(event.clientX));
    if (dragging) onSeek(timeAt(event.clientX));
  };

  const onPointerUp = () => setDragging(false);

  return (
    <div
      ref={trackRef}
      role="slider"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={Math.round(duration)}
      aria-valuenow={Math.round(current)}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onPointerLeave={() => {
        setHoverTime(null);
        setDragging(false);
      }}
      className="group/seek relative flex h-4 cursor-pointer touch-none items-center"
    >
      <div
        className={`relative w-full rounded-full bg-white/25 transition-all ${
          dragging ? "h-[5px]" : "h-[3px] group-hover/seek:h-[5px]"
        }`}
      >
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-white/40"
          style={{ width: `${percent(buffered)}%` }}
        />
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-[#ff0033]"
          style={{ width: `${percent(current)}%` }}
        />
        <span
          className={`absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#ff0033] transition-opacity ${
            dragging ? "opacity-100" : "opacity-0 group-hover/seek:opacity-100"
          }`}
          style={{ left: `${percent(current)}%` }}
        />
      </div>
      {hoverTime !== null && duration > 0 ? (
        <span
          className="pointer-events-none absolute bottom-full mb-1 -translate-x-1/2 rounded bg-black/90 px-1.5 py-0.5 text-[11px] font-medium tabular-nums text-white"
          style={{ left: `${percent(hoverTime)}%` }}
        >
          {formatDuration(hoverTime)}
        </span>
      ) : null}
    </div>
  );
}
