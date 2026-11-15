import type { Prisma, PrismaClient } from "@prisma/client";
import type { ChannelStats } from "@/domain/entities/ChannelStats";
import type { VideoEntity } from "@/domain/entities/VideoEntity";
import type { VideoWithAuthor } from "@/domain/entities/VideoWithAuthor";
import type { NewVideoData, VideoRepository } from "@/domain/ports/VideoRepository";
import {
  PrismaVideoMapper,
  type PrismaVideoWithAuthor,
} from "@/infrastructure/repositories/mappers/PrismaVideoMapper";

const INCLUDE = {
  author: true,
  _count: { select: { likes: true } },
} as const;

const ORDER: Prisma.VideoOrderByWithRelationInput[] = [{ createdAt: "desc" }, { id: "desc" }];

export class PrismaVideoRepository implements VideoRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(data: NewVideoData): Promise<VideoEntity> {
    const row = await this.prisma.video.create({ data, include: INCLUDE });
    return PrismaVideoMapper.toDomain(row);
  }

  async findById(id: string): Promise<VideoWithAuthor | null> {
    const row = await this.prisma.video.findUnique({ where: { id }, include: INCLUDE });
    return row ? PrismaVideoMapper.toDomain(row) : null;
  }

  async remove(id: string): Promise<void> {
    await this.prisma.video.delete({ where: { id } });
  }

  async incrementViews(id: string): Promise<number> {
    const row = await this.prisma.video.update({
      where: { id },
      data: { views: { increment: 1 } },
      select: { views: true },
    });
    return row.views;
  }

  async listFeed(params: {
    q?: string;
    authorId?: string;
    excludeId?: string;
    cursor?: string;
    limit: number;
  }): Promise<{ items: VideoWithAuthor[]; nextCursor: string | null }> {
    const rows = await this.prisma.video.findMany({
      where: {
        ...(params.authorId ? { authorId: params.authorId } : {}),
        ...(params.q ? { title: { contains: params.q } } : {}),
        ...(params.excludeId ? { NOT: { id: params.excludeId } } : {}),
      },
      orderBy: ORDER,
      take: params.limit + 1,
      ...(params.cursor ? { cursor: { id: params.cursor }, skip: 1 } : {}),
      include: INCLUDE,
    });

    const hasMore = rows.length > params.limit;
    const items = (hasMore ? rows.slice(0, params.limit) : rows).map(PrismaVideoMapper.toDomain);
    return {
      items,
      nextCursor: hasMore ? items[items.length - 1].id : null,
    };
  }

  async listRelated(params: {
    video: VideoWithAuthor;
    limit: number;
  }): Promise<VideoWithAuthor[]> {
    const sameAuthor = await this.prisma.video.findMany({
      where: { authorId: params.video.authorId, NOT: { id: params.video.id } },
      orderBy: ORDER,
      take: params.limit,
      include: INCLUDE,
    });
    if (sameAuthor.length >= params.limit) return sameAuthor.map(PrismaVideoMapper.toDomain);

    const fresh = await this.prisma.video.findMany({
      where: { NOT: { id: { in: [params.video.id, ...sameAuthor.map((row) => row.id)] } } },
      orderBy: ORDER,
      take: params.limit - sameAuthor.length,
      include: INCLUDE,
    });

    return [...sameAuthor, ...fresh].map((row: PrismaVideoWithAuthor) =>
      PrismaVideoMapper.toDomain(row),
    );
  }

  async statsByAuthor(authorId: string): Promise<ChannelStats> {
    const [videos, views, likes] = await Promise.all([
      this.prisma.video.count({ where: { authorId } }),
      this.prisma.video.aggregate({ where: { authorId }, _sum: { views: true } }),
      this.prisma.like.count({ where: { video: { authorId } } }),
    ]);
    return { videos, views: views._sum.views ?? 0, likes };
  }
}
