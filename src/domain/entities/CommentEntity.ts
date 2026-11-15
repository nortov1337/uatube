import type { UserEntity } from "@/domain/entities/UserEntity";

export interface CommentEntity {
  readonly id: string;
  readonly body: string;
  readonly createdAt: Date;
  readonly userId: string;
  readonly videoId: string;
  readonly author: UserEntity;
}
