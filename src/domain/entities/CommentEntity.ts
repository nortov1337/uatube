import type { UserEntity } from "@/domain/entities/UserEntity";

export interface CommentEntity {
  readonly id: string;
  readonly body: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly userId: string;
  readonly videoId: string;
  readonly parentId: string | null;
  readonly author: UserEntity;
  readonly likesCount: number;
  readonly repliesCount: number;
}
