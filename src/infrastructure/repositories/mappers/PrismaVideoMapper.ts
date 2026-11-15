import type { User as PrismaUser, Video as PrismaVideo } from "@prisma/client";
import { PrismaUserMapper } from "@/infrastructure/repositories/mappers/PrismaUserMapper";
import type { VideoWithAuthor } from "@/domain/entities/VideoWithAuthor";

export type PrismaVideoWithAuthor = PrismaVideo & {
  author: PrismaUser;
  _count: { likes: number };
};

export class PrismaVideoMapper {
  static toDomain(row: PrismaVideoWithAuthor): VideoWithAuthor {
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      fileName: row.fileName,
      mimeType: row.mimeType,
      sizeBytes: row.sizeBytes,
      durationSec: row.durationSec,
      thumbName: row.thumbName,
      views: row.views,
      createdAt: row.createdAt,
      authorId: row.authorId,
      author: PrismaUserMapper.toDomain(row.author),
      likesCount: row._count.likes,
    };
  }
}
