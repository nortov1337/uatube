import type { Comment as PrismaComment, User as PrismaUser } from "@prisma/client";
import type { CommentEntity } from "@/domain/entities/CommentEntity";
import { PrismaUserMapper } from "@/infrastructure/repositories/mappers/PrismaUserMapper";

export type PrismaCommentWithAuthor = PrismaComment & {
  user: PrismaUser;
  _count: { likes: number; replies: number };
};

export class PrismaCommentMapper {
  static toDomain(row: PrismaCommentWithAuthor): CommentEntity {
    return {
      id: row.id,
      body: row.body,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      userId: row.userId,
      videoId: row.videoId,
      parentId: row.parentId,
      author: PrismaUserMapper.toDomain(row.user),
      likesCount: row._count.likes,
      repliesCount: row._count.replies,
    };
  }
}
