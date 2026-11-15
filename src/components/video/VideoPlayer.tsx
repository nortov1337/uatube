"use client";

import { Play, RotateCcw, RotateCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useI18n } from "@/components/i18n/I18nProvider";
import { requestJson } from "@/lib/api-client";
import { PlayerControls } from "./PlayerControls";

interface VideoPlayerProps {
  id: string;
  poster: string | null;
  resumeSec?: number;
  nextHref?: string | null;
}

const SEEK_STEP = 5;
const JUMP_STEP = 10;
const VOLUME_STEP = 0.1;
const IDLE_DELAY = 2600;
const CLICK_DELAY = 220;
const FLASH_DURATION = 600;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export function VideoPlayer({ id, poster, resumeSec = 0, nextHref = null }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  const hideTimer = useRef<number | null>(null);
  const clickTimer = useRef<number | null>(null);
  const flashTimer = useRef<number | null>(null);
  const router = useRouter();
  const { t } = useI18n();

  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [fullscreen, setFullscreen] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [flash, setFlash] = useState<{ side: "back" | "forward"; key: number } | null>(null);

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

  useEffect(() => {
    const onFullscreenChange = () => setFullscreen(document.fullscreenElement === shellRef.current);
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  useEffect(
    () => () => {
      if (hideTimer.current) window.clearTimeout(hideTimer.current);
      if (clickTimer.current) window.clearTimeout(clickTimer.current);
      if (flashTimer.current) window.clearTimeout(flashTimer.current);
    },
    [],
  );

  const wake = useCallback(() => {
    setControlsVisible(true);
    if (hideTimer.current) window.clearTimeout(hideTimer.current);
    hideTimer.current = window.setTimeout(() => {
      if (!videoRef.current?.paused) setControlsVisible(false);
    }, IDLE_DELAY);
  }, []);

  const holdControls = () => {
    if (hideTimer.current) window.clearTimeout(hideTimer.current);
    setControlsVisible(true);
  };

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) void video.play().catch(() => null);
    else video.pause();
  };

  const seekTo = (time: number) => {
    const video = videoRef.current;
    if (!video || !Number.isFinite(time)) return;
    const target = clamp(time, 0, video.duration || 0);
    video.currentTime = target;
    setCurrent(target);
  };

  const showFlash = (side: "back" | "forward") => {
    setFlash({ side, key: Date.now() });
    if (flashTimer.current) window.clearTimeout(flashTimer.current);
    flashTimer.current = window.setTimeout(() => setFlash(null), FLASH_DURATION);
  };

  const skip = (offset: number) => {
    const video = videoRef.current;
    if (!video) return;
    seekTo(video.currentTime + offset);
    showFlash(offset < 0 ? "back" : "forward");
  };

  const changeVolume = (value: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = false;
    video.volume = clamp(value, 0, 1);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
  };

  const changeSpeed = (value: number) => {
    if (videoRef.current) videoRef.current.playbackRate = value;
    setSpeed(value);
  };

  const toggleFullscreen = () => {
    shellRef.current?.focus();
    if (document.fullscreenElement) void document.exitFullscreen();
    else void shellRef.current?.requestFullscreen().catch(() => null);
  };

  const togglePictureInPicture = () => {
    if (document.pictureInPictureElement) void document.exitPictureInPicture();
    else void videoRef.current?.requestPictureInPicture?.().catch(() => null);
  };

  const onVideoClick = () => {
    if (clickTimer.current) {
      window.clearTimeout(clickTimer.current);
      clickTimer.current = null;
      return;
    }
    clickTimer.current = window.setTimeout(() => {
      clickTimer.current = null;
      togglePlay();
    }, CLICK_DELAY);
  };

  const onVideoDoubleClick = () => {
    if (clickTimer.current) {
      window.clearTimeout(clickTimer.current);
      clickTimer.current = null;
    }
    toggleFullscreen();
  };

  const onLoadedMetadata = () => {
    const video = videoRef.current;
    if (!video) return;
    setDuration(video.duration || 0);
    if (resumeSec >= 3 && resumeSec < video.duration - 5) {
      video.currentTime = resumeSec;
      setCurrent(resumeSec);
    }
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    if (!video) return;
    if (/^[0-9]$/.test(event.key) && duration > 0) {
      event.preventDefault();
      seekTo((duration * Number(event.key)) / 10);
      return;
    }
    switch (event.key) {
      case " ":
      case "k":
        event.preventDefault();
        togglePlay();
        break;
      case "ArrowLeft":
        event.preventDefault();
        skip(-SEEK_STEP);
        break;
      case "ArrowRight":
        event.preventDefault();
        skip(SEEK_STEP);
        break;
      case "j":
        skip(-JUMP_STEP);
        break;
      case "l":
        skip(JUMP_STEP);
        break;
      case "ArrowUp":
        event.preventDefault();
        changeVolume(video.volume + VOLUME_STEP);
        break;
      case "ArrowDown":
        event.preventDefault();
        changeVolume(video.volume - VOLUME_STEP);
        break;
      case "m":
        toggleMute();
        break;
      case "f":
        toggleFullscreen();
        break;
      default:
        break;
    }
  };

  return (
    <div
      ref={shellRef}
      tabIndex={0}
      onKeyDown={onKeyDown}
      onPointerMove={wake}
      onPointerDown={(event) => {
        if (event.target instanceof HTMLVideoElement) shellRef.current?.focus();
      }}
      onPointerLeave={(event) => {
        if (event.pointerType === "mouse" && playing) setControlsVisible(false);
      }}
      className={`relative overflow-hidden bg-black outline-none focus-visible:ring-2 focus-visible:ring-red-500 ${
        fullscreen ? "h-screen w-screen" : "aspect-video w-full rounded-2xl"
      } ${controlsVisible ? "" : "cursor-none"}`}
    >
      <video
        ref={videoRef}
        playsInline
        preload="metadata"
        poster={poster ?? undefined}
        src={`/api/media/${id}`}
        onClick={onVideoClick}
        onDoubleClick={onVideoDoubleClick}
        onLoadedMetadata={onLoadedMetadata}
        onTimeUpdate={(event) => setCurrent(event.currentTarget.currentTime)}
        onDurationChange={(event) => setDuration(event.currentTarget.duration || 0)}
        onProgress={(event) => {
          const ranges = event.currentTarget.buffered;
          if (ranges.length > 0) setBuffered(ranges.end(ranges.length - 1));
        }}
        onPlay={() => {
          setPlaying(true);
          wake();
        }}
        onPause={() => {
          setPlaying(false);
          holdControls();
        }}
        onVolumeChange={(event) => {
          setVolume(event.currentTarget.volume);
          setMuted(event.currentTarget.muted);
        }}
        onEnded={() => {
          setPlaying(false);
          holdControls();
          if (nextHref) router.push(nextHref);
        }}
        className="h-full w-full bg-black object-contain"
      />

      {playing ? null : (
        <button
          type="button"
          aria-label={t("player.play")}
          onClick={togglePlay}
          className="absolute inset-0 m-auto flex h-16 w-16 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-sm transition-transform duration-200 hover:scale-105 hover:bg-[#ff0033]"
        >
          <Play className="ml-0.5 h-7 w-7 fill-current" />
        </button>
      )}

      {flash ? (
        <div
          key={flash.key}
          className="pointer-events-none absolute inset-0 animate-fade-in"
        >
          <span
            className={`absolute top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-3.5 text-white ${
              flash.side === "back" ? "left-[14%]" : "right-[14%]"
            }`}
          >
            {flash.side === "back" ? (
              <RotateCcw className="h-6 w-6" />
            ) : (
              <RotateCw className="h-6 w-6" />
            )}
          </span>
        </div>
      ) : null}

      <PlayerControls
        playing={playing}
        current={current}
        duration={duration}
        buffered={buffered}
        volume={volume}
        muted={muted}
        speed={speed}
        fullscreen={fullscreen}
        visible={controlsVisible}
        onTogglePlay={togglePlay}
        onSeek={seekTo}
        onVolume={changeVolume}
        onToggleMute={toggleMute}
        onSpeed={changeSpeed}
        onToggleFullscreen={toggleFullscreen}
        onTogglePiP={togglePictureInPicture}
      />
    </div>
  );
}
