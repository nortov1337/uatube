import type { UserEntity } from "@/domain/entities/UserEntity";
import type { VideoWithAuthor } from "@/domain/entities/VideoWithAuthor";

export interface PlaylistEntity {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly visibility: string;
  readonly kind: string;
  readonly ownerId: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface PlaylistWithOwner extends PlaylistEntity {
  readonly owner: UserEntity;
  readonly itemsCount: number;
  readonly coverVideoId: string | null;
}

export interface PlaylistItemEntity {
  readonly id: string;
  readonly playlistId: string;
  readonly videoId: string;
  readonly position: number;
  readonly addedAt: Date;
  readonly video: VideoWithAuthor;
}
