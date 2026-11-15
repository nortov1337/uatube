import type { Prisma, PrismaClient } from "@prisma/client";
import type { ChannelStats } from "@/domain/entities/ChannelStats";
import type { VideoAnalytics } from "@/domain/entities/VideoAnalytics";
import type { VideoWithAuthor } from "@/domain/entities/VideoWithAuthor";
import type {
  NewVideoData,
  VideoFeedQuery,
  VideoRepository,
  VideoUpdateData,
} from "@/domain/ports/VideoRepository";
import type { VideoSort } from "@/domain/values/VideoVisibility";
import {
  PrismaVideoMapper,
  type PrismaVideoWithAuthor,
} from "@/infrastructure/repositories/mappers/PrismaVideoMapper";

const INCLUDE = {
  author: true,
  _count: { select: { likes: true, comments: true } },
} as const;

const ORDER_BY: Record<VideoSort, Prisma.VideoOrderByWithRelationInput[]> = {
  new: [{ createdAt: "desc" }, { id: "desc" }],
  views: [{ views: "desc" }, { createdAt: "desc" }],
  likes: [{ likes: { _count: "desc" } }, { createdAt: "desc" }],
};

function tagCondition(tags: readonly string[]): Prisma.VideoWhereInput {
  return { OR: tags.map((tag) => ({ tags: { contains: ` ${tag} ` } })) };
}

function buildWhere(query: VideoFeedQuery): Prisma.VideoWhereInput {
  const filters: Prisma.VideoWhereInput[] = [
    { visibility: { in: [...(query.visibility ?? ["public"])] } },
  ];
  if (query.authorId) filters.push({ authorId: query.authorId });
  if (query.category) filters.push({ category: query.category });
  if (query.excludeId) filters.push({ NOT: { id: query.excludeId } });
  if (query.tags && query.tags.length > 0) filters.push(tagCondition(query.tags));
  if (query.q) {
    filters.push({
      OR: [{ title: { contains: query.q } }, { description: { contains: query.q } }],
    });
  }
  return { AND: filters };
}

export class PrismaVideoRepository implements VideoRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(data: NewVideoData): Promise<VideoWithAuthor> {
    const { tags, ...rest } = data;
    const row = await this.prisma.video.create({
      data: { ...rest, tags: tags.length > 0 ? ` ${tags.join(" ")} ` : "" },
      include: INCLUDE,
    });
    return PrismaVideoMapper.toDomain(row);
  }

  async findById(id: string): Promise<VideoWithAuthor | null> {
    const row = await this.prisma.video.findUnique({ where: { id }, include: INCLUDE });
    return row ? PrismaVideoMapper.toDomain(row) : null;
  }

  async findByIds(ids: readonly string[]): Promise<VideoWithAuthor[]> {
    if (ids.length === 0) return [];
    const rows = await this.prisma.video.findMany({
      where: { id: { in: [...ids] } },
      include: INCLUDE,
    });
    return rows.map(PrismaVideoMapper.toDomain);
  }

  async update(id: string, data: VideoUpdateData): Promise<VideoWithAuthor> {
    const { tags, ...rest } = data;
    const row = await this.prisma.video.update({
      where: { id },
      data: {
        ...rest,
        ...(tags ? { tags: tags.length > 0 ? ` ${tags.join(" ")} ` : "" } : {}),
      },
      include: INCLUDE,
    });
    return PrismaVideoMapper.toDomain(row);
  }

  async remove(id: string): Promise<void> {
    await this.prisma.video.delete({ where: { id } });
  }

  async recordView(id: string): Promise<number> {
    const [row] = await this.prisma.$transaction([
      this.prisma.video.update({
        where: { id },
        data: { views: { increment: 1 } },
        select: { views: true },
      }),
      this.prisma.viewEvent.create({ data: { videoId: id } }),
    ]);
    return row.views;
  }

  async listFeed(
    query: VideoFeedQuery,
  ): Promise<{ items: VideoWithAuthor[]; hasMore: boolean }> {
    const rows = await this.prisma.video.findMany({
      where: buildWhere(query),
      orderBy: ORDER_BY[query.sort ?? "new"],
      skip: query.offset,
      take: query.limit + 1,
      include: INCLUDE,
    });

    const hasMore = rows.length > query.limit;
    const items = (hasMore ? rows.slice(0, query.limit) : rows).map(PrismaVideoMapper.toDomain);
    return { items, hasMore };
  }

  async listByTags(
    tags: readonly string[],
    params: { excludeId?: string; limit: number },
  ): Promise<VideoWithAuthor[]> {
    if (tags.length === 0) return [];
    const rows = await this.prisma.video.findMany({
      where: {
        visibility: "public",
        ...(params.excludeId ? { NOT: { id: params.excludeId } } : {}),
        ...tagCondition(tags),
      },
      orderBy: ORDER_BY.views,
      take: params.limit,
      include: INCLUDE,
    });
    return rows.map(PrismaVideoMapper.toDomain);
  }

  async listByAuthors(
    authorIds: readonly string[],
    params: { excludeId?: string; limit: number },
  ): Promise<VideoWithAuthor[]> {
    if (authorIds.length === 0) return [];
    const rows = await this.prisma.video.findMany({
      where: {
        visibility: "public",
        authorId: { in: [...authorIds] },
        ...(params.excludeId ? { NOT: { id: params.excludeId } } : {}),
      },
      orderBy: ORDER_BY.new,
      take: params.limit,
      include: INCLUDE,
    });
    return rows.map(PrismaVideoMapper.toDomain);
  }

  async listRecent(params: { excludeId?: string; limit: number }): Promise<VideoWithAuthor[]> {
    const rows = await this.prisma.video.findMany({
      where: {
        visibility: "public",
        ...(params.excludeId ? { NOT: { id: params.excludeId } } : {}),
      },
      orderBy: ORDER_BY.new,
      take: params.limit,
      include: INCLUDE,
    });
    return rows.map(PrismaVideoMapper.toDomain);
  }

  async statsByAuthor(authorId: string): Promise<ChannelStats> {
    const [videos, views, likes, subscribers] = await Promise.all([
      this.prisma.video.count({ where: { authorId, visibility: { not: "private" } } }),
      this.prisma.video.aggregate({
        where: { authorId, visibility: { not: "private" } },
        _sum: { views: true },
      }),
      this.prisma.like.count({ where: { video: { authorId } } }),
      this.prisma.subscription.count({ where: { channelId: authorId } }),
    ]);
    return { videos, views: views._sum.views ?? 0, likes, subscribers };
  }

  async analytics(videoId: string, days: number): Promise<VideoAnalytics> {
    const since = new Date(Date.now() - days * 86400 * 1000);
    const [video, likes, comments, events] = await Promise.all([
      this.prisma.video.findUnique({ where: { id: videoId }, select: { views: true } }),
      this.prisma.like.count({ where: { videoId } }),
      this.prisma.comment.count({ where: { videoId } }),
      this.prisma.viewEvent.findMany({
        where: { videoId, createdAt: { gte: since } },
        select: { createdAt: true },
      }),
    ]);

    const buckets = new Map<string, number>();
    for (let index = days - 1; index >= 0; index -= 1) {
      buckets.set(this.dayKey(new Date(Date.now() - index * 86400 * 1000)), 0);
    }
    for (const event of events) {
      const key = this.dayKey(event.createdAt);
      if (buckets.has(key)) buckets.set(key, (buckets.get(key) ?? 0) + 1);
    }

    return {
      days: [...buckets].map(([date, views]) => ({ date, views })),
      totalViews: video?.views ?? 0,
      likes,
      comments,
    };
  }

  async tagsByAuthor(authorId: string): Promise<string[]> {
    const rows = await this.prisma.video.findMany({
      where: { authorId },
      select: { tags: true },
    });
    const counts = new Map<string, number>();
    for (const row of rows) {
      for (const tag of row.tags.split(" ").filter(Boolean)) {
        counts.set(tag, (counts.get(tag) ?? 0) + 1);
      }
    }
    return [...counts].sort((a, b) => b[1] - a[1]).map(([tag]) => tag);
  }

  private dayKey(date: Date): string {
    return date.toISOString().slice(0, 10);
  }
}

export type { PrismaVideoWithAuthor };
