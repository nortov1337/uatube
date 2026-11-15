import type { NotificationDTO } from "@/application/dto/NotificationDTO";
import { offsetFromCursor, pageOf, type Page } from "@/application/dto/Page";
import { parseOrThrow } from "@/application/validation/parse";
import { listQuerySchema } from "@/application/validation/schemas";
import type { NotificationEntity } from "@/domain/entities/NotificationEntity";
import type { NotificationRepository } from "@/domain/ports/NotificationRepository";

interface NotificationServiceDeps {
  notifications: NotificationRepository;
}

export class NotificationService {
  constructor(private readonly deps: NotificationServiceDeps) {}

  async list(userId: string, query: unknown): Promise<Page<NotificationDTO>> {
    const parsed = parseOrThrow(listQuerySchema, query);
    const offset = offsetFromCursor(parsed.cursor);
    const page = await this.deps.notifications.list({ userId, offset, limit: parsed.limit });
    return pageOf(page.items.map(NotificationService.toDTO), page.hasMore, offset, parsed.limit);
  }

  async unread(userId: string): Promise<number> {
    return this.deps.notifications.countUnread(userId);
  }

  async markAllRead(userId: string): Promise<void> {
    await this.deps.notifications.markAllRead(userId);
  }

  async remove(id: string, userId: string): Promise<void> {
    await this.deps.notifications.remove(id, userId);
  }

  private static toDTO(notification: NotificationEntity): NotificationDTO {
    return {
      id: notification.id,
      kind: notification.kind,
      actorHandle: notification.actorHandle,
      actorName: notification.actorName,
      videoId: notification.videoId,
      body: notification.body,
      read: notification.readAt !== null,
      createdAt: notification.createdAt.toISOString(),
    };
  }
}
