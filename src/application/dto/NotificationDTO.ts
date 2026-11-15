export interface NotificationDTO {
  id: string;
  kind: string;
  actorHandle: string;
  actorName: string;
  videoId: string | null;
  body: string;
  read: boolean;
  createdAt: string;
}
