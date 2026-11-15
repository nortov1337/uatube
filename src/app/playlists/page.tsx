import { redirect } from "next/navigation";
import { ListVideo } from "lucide-react";
import { CreatePlaylistForm } from "@/components/playlist/CreatePlaylistForm";
import { PlaylistCard } from "@/components/playlist/PlaylistCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { container } from "@/lib/container";
import { currentUserId } from "@/lib/http/currentUserId";

export const dynamic = "force-dynamic";

export default async function PlaylistsPage() {
  const userId = await currentUserId();
  if (!userId) redirect("/login?next=/playlists");

  const playlists = await container.playlists.listMine(userId);
  const watchLater = playlists.filter((playlist) => playlist.kind === "watch_later");
  const custom = playlists.filter((playlist) => playlist.kind !== "watch_later");

  return (
    <div>
      <h1 className="text-xl font-semibold text-neutral-900">Плейлисты</h1>
      <p className="mt-1 text-sm text-neutral-600">
        Сохраняйте видео в списки и смотрите их подряд.
      </p>

      <div className="mt-5">
        <CreatePlaylistForm />
      </div>

      {watchLater.length > 0 ? (
        <section className="mt-8">
          <h2 className="mb-3 text-sm font-semibold text-neutral-900">Смотреть позже</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {watchLater.map((playlist) => (
              <PlaylistCard key={playlist.id} playlist={playlist} />
            ))}
          </div>
        </section>
      ) : null}

      <section className="mt-8">
        <h2 className="mb-3 text-sm font-semibold text-neutral-900">Мои плейлисты</h2>
        {custom.length === 0 ? (
          <EmptyState
            icon={<ListVideo className="h-10 w-10" />}
            title="Плейлистов пока нет"
            description="Создайте список и добавляйте в него видео со страницы просмотра."
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {custom.map((playlist) => (
              <PlaylistCard key={playlist.id} playlist={playlist} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
