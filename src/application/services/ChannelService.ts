import type { ChannelDTO } from "@/application/dto/ChannelDTO";
import type { Page } from "@/application/dto/Page";
import type { VideoCardDTO } from "@/application/dto/VideoCardDTO";
import { VideoMapper } from "@/application/mappers/VideoMapper";
import { NotFoundError } from "@/domain/errors/NotFoundError";
import type { UserRepository } from "@/domain/ports/UserRepository";
import type { VideoRepository } from "@/domain/ports/VideoRepository";

interface ChannelServiceDeps {
  users: UserRepository;
  videos: VideoRepository;
}

export class ChannelService {
  constructor(private readonly deps: ChannelServiceDeps) {}

  async getByHandle(
    handle: string,
  ): Promise<{ channel: ChannelDTO; videos: Page<VideoCardDTO> }> {
    const user = await this.deps.users.findByHandle(handle);
    if (!user) throw new NotFoundError("Канал не найден");

    const [stats, page] = await Promise.all([
      this.deps.videos.statsByAuthor(user.id),
      this.deps.videos.listFeed({ authorId: user.id, limit: 24 }),
    ]);

    return {
      channel: {
        handle: user.handle,
        name: user.name,
        createdAt: user.createdAt.toISOString(),
        stats,
      },
      videos: { items: page.items.map(VideoMapper.toCard), nextCursor: page.nextCursor },
    };
  }
}
