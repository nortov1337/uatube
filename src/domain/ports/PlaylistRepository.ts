import type {
  PlaylistEntity,
  PlaylistItemEntity,
  PlaylistWithOwner,
} from "@/domain/entities/PlaylistEntity";

export interface NewPlaylistData {
  ownerId: string;
  title: string;
  description: string;
  visibility: string;
  kind: string;
}

export interface PlaylistRepository {
  create(data: NewPlaylistData): Promise<PlaylistEntity>;
  findById(id: string): Promise<PlaylistWithOwner | null>;
  findWatchLater(ownerId: string): Promise<PlaylistEntity | null>;
  listByOwner(ownerId: string): Promise<PlaylistWithOwner[]>;
  listByVideo(ownerId: string, videoId: string): Promise<PlaylistEntity[]>;
  update(
    id: string,
    data: Partial<Pick<PlaylistEntity, "title" | "description" | "visibility">>,
  ): Promise<PlaylistEntity>;
  remove(id: string): Promise<void>;
  listItems(playlistId: string): Promise<PlaylistItemEntity[]>;
  hasItem(playlistId: string, videoId: string): Promise<boolean>;
  addItem(playlistId: string, videoId: string): Promise<void>;
  removeItem(playlistId: string, videoId: string): Promise<void>;
  reorder(playlistId: string, videoIds: readonly string[]): Promise<void>;
}
