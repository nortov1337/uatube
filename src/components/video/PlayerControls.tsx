"use client";

import {
  Check,
  Maximize,
  Minimize,
  Pause,
  PictureInPicture2,
  Play,
  Settings,
  Volume1,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useI18n } from "@/components/i18n/I18nProvider";
import { formatDuration } from "@/lib/format";
import { PlayerProgress } from "./PlayerProgress";

const SPEEDS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

interface PlayerControlsProps {
  playing: boolean;
  current: number;
  duration: number;
  buffered: number;
  volume: number;
  muted: boolean;
  speed: number;
  fullscreen: boolean;
  visible: boolean;
  onTogglePlay: () => void;
  onSeek: (time: number) => void;
  onVolume: (value: number) => void;
  onToggleMute: () => void;
  onSpeed: (value: number) => void;
  onToggleFullscreen: () => void;
  onTogglePiP: () => void;
}

function ControlButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="inline-flex h-9 w-9 items-center justify-center rounded-full text-white/90 transition-colors hover:bg-white/15 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
    >
      {children}
    </button>
  );
}

export function PlayerControls({
  playing,
  current,
  duration,
  buffered,
  volume,
  muted,
  speed,
  fullscreen,
  visible,
  onTogglePlay,
  onSeek,
  onVolume,
  onToggleMute,
  onSpeed,
  onToggleFullscreen,
  onTogglePiP,
}: PlayerControlsProps) {
  const { t } = useI18n();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!settingsOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setSettingsOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [settingsOpen]);

  const VolumeIcon = muted || volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;

  return (
    <div
      className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent px-2 pb-1.5 pt-10 transition-opacity duration-200 ${
        visible ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      <div className="px-1">
        <PlayerProgress
          current={current}
          duration={duration}
          buffered={buffered}
          label={t("player.seek")}
          onSeek={onSeek}
        />
      </div>
      <div className="flex items-center gap-0.5 text-white">
        <ControlButton
          label={playing ? t("player.pause") : t("player.play")}
          onClick={onTogglePlay}
        >
          {playing ? (
            <Pause className="h-5 w-5 fill-current" />
          ) : (
            <Play className="h-5 w-5 fill-current" />
          )}
        </ControlButton>

        <div className="group/vol flex items-center">
          <ControlButton label={muted ? t("player.unmute") : t("player.mute")} onClick={onToggleMute}>
            <VolumeIcon className="h-5 w-5" />
          </ControlButton>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={muted ? 0 : volume}
            aria-label={t("player.volume")}
            onChange={(event) => onVolume(Number(event.target.value))}
            className="hidden h-1 w-16 cursor-pointer accent-white sm:block"
          />
        </div>

        <span className="ml-2 text-[13px] font-medium tabular-nums text-white/90">
          {formatDuration(current)} / {formatDuration(duration)}
        </span>

        <div className="ml-auto flex items-center gap-0.5">
          <div ref={menuRef} className="relative">
            <ControlButton
              label={t("player.settings")}
              onClick={() => setSettingsOpen((value) => !value)}
            >
              <Settings
                className={`h-5 w-5 transition-transform duration-200 ${
                  settingsOpen ? "rotate-45" : ""
                }`}
              />
            </ControlButton>
            {settingsOpen ? (
              <div className="absolute bottom-11 right-0 w-52 animate-pop overflow-hidden rounded-xl bg-black/95 py-1 text-sm text-white shadow-2xl">
                <p className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-white/50">
                  {t("player.speed")}
                </p>
                {SPEEDS.map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => {
                      onSpeed(value);
                      setSettingsOpen(false);
                    }}
                    className="flex w-full items-center gap-2 px-3 py-1.5 text-left transition-colors hover:bg-white/10"
                  >
                    <Check
                      className={`h-4 w-4 ${value === speed ? "opacity-100" : "opacity-0"}`}
                    />
                    {value === 1 ? t("player.normal") : `${value}×`}
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <ControlButton label={t("player.pip")} onClick={onTogglePiP}>
            <PictureInPicture2 className="h-5 w-5" />
          </ControlButton>

          <ControlButton
            label={fullscreen ? t("player.exitFullscreen") : t("player.fullscreen")}
            onClick={onToggleFullscreen}
          >
            {fullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
          </ControlButton>
        </div>
      </div>
    </div>
  );
}
