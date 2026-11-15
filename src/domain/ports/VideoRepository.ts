import type { ChannelStats } from "@/domain/entities/ChannelStats";
import type { VideoEntity } from "@/domain/entities/VideoEntity";
import type { VideoWithAuthor } from "@/domain/entities/VideoWithAuthor";

export type NewVideoData = Omit<VideoEntity, "id" | "views" | "createdAt">;

export interface VideoRepository {
  create(data: NewVideoData): Promise<VideoEntity>;
  findById(id: string): Promise<VideoWithAuthor | null>;
  remove(id: string): Promise<void>;
  incrementViews(id: string): Promise<number>;
  listFeed(params: {
    q?: string;
    authorId?: string;
    excludeId?: string;
    cursor?: string;
    limit: number;
  }): Promise<{ items: VideoWithAuthor[]; nextCursor: string | null }>;
  listRelated(params: {
    video: VideoWithAuthor;
    limit: number;
  }): Promise<VideoWithAuthor[]>;
  statsByAuthor(authorId: string): Promise<ChannelStats>;
}
