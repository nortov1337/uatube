import type { User as PrismaUser, Video as PrismaVideo } from "@prisma/client";
import type { VideoWithAuthor } from "@/domain/entities/VideoWithAuthor";
import type { VideoVisibility } from "@/domain/values/VideoVisibility";
import { PrismaUserMapper } from "@/infrastructure/repositories/mappers/PrismaUserMapper";

export type PrismaVideoWithAuthor = PrismaVideo & {
  author: PrismaUser;
  _count: { likes: number; comments: number };
};

export class PrismaVideoMapper {
  static toDomain(row: PrismaVideoWithAuthor): VideoWithAuthor {
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      tags: row.tags.split(" ").filter(Boolean),
      category: row.category,
      visibility: row.visibility as VideoVisibility,
      fileName: row.fileName,
      mimeType: row.mimeType,
      sizeBytes: row.sizeBytes,
      durationSec: row.durationSec,
      thumbName: row.thumbName,
      views: row.views,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      authorId: row.authorId,
      author: PrismaUserMapper.toDomain(row.author),
      likesCount: row._count.likes,
      commentsCount: row._count.comments,
    };
  }
}
