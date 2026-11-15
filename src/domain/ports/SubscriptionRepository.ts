import type { UserEntity } from "@/domain/entities/UserEntity";
import type { VideoWithAuthor } from "@/domain/entities/VideoWithAuthor";

export interface SubscriptionRepository {
  exists(subscriberId: string, channelId: string): Promise<boolean>;
  toggle(subscriberId: string, channelId: string): Promise<boolean>;
  countByChannel(channelId: string): Promise<number>;
  countByChannels(channelIds: readonly string[]): Promise<Map<string, number>>;
  countBySubscriber(subscriberId: string): Promise<number>;
  listChannels(subscriberId: string): Promise<UserEntity[]>;
  listSubscriberIds(channelId: string): Promise<string[]>;
  listVideoFeed(params: {
    subscriberId: string;
    offset: number;
    limit: number;
  }): Promise<{ items: VideoWithAuthor[]; hasMore: boolean }>;
}
