import type { PrismaClient } from "@prisma/client";
import type { UserEntity } from "@/domain/entities/UserEntity";
import type { VideoWithAuthor } from "@/domain/entities/VideoWithAuthor";
import type { SubscriptionRepository } from "@/domain/ports/SubscriptionRepository";
import { PrismaUserMapper } from "@/infrastructure/repositories/mappers/PrismaUserMapper";
import { PrismaVideoMapper } from "@/infrastructure/repositories/mappers/PrismaVideoMapper";

const VIDEO_INCLUDE = {
  author: true,
  _count: { select: { likes: true, comments: true } },
} as const;

export class PrismaSubscriptionRepository implements SubscriptionRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async exists(subscriberId: string, channelId: string): Promise<boolean> {
    const row = await this.prisma.subscription.findUnique({
      where: { subscriberId_channelId: { subscriberId, channelId } },
      select: { id: true },
    });
    return row !== null;
  }

  async toggle(subscriberId: string, channelId: string): Promise<boolean> {
    const existing = await this.prisma.subscription.findUnique({
      where: { subscriberId_channelId: { subscriberId, channelId } },
      select: { id: true },
    });
    if (existing) {
      await this.prisma.subscription.delete({ where: { id: existing.id } });
      return false;
    }
    await this.prisma.subscription.create({ data: { subscriberId, channelId } });
    return true;
  }

  async countByChannel(channelId: string): Promise<number> {
    return this.prisma.subscription.count({ where: { channelId } });
  }

  async countBySubscriber(subscriberId: string): Promise<number> {
    return this.prisma.subscription.count({ where: { subscriberId } });
  }

  async listChannels(subscriberId: string): Promise<UserEntity[]> {
    const rows = await this.prisma.subscription.findMany({
      where: { subscriberId },
      orderBy: { createdAt: "desc" },
      include: { channel: true },
    });
    return rows.map((row) => PrismaUserMapper.toDomain(row.channel));
  }

  async listSubscriberIds(channelId: string): Promise<string[]> {
    const rows = await this.prisma.subscription.findMany({
      where: { channelId },
      select: { subscriberId: true },
    });
    return rows.map((row) => row.subscriberId);
  }

  async listVideoFeed(params: {
    subscriberId: string;
    offset: number;
    limit: number;
  }): Promise<{ items: VideoWithAuthor[]; hasMore: boolean }> {
    const rows = await this.prisma.video.findMany({
      where: {
        visibility: "public",
        author: { subscribers: { some: { subscriberId: params.subscriberId } } },
      },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      skip: params.offset,
      take: params.limit + 1,
      include: VIDEO_INCLUDE,
    });
    const hasMore = rows.length > params.limit;
    const items = (hasMore ? rows.slice(0, params.limit) : rows).map(PrismaVideoMapper.toDomain);
    return { items, hasMore };
  }
}
