import type { PrismaClient } from "@prisma/client";
import type { NotificationEntity } from "@/domain/entities/NotificationEntity";
import type {
  NewNotificationData,
  NotificationRepository,
} from "@/domain/ports/NotificationRepository";

export class PrismaNotificationRepository implements NotificationRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async createMany(data: readonly NewNotificationData[]): Promise<void> {
    if (data.length === 0) return;
    await this.prisma.notification.createMany({ data: [...data] });
  }

  async list(params: {
    userId: string;
    offset: number;
    limit: number;
  }): Promise<{ items: NotificationEntity[]; hasMore: boolean }> {
    const rows = await this.prisma.notification.findMany({
      where: { userId: params.userId },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      skip: params.offset,
      take: params.limit + 1,
    });
    const hasMore = rows.length > params.limit;
    const items = (hasMore ? rows.slice(0, params.limit) : rows).map((row) => ({
      id: row.id,
      kind: row.kind,
      actorHandle: row.actorHandle,
      actorName: row.actorName,
      videoId: row.videoId,
      body: row.body,
      readAt: row.readAt,
      createdAt: row.createdAt,
    }));
    return { items, hasMore };
  }

  async countUnread(userId: string): Promise<number> {
    return this.prisma.notification.count({ where: { userId, readAt: null } });
  }

  async markAllRead(userId: string): Promise<void> {
    await this.prisma.notification.updateMany({
      where: { userId, readAt: null },
      data: { readAt: new Date() },
    });
  }

  async remove(id: string, userId: string): Promise<void> {
    await this.prisma.notification.deleteMany({ where: { id, userId } });
  }
}
