"use client";

import { useState } from "react";

export interface VideoMetadata {
  durationSec: number;
  thumbBlob: Blob | null;
}

const THUMB_WIDTH = 640;
const THUMB_HEIGHT = 360;

function readMetadata(file: File): Promise<VideoMetadata> {
  return new Promise<VideoMetadata>((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.preload = "metadata";
    video.muted = true;
    video.src = url;

    const fail = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Не удалось прочитать видео"));
    };

    video.onerror = fail;
    video.onloadedmetadata = () => {
      const duration = Number.isFinite(video.duration) ? video.duration : 0;
      video.currentTime = Math.min(1, duration / 2);
    };
    video.onseeked = () => {
      const canvas = document.createElement("canvas");
      canvas.width = THUMB_WIDTH;
      canvas.height = THUMB_HEIGHT;
      const context = canvas.getContext("2d");
      if (!context) {
        fail();
        return;
      }
      context.drawImage(video, 0, 0, THUMB_WIDTH, THUMB_HEIGHT);
      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(url);
          resolve({ durationSec: video.duration || 0, thumbBlob: blob });
        },
        "image/jpeg",
        0.8,
      );
    };
  });
}

export function useVideoMetadata() {
  const [metadata, setMetadata] = useState<VideoMetadata | null>(null);

  const load = async (file: File) => {
    setMetadata(await readMetadata(file));
  };

  const reset = () => setMetadata(null);

  return { metadata, load, reset };
}
