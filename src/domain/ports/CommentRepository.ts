import type { CommentEntity } from "@/domain/entities/CommentEntity";

export interface CommentRepository {
  list(params: {
    videoId: string;
    cursor?: string;
    limit: number;
  }): Promise<{ items: CommentEntity[]; nextCursor: string | null }>;
  countByVideo(videoId: string): Promise<number>;
  create(data: {
    body: string;
    userId: string;
    videoId: string;
  }): Promise<CommentEntity>;
  findById(id: string): Promise<CommentEntity | null>;
  remove(id: string): Promise<void>;
}
