import type { Comment as PrismaComment, User as PrismaUser } from "@prisma/client";
import type { CommentEntity } from "@/domain/entities/CommentEntity";
import { PrismaUserMapper } from "@/infrastructure/repositories/mappers/PrismaUserMapper";

export type PrismaCommentWithAuthor = PrismaComment & { user: PrismaUser };

export class PrismaCommentMapper {
  static toDomain(row: PrismaCommentWithAuthor): CommentEntity {
    return {
      id: row.id,
      body: row.body,
      createdAt: row.createdAt,
      userId: row.userId,
      videoId: row.videoId,
      author: PrismaUserMapper.toDomain(row.user),
    };
  }
}
