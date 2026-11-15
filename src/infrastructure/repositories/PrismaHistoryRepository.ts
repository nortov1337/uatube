import type { PrismaClient } from "@prisma/client";
import type { HistoryEntry } from "@/domain/entities/HistoryEntry";
import type { HistoryRepository } from "@/domain/ports/HistoryRepository";
import { PrismaVideoMapper } from "@/infrastructure/repositories/mappers/PrismaVideoMapper";

const INCLUDE = {
  video: { include: { author: true, _count: { select: { likes: true, comments: true } } } },
} as const;

export class PrismaHistoryRepository implements HistoryRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async upsert(data: { userId: string; videoId: string; positionSec: number }): Promise<void> {
    await this.prisma.watchHistory.upsert({
      where: { userId_videoId: { userId: data.userId, videoId: data.videoId } },
      create: {
        userId: data.userId,
        videoId: data.videoId,
        positionSec: data.positionSec,
      },
      update: { positionSec: data.positionSec, watchedAt: new Date() },
    });
  }

  async findPosition(userId: string, videoId: string): Promise<number | null> {
    const row = await this.prisma.watchHistory.findUnique({
      where: { userId_videoId: { userId, videoId } },
      select: { positionSec: true },
    });
    return row?.positionSec ?? null;
  }

  async list(params: {
    userId: string;
    offset: number;
    limit: number;
  }): Promise<{ items: HistoryEntry[]; hasMore: boolean }> {
    const rows = await this.prisma.watchHistory.findMany({
      where: { userId: params.userId },
      orderBy: [{ watchedAt: "desc" }],
      skip: params.offset,
      take: params.limit + 1,
      include: INCLUDE,
    });
    const hasMore = rows.length > params.limit;
    const items = (hasMore ? rows.slice(0, params.limit) : rows).map((row) => ({
      video: PrismaVideoMapper.toDomain(row.video),
      positionSec: row.positionSec,
      watchedAt: row.watchedAt,
    }));
    return { items, hasMore };
  }

  async listRecent(userId: string, limit: number): Promise<HistoryEntry[]> {
    const rows = await this.prisma.watchHistory.findMany({
      where: { userId },
      orderBy: [{ watchedAt: "desc" }],
      take: limit,
      include: INCLUDE,
    });
    return rows.map((row) => ({
      video: PrismaVideoMapper.toDomain(row.video),
      positionSec: row.positionSec,
      watchedAt: row.watchedAt,
    }));
  }

  async remove(userId: string, videoId: string): Promise<void> {
    await this.prisma.watchHistory.deleteMany({ where: { userId, videoId } });
  }

  async clear(userId: string): Promise<void> {
    await this.prisma.watchHistory.deleteMany({ where: { userId } });
  }
}
