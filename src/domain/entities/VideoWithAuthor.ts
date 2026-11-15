import type { UserEntity } from "@/domain/entities/UserEntity";
import type { VideoEntity } from "@/domain/entities/VideoEntity";

export interface VideoWithAuthor extends VideoEntity {
  readonly author: UserEntity;
  readonly likesCount: number;
}
