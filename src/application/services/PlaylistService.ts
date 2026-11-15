import type { PlaylistDTO, PlaylistDetailsDTO } from "@/application/dto/PlaylistDTO";
import { UserMapper } from "@/application/mappers/UserMapper";
import { VideoMapper } from "@/application/mappers/VideoMapper";
import { parseOrThrow } from "@/application/validation/parse";
import {
  playlistItemSchema,
  playlistReorderSchema,
  playlistSchema,
  playlistUpdateSchema,
} from "@/application/validation/schemas";
import type { PlaylistWithOwner } from "@/domain/entities/PlaylistEntity";
import { ForbiddenError } from "@/domain/errors/ForbiddenError";
import { NotFoundError } from "@/domain/errors/NotFoundError";
import type { PlaylistRepository } from "@/domain/ports/PlaylistRepository";
import type { VideoRepository } from "@/domain/ports/VideoRepository";
import { canViewVideo } from "@/domain/values/VideoVisibility";

const WATCH_LATER_TITLE = "Смотреть позже";

interface PlaylistServiceDeps {
  playlists: PlaylistRepository;
  videos: VideoRepository;
}

export class PlaylistService {
  constructor(private readonly deps: PlaylistServiceDeps) {}

  async listMine(ownerId: string): Promise<PlaylistDTO[]> {
    return this.listForOwner(ownerId, true);
  }

  async listForOwner(ownerId: string, includePrivate: boolean): Promise<PlaylistDTO[]> {
    const playlists = await this.deps.playlists.listByOwner(ownerId);
    return playlists
      .filter((playlist) => includePrivate || playlist.visibility === "public")
      .map(PlaylistService.toDTO);
  }

  async create(ownerId: string, input: unknown): Promise<PlaylistDTO> {
    const data = parseOrThrow(playlistSchema, input);
    const created = await this.deps.playlists.create({
      ownerId,
      title: data.title,
      description: data.description,
      visibility: data.visibility,
      kind: "custom",
    });
    const withOwner = await this.deps.playlists.findById(created.id);
    if (!withOwner) throw new NotFoundError("Плейлист не найден");
    return PlaylistService.toDTO(withOwner);
  }

  async update(playlistId: string, userId: string, input: unknown): Promise<PlaylistDTO> {
    const playlist = await this.requireOwner(playlistId, userId);
    if (playlist.kind === "watch_later") {
      throw new ForbiddenError("Системный плейлист нельзя изменить");
    }
    const data = parseOrThrow(playlistUpdateSchema, input);
    await this.deps.playlists.update(playlistId, data);
    const updated = await this.deps.playlists.findById(playlistId);
    if (!updated) throw new NotFoundError("Плейлист не найден");
    return PlaylistService.toDTO(updated);
  }

  async remove(playlistId: string, userId: string): Promise<void> {
    const playlist = await this.requireOwner(playlistId, userId);
    if (playlist.kind === "watch_later") return;
    await this.deps.playlists.remove(playlist.id);
  }

  async getDetails(playlistId: string, viewerId: string | null): Promise<PlaylistDetailsDTO> {
    const playlist = await this.deps.playlists.findById(playlistId);
    if (!playlist) throw new NotFoundError("Плейлист не найден");
    if (playlist.visibility === "private" && playlist.ownerId !== viewerId) {
      throw new NotFoundError("Плейлист не найден");
    }
    const items = (await this.deps.playlists.listItems(playlist.id)).filter((item) =>
      canViewVideo(item.video.visibility, item.video.authorId, viewerId),
    );
    const cards = items.map((item) => VideoMapper.toCard(item.video));
    return {
      ...PlaylistService.toDTO(playlist),
      coverUrl: cards[0]?.thumbUrl ?? null,
      items: cards,
      isOwner: playlist.ownerId === viewerId,
    };
  }

  async addItem(playlistId: string, userId: string, input: unknown): Promise<{ added: boolean }> {
    const playlist = await this.requireOwner(playlistId, userId);
    const { videoId } = parseOrThrow(playlistItemSchema, input);
    const video = await this.deps.videos.findById(videoId);
    if (!video || !canViewVideo(video.visibility, video.authorId, userId)) {
      throw new NotFoundError("Видео не найдено");
    }
    await this.deps.playlists.addItem(playlist.id, video.id);
    return { added: true };
  }

  async removeItem(playlistId: string, userId: string, videoId: string): Promise<void> {
    const playlist = await this.requireOwner(playlistId, userId);
    await this.deps.playlists.removeItem(playlist.id, videoId);
  }

  async reorder(playlistId: string, userId: string, input: unknown): Promise<void> {
    const playlist = await this.requireOwner(playlistId, userId);
    const { videoIds } = parseOrThrow(playlistReorderSchema, input);
    await this.deps.playlists.reorder(playlist.id, videoIds);
  }

  async toggleWatchLater(userId: string, input: unknown): Promise<{ saved: boolean }> {
    const { videoId } = parseOrThrow(playlistItemSchema, input);
    const video = await this.deps.videos.findById(videoId);
    if (!video || !canViewVideo(video.visibility, video.authorId, userId)) {
      throw new NotFoundError("Видео не найдено");
    }

    const playlist =
      (await this.deps.playlists.findWatchLater(userId)) ??
      (await this.deps.playlists.create({
        ownerId: userId,
        title: WATCH_LATER_TITLE,
        description: "",
        visibility: "private",
        kind: "watch_later",
      }));

    if (await this.deps.playlists.hasItem(playlist.id, video.id)) {
      await this.deps.playlists.removeItem(playlist.id, video.id);
      return { saved: false };
    }
    await this.deps.playlists.addItem(playlist.id, video.id);
    return { saved: true };
  }

  async watchLaterState(userId: string, videoId: string): Promise<boolean> {
    const playlist = await this.deps.playlists.findWatchLater(userId);
    if (!playlist) return false;
    return this.deps.playlists.hasItem(playlist.id, videoId);
  }

  private async requireOwner(playlistId: string, userId: string): Promise<PlaylistWithOwner> {
    const playlist = await this.deps.playlists.findById(playlistId);
    if (!playlist) throw new NotFoundError("Плейлист не найден");
    if (playlist.ownerId !== userId) throw new ForbiddenError("Это чужой плейлист");
    return playlist;
  }

  private static toDTO(playlist: PlaylistWithOwner): PlaylistDTO {
    return {
      id: playlist.id,
      title: playlist.title,
      description: playlist.description,
      visibility: playlist.visibility,
      kind: playlist.kind,
      itemsCount: playlist.itemsCount,
      coverUrl: playlist.coverVideoId ? `/api/thumb/${playlist.coverVideoId}` : null,
      owner: UserMapper.toPublic(playlist.owner),
      createdAt: playlist.createdAt.toISOString(),
      updatedAt: playlist.updatedAt.toISOString(),
    };
  }
}
