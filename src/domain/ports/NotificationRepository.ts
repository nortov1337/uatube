import type { NotificationEntity } from "@/domain/entities/NotificationEntity";

export interface NewNotificationData {
  userId: string;
  kind: string;
  actorHandle: string;
  actorName: string;
  videoId: string | null;
  body: string;
}

export interface NotificationRepository {
  createMany(data: readonly NewNotificationData[]): Promise<void>;
  list(params: {
    userId: string;
    offset: number;
    limit: number;
  }): Promise<{ items: NotificationEntity[]; hasMore: boolean }>;
  countUnread(userId: string): Promise<number>;
  markAllRead(userId: string): Promise<void>;
  remove(id: string, userId: string): Promise<void>;
}
