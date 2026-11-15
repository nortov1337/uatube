import type { CommentDTO } from "@/application/dto/CommentDTO";
import { UserMapper } from "@/application/mappers/UserMapper";
import type { CommentEntity } from "@/domain/entities/CommentEntity";

export class CommentMapper {
  static toDTO(comment: CommentEntity): CommentDTO {
    return {
      id: comment.id,
      body: comment.body,
      createdAt: comment.createdAt.toISOString(),
      author: UserMapper.toPublic(comment.author),
    };
  }
}
