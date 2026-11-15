import type { ChannelStats } from "@/domain/entities/ChannelStats";
import type { VideoAnalytics } from "@/domain/entities/VideoAnalytics";
import type { VideoEntity } from "@/domain/entities/VideoEntity";
import type { VideoWithAuthor } from "@/domain/entities/VideoWithAuthor";
import type { VideoSort, VideoVisibility } from "@/domain/values/VideoVisibility";

export type NewVideoData = Omit<VideoEntity, "views" | "createdAt" | "updatedAt">;

export type VideoUpdateData = Partial<
  Pick<VideoEntity, "title" | "description" | "tags" | "category" | "visibility" | "thumbName">
>;

export interface VideoFeedQuery {
  q?: string;
  tags?: readonly string[];
  category?: string;
  authorId?: string;
  excludeId?: string;
  sort?: VideoSort;
  visibility?: readonly VideoVisibility[];
  offset: number;
  limit: number;
}

export interface VideoRepository {
  create(data: NewVideoData): Promise<VideoWithAuthor>;
  findById(id: string): Promise<VideoWithAuthor | null>;
  findByIds(ids: readonly string[]): Promise<VideoWithAuthor[]>;
  update(id: string, data: VideoUpdateData): Promise<VideoWithAuthor>;
  remove(id: string): Promise<void>;
  recordView(id: string): Promise<number>;
  listFeed(query: VideoFeedQuery): Promise<{ items: VideoWithAuthor[]; hasMore: boolean }>;
  listByTags(
    tags: readonly string[],
    params: { excludeId?: string; limit: number },
  ): Promise<VideoWithAuthor[]>;
  listByAuthors(
    authorIds: readonly string[],
    params: { excludeId?: string; limit: number },
  ): Promise<VideoWithAuthor[]>;
  listRecent(params: { excludeId?: string; limit: number }): Promise<VideoWithAuthor[]>;
  statsByAuthor(authorId: string): Promise<ChannelStats>;
  analytics(videoId: string, days: number): Promise<VideoAnalytics>;
  tagsByAuthor(authorId: string): Promise<string[]>;
}
