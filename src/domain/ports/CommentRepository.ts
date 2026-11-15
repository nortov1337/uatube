import type { CommentEntity } from "@/domain/entities/CommentEntity";

export type CommentSort = "new" | "top";

export interface CommentRepository {
  listTopLevel(params: {
    videoId: string;
    sort: CommentSort;
    offset: number;
    limit: number;
  }): Promise<{ items: CommentEntity[]; hasMore: boolean }>;
  listReplies(params: {
    parentId: string;
    offset: number;
    limit: number;
  }): Promise<{ items: CommentEntity[]; hasMore: boolean }>;
  countByVideo(videoId: string): Promise<number>;
  create(data: {
    body: string;
    userId: string;
    videoId: string;
    parentId: string | null;
  }): Promise<CommentEntity>;
  findById(id: string): Promise<CommentEntity | null>;
  update(id: string, body: string): Promise<CommentEntity>;
  remove(id: string): Promise<void>;
}
