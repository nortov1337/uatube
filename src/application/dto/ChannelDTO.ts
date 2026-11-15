import type { ChannelStats } from "@/domain/entities/ChannelStats";

export interface ChannelDTO {
  handle: string;
  name: string;
  createdAt: string;
  stats: ChannelStats;
}
