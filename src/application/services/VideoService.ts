import { offsetFromCursor, pageOf, type Page } from "@/application/dto/Page";
import type { VideoCardDTO } from "@/application/dto/VideoCardDTO";
import type { VideoDetailsDTO } from "@/application/dto/VideoDetailsDTO";
import { VideoMapper } from "@/application/mappers/VideoMapper";
import type { RecommendationService } from "@/application/services/RecommendationService";
import { TagNormalizer } from "@/application/services/TagNormalizer";
import { parseOrThrow } from "@/application/validation/parse";
import { listQuerySchema } from "@/application/validation/schemas";
import { NotFoundError } from "@/domain/errors/NotFoundError";
import type { LikeRepository } from "@/domain/ports/LikeRepository";
import type { VideoRepository } from "@/domain/ports/VideoRepository";

interface VideoServiceDeps {
  videos: VideoRepository;
  likes: LikeRepository;
  recommendations: RecommendationService;
}

export class VideoService {
  constructor(private readonly deps: VideoServiceDeps) {}

  async listFeed(query: unknown): Promise<Page<VideoCardDTO>> {
    const parsed = parseOrThrow(listQuerySchema, query);
    const offset = offsetFromCursor(parsed.cursor);
    const page = await this.deps.videos.listFeed({
      q: parsed.q || undefined,
      tags: parsed.tag ? TagNormalizer.normalize(parsed.tag) : undefined,
      category: parsed.category || undefined,
      sort: parsed.sort,
      visibility: ["public"],
      offset,
      limit: parsed.limit,
    });
    return pageOf(page.items.map(VideoMapper.toCard), page.hasMore, offset, parsed.limit);
  }

  async homeFeed(viewerId: string | null, limit: number): Promise<VideoCardDTO[]> {
    return this.deps.recommendations.feed(viewerId, limit);
  }

  async getDetails(id: string, viewerId: string | null): Promise<VideoDetailsDTO> {
    const video = await this.deps.videos.findById(id);
    if (!video) throw new NotFoundError("Видео не найдено");
    if (video.visibility === "private" && video.authorId !== viewerId) {
      throw new NotFoundError("Видео не найдено");
    }
    const likedByMe = viewerId ? await this.deps.likes.find(viewerId, video.id) : false;
    return VideoMapper.toDetails(video, likedByMe);
  }

  async listRelated(id: string, viewerId: string | null, limit: number): Promise<VideoCardDTO[]> {
    const video = await this.deps.videos.findById(id);
    if (!video) throw new NotFoundError("Видео не найдено");
    return this.deps.recommendations.related(video, viewerId, limit);
  }

  async registerView(id: string): Promise<{ views: number }> {
    const video = await this.deps.videos.findById(id);
    if (!video) throw new NotFoundError("Видео не найдено");
    const views = await this.deps.videos.recordView(video.id);
    return { views };
  }
}
