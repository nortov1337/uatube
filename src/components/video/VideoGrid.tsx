import Link from "next/link";
import { Video } from "lucide-react";
import type { VideoCardDTO } from "@/application/dto/VideoCardDTO";
import { VideoCard } from "@/components/video/VideoCard";
import { EmptyState } from "@/components/ui/EmptyState";

interface VideoGridProps {
  videos: VideoCardDTO[];
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: { href: string; label: string } | null;
}

export function VideoGrid({
  videos,
  emptyTitle = "Пока нет видео",
  emptyDescription = "Загрузите первое видео — оно сразу появится в ленте.",
  emptyAction = { href: "/upload", label: "Загрузить видео" },
}: VideoGridProps) {
  if (videos.length === 0) {
    return (
      <EmptyState
        icon={<Video className="h-10 w-10" />}
        title={emptyTitle}
        description={emptyDescription}
        action={
          emptyAction ? (
            <Link
              href={emptyAction.href}
              className="inline-flex h-10 items-center rounded-full bg-red-600 px-4 text-sm font-medium text-white hover:bg-red-700"
            >
              {emptyAction.label}
            </Link>
          ) : null
        }
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {videos.map((video) => (
        <VideoCard key={video.id} video={video} />
      ))}
    </div>
  );
}
