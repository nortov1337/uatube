import Link from "next/link";
import { notFound } from "next/navigation";
import { Avatar } from "@/components/ui/Avatar";
import { VideoGrid } from "@/components/video/VideoGrid";
import type { ChannelDTO } from "@/application/dto/ChannelDTO";
import type { Page } from "@/application/dto/Page";
import type { VideoCardDTO } from "@/application/dto/VideoCardDTO";
import { NotFoundError } from "@/domain/errors/NotFoundError";
import { container } from "@/lib/container";
import { formatMonthYear, formatViews } from "@/lib/format";

export const dynamic = "force-dynamic";

interface ChannelPageProps {
  params: Promise<{ handle: string }>;
}

interface ChannelData {
  channel: ChannelDTO;
  videos: Page<VideoCardDTO>;
}

async function loadChannel(handle: string): Promise<ChannelData> {
  try {
    return await container.channels.getByHandle(handle);
  } catch (error) {
    if (error instanceof NotFoundError) notFound();
    throw error;
  }
}

export default async function ChannelPage({ params }: ChannelPageProps) {
  const { handle } = await params;
  const { channel, videos } = await loadChannel(handle);

  return (
    <div>
      <div className="flex flex-col gap-4 border-b border-neutral-200 pb-6 sm:flex-row sm:items-center">
        <Avatar handle={channel.handle} name={channel.name} size="lg" />
        <div className="min-w-0">
          <h1 className="truncate text-xl font-semibold text-neutral-900">{channel.name}</h1>
          <p className="text-sm text-neutral-600">@{channel.handle}</p>
          <p className="mt-1 text-sm text-neutral-600">
            {formatViews(channel.stats.videos)} видео · {formatViews(channel.stats.views)}{" "}
            просмотров · {formatViews(channel.stats.likes)} лайков · на сайте с{" "}
            {formatMonthYear(channel.createdAt)}
          </p>
        </div>
        <Link
          href="/upload"
          className="mt-2 inline-flex h-10 w-fit items-center rounded-full bg-red-600 px-4 text-sm font-medium text-white hover:bg-red-700 sm:ml-auto sm:mt-0"
        >
          Загрузить видео
        </Link>
      </div>

      <div className="mt-6">
        <VideoGrid
          videos={videos.items}
          emptyTitle="На канале пока нет видео"
          emptyDescription="Загрузите видео, чтобы оно появилось здесь."
        />
      </div>
    </div>
  );
}
