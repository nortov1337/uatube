"use client";

import { PictureInPicture2, Settings2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/components/i18n/I18nProvider";
import { requestJson } from "@/lib/api-client";

interface VideoPlayerProps {
  id: string;
  poster: string | null;
  resumeSec?: number;
  nextHref?: string | null;
}

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];

export function VideoPlayer({ id, poster, resumeSec = 0, nextHref = null }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const router = useRouter();
  const { t } = useI18n();
  const [speed, setSpeed] = useState(1);

  useEffect(() => {
    const key = `viewed:${id}`;
    if (window.sessionStorage.getItem(key)) return;
    window.sessionStorage.setItem(key, "1");
    requestJson<{ views: number }>(`/api/videos/${id}/view`, { method: "POST" }).catch(() =>
      window.sessionStorage.removeItem(key),
    );
  }, [id]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      const video = videoRef.current;
      if (!video || video.paused || video.currentTime < 1) return;
      void requestJson(`/api/videos/${id}/history`, {
        method: "POST",
        body: JSON.stringify({ positionSec: Math.floor(video.currentTime) }),
      }).catch(() => null);
    }, 10_000);
    return () => window.clearInterval(timer);
  }, [id]);

  const onLoadedMetadata = () => {
    const video = videoRef.current;
    if (!video || resumeSec < 3) return;
    if (resumeSec < video.duration - 5) video.currentTime = resumeSec;
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    if (!video) return;
    switch (event.key) {
      case " ":
      case "k":
        event.preventDefault();
        void (video.paused ? video.play() : video.pause());
        break;
      case "ArrowLeft":
        video.currentTime = Math.max(0, video.currentTime - 5);
        break;
      case "ArrowRight":
        video.currentTime = Math.min(video.duration || 0, video.currentTime + 5);
        break;
      case "j":
        video.currentTime = Math.max(0, video.currentTime - 10);
        break;
      case "l":
        video.currentTime = Math.min(video.duration || 0, video.currentTime + 10);
        break;
      case "m":
        video.muted = !video.muted;
        break;
      case "f":
        void video.requestFullscreen?.();
        break;
      default:
        break;
    }
  };

  const applySpeed = (value: number) => {
    setSpeed(value);
    if (videoRef.current) videoRef.current.playbackRate = value;
  };

  return (
    <div
      tabIndex={0}
      onKeyDown={onKeyDown}
      className="overflow-hidden rounded-2xl bg-black shadow-lg outline-none focus-visible:ring-2 focus-visible:ring-red-500"
    >
      <video
        ref={videoRef}
        controls
        playsInline
        preload="metadata"
        poster={poster ?? undefined}
        src={`/api/media/${id}`}
        onLoadedMetadata={onLoadedMetadata}
        onEnded={() => {
          if (nextHref) router.push(nextHref);
        }}
        className="aspect-video w-full bg-black"
      />
      <div className="flex items-center gap-2 bg-black px-3 py-2 text-xs text-white/70">
        <Settings2 aria-hidden="true" className="h-3.5 w-3.5" />
        <label className="flex items-center gap-1">
          {t("watch.playbackSpeed")}
          <select
            value={speed}
            onChange={(event) => applySpeed(Number(event.target.value))}
            className="rounded bg-white/10 px-1 py-0.5 text-xs text-white outline-none transition-colors hover:bg-white/15"
          >
            {SPEEDS.map((value) => (
              <option key={value} value={value} className="bg-neutral-900 text-white">
                {value}×
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          onClick={() => void videoRef.current?.requestPictureInPicture?.().catch(() => null)}
          className="ml-auto inline-flex items-center gap-1 rounded px-1.5 py-0.5 transition-colors hover:bg-white/10"
        >
          <PictureInPicture2 aria-hidden="true" className="h-3.5 w-3.5" />
          PiP
        </button>
        <span className="hidden sm:inline">{t("watch.shortcuts")}</span>
      </div>
    </div>
  );
}
