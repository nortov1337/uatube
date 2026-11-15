import type { ChannelStats } from "@/domain/entities/ChannelStats";

export interface ChannelDTO {
  id: string;
  handle: string;
  name: string;
  bio: string;
  avatarUrl: string | null;
  bannerUrl: string | null;
  createdAt: string;
  stats: ChannelStats;
  subscribedByMe: boolean;
  isOwner: boolean;
}
