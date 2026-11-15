import { offsetFromCursor, pageOf, type Page } from "@/application/dto/Page";
import type { ChannelSummaryDTO } from "@/application/dto/ChannelSummaryDTO";
import type { VideoCardDTO } from "@/application/dto/VideoCardDTO";
import { UserMapper } from "@/application/mappers/UserMapper";
import { VideoMapper } from "@/application/mappers/VideoMapper";
import { parseOrThrow } from "@/application/validation/parse";
import { listQuerySchema, subscriptionSchema } from "@/application/validation/schemas";
import { NotFoundError } from "@/domain/errors/NotFoundError";
import { ValidationError } from "@/domain/errors/ValidationError";
import type { SubscriptionRepository } from "@/domain/ports/SubscriptionRepository";
import type { UserRepository } from "@/domain/ports/UserRepository";

interface SubscriptionServiceDeps {
  subscriptions: SubscriptionRepository;
  users: UserRepository;
}

export class SubscriptionService {
  constructor(private readonly deps: SubscriptionServiceDeps) {}

  async toggle(
    input: unknown,
    subscriberId: string,
  ): Promise<{ subscribed: boolean; subscribers: number }> {
    const { handle } = parseOrThrow(subscriptionSchema, input);
    const channel = await this.deps.users.findByHandle(handle);
    if (!channel) throw new NotFoundError("Канал не найден");
    if (channel.id === subscriberId) {
      throw new ValidationError("Нельзя подписаться на свой канал");
    }

    const subscribed = await this.deps.subscriptions.toggle(subscriberId, channel.id);
    const subscribers = await this.deps.subscriptions.countByChannel(channel.id);
    return { subscribed, subscribers };
  }

  async list(subscriberId: string): Promise<ChannelSummaryDTO[]> {
    const channels = await this.deps.subscriptions.listChannels(subscriberId);
    const counts = await this.deps.subscriptions.countByChannels(
      channels.map((channel) => channel.id),
    );
    return channels.map((channel) => ({
      ...UserMapper.toPublic(channel),
      subscribers: counts.get(channel.id) ?? 0,
    }));
  }

  async feed(subscriberId: string, query: unknown): Promise<Page<VideoCardDTO>> {
    const parsed = parseOrThrow(listQuerySchema, query);
    const offset = offsetFromCursor(parsed.cursor);
    const page = await this.deps.subscriptions.listVideoFeed({
      subscriberId,
      offset,
      limit: parsed.limit,
    });
    return pageOf(page.items.map(VideoMapper.toCard), page.hasMore, offset, parsed.limit);
  }
}
