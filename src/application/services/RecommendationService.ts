import type { VideoCardDTO } from "@/application/dto/VideoCardDTO";
import { VideoMapper } from "@/application/mappers/VideoMapper";
import type { HistoryRepository } from "@/domain/ports/HistoryRepository";
import type { SubscriptionRepository } from "@/domain/ports/SubscriptionRepository";
import type { VideoRepository } from "@/domain/ports/VideoRepository";
import type { VideoWithAuthor } from "@/domain/entities/VideoWithAuthor";

interface RecommendationServiceDeps {
  videos: VideoRepository;
  subscriptions: SubscriptionRepository;
  history: HistoryRepository;
}

interface Weights {
  affinityTags: ReadonlySet<string>;
  affinityAuthors: ReadonlySet<string>;
}

const DAY_MS = 86400 * 1000;

export class RecommendationService {
  constructor(private readonly deps: RecommendationServiceDeps) {}

  async related(
    video: VideoWithAuthor,
    viewerId: string | null,
    limit: number,
  ): Promise<VideoCardDTO[]> {
    const [byTags, byCategory, byAuthor, subscribedIds] = await Promise.all([
      this.deps.videos.listByTags(video.tags, { excludeId: video.id, limit: 60 }),
      video.category
        ? this.deps.videos.listFeed({
            category: video.category,
            excludeId: video.id,
            offset: 0,
            limit: 40,
          })
        : Promise.resolve({ items: [] as VideoWithAuthor[], hasMore: false }),
      this.deps.videos.listByAuthors([video.authorId], { excludeId: video.id, limit: 20 }),
      this.subscribedIds(viewerId),
    ]);

    const weights: Weights = {
      affinityTags: new Set(video.tags),
      affinityAuthors: subscribedIds,
    };
    const candidates = RecommendationService.dedupe([
      ...byAuthor,
      ...byTags,
      ...byCategory.items,
    ]);
    const scored = this.rank(candidates, weights, video.id);

    if (scored.length < limit) {
      const recent = await this.deps.videos.listRecent({ excludeId: video.id, limit: 60 });
      const known = new Set([...scored.map((item) => item.video.id), video.id]);
      scored.push(
        ...this.rank(
          recent.filter((item) => !known.has(item.id)),
          weights,
          video.id,
        ),
      );
    }

    return scored.slice(0, limit).map((item) => VideoMapper.toCard(item.video));
  }

  async feed(viewerId: string | null, limit: number): Promise<VideoCardDTO[]> {
    const subscribed = viewerId
      ? await this.deps.subscriptions.listChannels(viewerId)
      : [];
    const history = viewerId ? await this.deps.history.listRecent(viewerId, 30) : [];

    const [subscribedVideos, byTags, recent] = await Promise.all([
      this.deps.videos.listByAuthors(
        subscribed.map((channel) => channel.id),
        { limit: 60 },
      ),
      this.deps.videos.listByTags(RecommendationService.historyTags(history), { limit: 60 }),
      this.deps.videos.listRecent({ limit: 80 }),
    ]);

    const weights: Weights = {
      affinityTags: new Set(RecommendationService.historyTags(history)),
      affinityAuthors: new Set(subscribed.map((channel) => channel.id)),
    };
    const candidates = RecommendationService.dedupe([...subscribedVideos, ...byTags, ...recent]);
    return this.rank(candidates, weights, null)
      .slice(0, limit)
      .map((item) => VideoMapper.toCard(item.video));
  }

  private rank(
    candidates: readonly VideoWithAuthor[],
    weights: Weights,
    excludeId: string | null,
  ): Array<{ video: VideoWithAuthor; score: number }> {
    return candidates
      .filter((video) => video.id !== excludeId)
      .map((video) => ({ video, score: this.score(video, weights) }))
      .sort((left, right) => right.score - left.score);
  }

  private score(video: VideoWithAuthor, weights: Weights): number {
    const tags = video.tags;
    const affinityOverlap = tags.filter((tag) => weights.affinityTags.has(tag)).length;
    const ageDays = Math.max(0, (Date.now() - video.createdAt.getTime()) / DAY_MS);
    const popularity =
      Math.log10(video.views + 1) * 0.8 + Math.log10(video.likesCount + 1) * 1.4;

    return (
      affinityOverlap * 4 +
      (weights.affinityAuthors.has(video.authorId) ? 3 : 0) +
      popularity +
      3 / (1 + ageDays) +
      (video.durationSec > 0 ? 0.2 : 0)
    );
  }

  private async subscribedIds(viewerId: string | null): Promise<ReadonlySet<string>> {
    if (!viewerId) return new Set();
    const channels = await this.deps.subscriptions.listChannels(viewerId);
    return new Set(channels.map((channel) => channel.id));
  }

  private static historyTags(
    history: ReadonlyArray<{ video: VideoWithAuthor }>,
  ): string[] {
    const counts = new Map<string, number>();
    for (const entry of history) {
      for (const tag of entry.video.tags) {
        counts.set(tag, (counts.get(tag) ?? 0) + 1);
      }
    }
    return [...counts]
      .sort((left, right) => right[1] - left[1])
      .slice(0, 12)
      .map(([tag]) => tag);
  }

  private static dedupe(videos: readonly VideoWithAuthor[]): VideoWithAuthor[] {
    const seen = new Set<string>();
    return videos.filter((video) => {
      if (seen.has(video.id)) return false;
      seen.add(video.id);
      return true;
    });
  }
}
