export interface NotificationEntity {
  readonly id: string;
  readonly kind: string;
  readonly actorHandle: string;
  readonly actorName: string;
  readonly videoId: string | null;
  readonly body: string;
  readonly readAt: Date | null;
  readonly createdAt: Date;
}
