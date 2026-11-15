import type { CommentDTO } from "@/application/dto/CommentDTO";
import { UserMapper } from "@/application/mappers/UserMapper";
import type { CommentEntity } from "@/domain/entities/CommentEntity";

export class CommentMapper {
  static toDTO(comment: CommentEntity, likedByMe: boolean): CommentDTO {
    return {
      id: comment.id,
      body: comment.body,
      createdAt: comment.createdAt.toISOString(),
      updatedAt: comment.updatedAt.toISOString(),
      parentId: comment.parentId,
      author: UserMapper.toPublic(comment.author),
      likesCount: comment.likesCount,
      likedByMe,
      repliesCount: comment.repliesCount,
    };
  }
}
