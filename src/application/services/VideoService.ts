import type { Page } from "@/application/dto/Page";
import type { VideoCardDTO } from "@/application/dto/VideoCardDTO";
import type { VideoDetailsDTO } from "@/application/dto/VideoDetailsDTO";
import { VideoMapper } from "@/application/mappers/VideoMapper";
import type { UploadPolicy } from "@/application/services/UploadPolicy";
import { listQuerySchema, videoMetaSchema } from "@/application/validation/schemas";
import { parseOrThrow } from "@/application/validation/parse";
import { ForbiddenError } from "@/domain/errors/ForbiddenError";
import { NotFoundError } from "@/domain/errors/NotFoundError";
import type { LikeRepository } from "@/domain/ports/LikeRepository";
import type { ThumbStorage } from "@/domain/ports/ThumbStorage";
import type { VideoRepository } from "@/domain/ports/VideoRepository";
import type { VideoStorage } from "@/domain/ports/VideoStorage";

interface VideoServiceDeps {
  videos: VideoRepository;
  likes: LikeRepository;
  storage: VideoStorage;
  thumbs: ThumbStorage;
  policy: UploadPolicy;
}

interface CreateVideoInput {
  userId: string;
  file: File;
  title: unknown;
  description: unknown;
  durationSec: unknown;
  thumb: File | null;
}

export class VideoService {
  constructor(private readonly deps: VideoServiceDeps) {}

  async listFeed(query: unknown): Promise<Page<VideoCardDTO>> {
    const { q, cursor, limit } = parseOrThrow(listQuerySchema, query);
    const page = await this.deps.videos.listFeed({
      q: q || undefined,
      cursor,
      limit,
    });
    return {
      items: page.items.map(VideoMapper.toCard),
      nextCursor: page.nextCursor,
    };
  }

  async getDetails(id: string, viewerId: string | null): Promise<VideoDetailsDTO> {
    const video = await this.deps.videos.findById(id);
    if (!video) throw new NotFoundError("Видео не найдено");
    const likedByMe = viewerId ? await this.deps.likes.find(viewerId, video.id) : false;
    return VideoMapper.toDetails(video, likedByMe);
  }

  async listRelated(id: string, limit: number): Promise<VideoCardDTO[]> {
    const video = await this.deps.videos.findById(id);
    if (!video) throw new NotFoundError("Видео не найдено");
    const related = await this.deps.videos.listRelated({ video, limit });
    return related.map(VideoMapper.toCard);
  }

  async create(input: CreateVideoInput): Promise<{ id: string }> {
    const meta = parseOrThrow(videoMetaSchema, {
      title: input.title,
      description: input.description ?? "",
      durationSec: input.durationSec ?? 0,
    });
    this.deps.policy.assertValid(input.file, meta.title);

    const videoId = crypto.randomUUID();
    const bytes = new Uint8Array(await input.file.arrayBuffer());
    const fileName = await this.deps.storage.save(videoId, input.file.type, bytes);
    let thumbName: string | null = null;

    try {
      if (input.thumb) {
        thumbName = await this.deps.thumbs.save(
          videoId,
          new Uint8Array(await input.thumb.arrayBuffer()),
        );
      }
      const created = await this.deps.videos.create({
        title: meta.title,
        description: meta.description,
        fileName,
        mimeType: input.file.type,
        sizeBytes: input.file.size,
        durationSec: meta.durationSec,
        thumbName,
        authorId: input.userId,
      });
      return { id: created.id };
    } catch (error) {
      await this.deps.storage.remove(fileName);
      if (thumbName) await this.deps.thumbs.remove(thumbName);
      throw error;
    }
  }

  async remove(id: string, userId: string): Promise<void> {
    const video = await this.deps.videos.findById(id);
    if (!video) throw new NotFoundError("Видео не найдено");
    if (video.authorId !== userId) throw new ForbiddenError("Удалять видео может только автор");

    await this.deps.storage.remove(video.fileName);
    if (video.thumbName) await this.deps.thumbs.remove(video.thumbName);
    await this.deps.videos.remove(video.id);
  }

  async registerView(id: string): Promise<{ views: number }> {
    const video = await this.deps.videos.findById(id);
    if (!video) throw new NotFoundError("Видео не найдено");
    const views = await this.deps.videos.incrementViews(video.id);
    return { views };
  }
}
