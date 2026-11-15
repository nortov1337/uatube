import Link from "next/link";
import { notFound } from "next/navigation";
import { ListVideo, Play } from "lucide-react";
import type { PlaylistDetailsDTO } from "@/application/dto/PlaylistDTO";
import { PlaylistItems } from "@/components/playlist/PlaylistItems";
import { NotFoundError } from "@/domain/errors/NotFoundError";
import { container } from "@/lib/container";
import { currentUserId } from "@/lib/http/currentUserId";
import { getI18n } from "@/lib/i18n/server";
import { countOf } from "@/lib/i18n/units";

export const dynamic = "force-dynamic";

interface PlaylistPageProps {
  params: Promise<{ id: string }>;
}

async function loadPlaylist(id: string, viewerId: string | null): Promise<PlaylistDetailsDTO> {
  try {
    return await container.playlists.getDetails(id, viewerId);
  } catch (error) {
    if (error instanceof NotFoundError) notFound();
    throw error;
  }
}

export default async function PlaylistPage({ params }: PlaylistPageProps) {
  const { id } = await params;
  const viewerId = await currentUserId();
  const { locale, t } = await getI18n();
  const playlist = await loadPlaylist(id, viewerId);
  const first = playlist.items[0];

  return (
    <div className="mx-auto w-full max-w-4xl">
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="aspect-video w-full max-w-xs overflow-hidden rounded-2xl bg-neutral-100">
          {playlist.coverUrl ? (
            <img src={playlist.coverUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-neutral-400">
              <ListVideo aria-hidden="true" className="h-10 w-10" />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
            {playlist.kind === "watch_later" ? t("playlist.watchLater") : t("playlist.title")}
          </p>
          <h1 className="mt-1 text-xl font-semibold text-neutral-900">{playlist.title}</h1>
          <p className="mt-1 text-sm text-neutral-600">
            <Link href={`/channel/${playlist.owner.handle}`} className="hover:underline">
              {playlist.owner.name}
            </Link>{" "}
            · {countOf("videos", playlist.itemsCount, locale)} ·{" "}
            {playlist.visibility === "public" ? t("playlist.public") : t("playlist.hidden")}
          </p>
          {playlist.description ? (
            <p className="mt-2 whitespace-pre-wrap text-sm text-neutral-700">
              {playlist.description}
            </p>
          ) : null}
          {first ? (
            <Link
              href={`/watch/${first.id}?list=${playlist.id}`}
              className="mt-4 inline-flex h-10 items-center gap-2 rounded-full bg-red-600 px-4 text-sm font-medium text-white shadow-sm transition-all hover:bg-red-700 active:scale-95"
            >
              <Play aria-hidden="true" className="h-4 w-4 fill-current" />
              {t("playlist.playAll")}
            </Link>
          ) : null}
        </div>
      </div>

      <div className="mt-6">
        <PlaylistItems
          playlistId={playlist.id}
          items={playlist.items}
          isOwner={playlist.isOwner}
        />
      </div>
    </div>
  );
}
