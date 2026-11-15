import type { ChannelDTO } from "@/application/dto/ChannelDTO";
import type { Page } from "@/application/dto/Page";
import type { PlaylistDTO } from "@/application/dto/PlaylistDTO";
import type { VideoCardDTO } from "@/application/dto/VideoCardDTO";
import { offsetFromCursor, pageOf } from "@/application/dto/Page";
import { VideoMapper } from "@/application/mappers/VideoMapper";
import type { PlaylistService } from "@/application/services/PlaylistService";
import { parseOrThrow } from "@/application/validation/parse";
import { listQuerySchema } from "@/application/validation/schemas";
import { NotFoundError } from "@/domain/errors/NotFoundError";
import type { SubscriptionRepository } from "@/domain/ports/SubscriptionRepository";
import type { UserRepository } from "@/domain/ports/UserRepository";
import type { VideoRepository } from "@/domain/ports/VideoRepository";
import type { VideoVisibility } from "@/domain/values/VideoVisibility";

interface ChannelServiceDeps {
  users: UserRepository;
  videos: VideoRepository;
  subscriptions: SubscriptionRepository;
  playlists: PlaylistService;
}

export interface ChannelPageData {
  channel: ChannelDTO;
  videos: Page<VideoCardDTO>;
  playlists: PlaylistDTO[];
}

const OWNER_VISIBILITY: readonly VideoVisibility[] = ["public", "unlisted", "private"];

export class ChannelService {
  constructor(private readonly deps: ChannelServiceDeps) {}

  async getSummary(handle: string, viewerId: string | null): Promise<ChannelDTO> {
    const user = await this.deps.users.findByHandle(handle);
    if (!user) throw new NotFoundError("Канал не найден");

    const [stats, subscribedByMe] = await Promise.all([
      this.deps.videos.statsByAuthor(user.id),
      viewerId ? this.deps.subscriptions.exists(viewerId, user.id) : Promise.resolve(false),
    ]);

    return {
      id: user.id,
      handle: user.handle,
      name: user.name,
      bio: user.bio,
      avatarUrl: user.avatarName ? `/api/avatar/${user.handle}` : null,
      bannerUrl: user.bannerName ? `/api/banner/${user.handle}` : null,
      createdAt: user.createdAt.toISOString(),
      stats,
      subscribedByMe,
      isOwner: user.id === viewerId,
    };
  }

  async getByHandle(
    handle: string,
    viewerId: string | null,
    query: unknown = {},
  ): Promise<ChannelPageData> {
    const channel = await this.getSummary(handle, viewerId);
    const parsed = parseOrThrow(listQuerySchema, query);
    const offset = offsetFromCursor(parsed.cursor);

    const [videos, playlists] = await Promise.all([
      this.deps.videos.listFeed({
        authorId: channel.id,
        sort: parsed.sort,
        visibility: channel.isOwner ? OWNER_VISIBILITY : ["public"],
        offset,
        limit: parsed.limit,
      }),
      this.deps.playlists.listForOwner(channel.id, channel.isOwner),
    ]);

    return {
      channel,
      videos: pageOf(videos.items.map(VideoMapper.toCard), videos.hasMore, offset, parsed.limit),
      playlists,
    };
  }
}
