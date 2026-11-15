"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { requestJson } from "@/lib/api-client";

interface VideoPlayerProps {
  id: string;
  poster: string | null;
}

export function VideoPlayer({ id, poster }: VideoPlayerProps) {
  const router = useRouter();

  useEffect(() => {
    const key = `viewed:${id}`;
    if (window.sessionStorage.getItem(key)) return;
    window.sessionStorage.setItem(key, "1");

    requestJson<{ views: number }>(`/api/videos/${id}/view`, { method: "POST" })
      .then(() => router.refresh())
      .catch(() => window.sessionStorage.removeItem(key));
  }, [id, router]);

  return (
    <div className="overflow-hidden rounded-2xl bg-black">
      <video
        controls
        playsInline
        preload="metadata"
        poster={poster ?? undefined}
        src={`/api/media/${id}`}
        className="aspect-video w-full bg-black"
      />
    </div>
  );
}
