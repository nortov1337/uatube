import type { StudioVideoDTO } from "@/application/dto/StudioVideoDTO";
import type { VideoAnalyticsDTO } from "@/application/dto/VideoAnalyticsDTO";
import type { ImagePolicy } from "@/application/services/ImagePolicy";
import { TagNormalizer } from "@/application/services/TagNormalizer";
import type { UploadPolicy } from "@/application/services/UploadPolicy";
import { parseOrThrow } from "@/application/validation/parse";
import { videoMetaSchema, videoUpdateSchema } from "@/application/validation/schemas";
import { ForbiddenError } from "@/domain/errors/ForbiddenError";
import { NotFoundError } from "@/domain/errors/NotFoundError";
import type { NotificationRepository } from "@/domain/ports/NotificationRepository";
import type { SubscriptionRepository } from "@/domain/ports/SubscriptionRepository";
import type { ThumbStorage } from "@/domain/ports/ThumbStorage";
import type { VideoIdGenerator } from "@/domain/ports/VideoIdGenerator";
import type { VideoRepository } from "@/domain/ports/VideoRepository";
import type { VideoStorage } from "@/domain/ports/VideoStorage";
import type { VideoWithAuthor } from "@/domain/entities/VideoWithAuthor";

const MAX_ID_ATTEMPTS = 5;

interface StudioServiceDeps {
  videos: VideoRepository;
  storage: VideoStorage;
  thumbs: ThumbStorage;
  policy: UploadPolicy;
  imagePolicy: ImagePolicy;
  ids: VideoIdGenerator;
  subscriptions: SubscriptionRepository;
  notifications: NotificationRepository;
}

interface CreateVideoInput {
  userId: string;
  file: File;
  title: unknown;
  description: unknown;
  durationSec: unknown;
  tags: unknown;
  category: unknown;
  visibility: unknown;
  thumb: File | null;
}

export class StudioService {
  constructor(private readonly deps: StudioServiceDeps) {}

  async list(userId: string): Promise<StudioVideoDTO[]> {
    const page = await this.deps.videos.listFeed({
      authorId: userId,
      visibility: ["public", "unlisted", "private"],
      offset: 0,
      limit: 100,
    });
    return page.items.map(StudioService.toStudioDTO);
  }

  async create(input: CreateVideoInput): Promise<{ id: string }> {
    const meta = parseOrThrow(videoMetaSchema, {
      title: input.title,
      description: input.description ?? "",
      durationSec: input.durationSec ?? 0,
      tags: input.tags ?? "",
      category: input.category ?? "",
      visibility: input.visibility ?? "public",
    });
    this.deps.policy.assertValid(input.file, meta.title);

    const tags = TagNormalizer.merge(
      TagNormalizer.normalize(meta.tags),
      TagNormalizer.extract(`${meta.title} ${meta.description}`),
    );
    const videoId = await this.nextId();
    const fileName = await this.deps.storage.save(
      videoId,
      input.file.type,
      new Uint8Array(await input.file.arrayBuffer()),
    );
    let thumbName: string | null = null;

    try {
      if (input.thumb) {
        thumbName = await this.deps.thumbs.save(
          videoId,
          new Uint8Array(await input.thumb.arrayBuffer()),
        );
      }
      const created = await this.deps.videos.create({
        id: videoId,
        title: meta.title,
        description: meta.description,
        tags,
        category: meta.category,
        visibility: meta.visibility,
        fileName,
        mimeType: input.file.type,
        sizeBytes: input.file.size,
        durationSec: meta.durationSec,
        thumbName,
        authorId: input.userId,
      });
      await this.notifySubscribers(created);
      return { id: created.id };
    } catch (error) {
      await this.deps.storage.remove(fileName);
      if (thumbName) await this.deps.thumbs.remove(thumbName);
      throw error;
    }
  }

  async update(videoId: string, userId: string, input: unknown): Promise<StudioVideoDTO> {
    const video = await this.requireOwned(videoId, userId);
    const data = parseOrThrow(videoUpdateSchema, input);
    const tags = TagNormalizer.merge(
      TagNormalizer.normalize(data.tags),
      TagNormalizer.extract(`${data.title} ${data.description}`),
    );
    const updated = await this.deps.videos.update(video.id, {
      title: data.title,
      description: data.description,
      tags,
      category: data.category,
      visibility: data.visibility,
    });
    return StudioService.toStudioDTO(updated);
  }

  async setThumb(videoId: string, userId: string, file: File): Promise<{ thumbUrl: string }> {
    const video = await this.requireOwned(videoId, userId);
    this.deps.imagePolicy.assertJpeg(file);
    const thumbName = await this.deps.thumbs.save(
      video.id,
      new Uint8Array(await file.arrayBuffer()),
    );
    await this.deps.videos.update(video.id, { thumbName });
    return { thumbUrl: `/api/thumb/${video.id}?v=${Date.now()}` };
  }

  async remove(videoId: string, userId: string): Promise<void> {
    const video = await this.requireOwned(videoId, userId);
    await this.deps.storage.remove(video.fileName);
    if (video.thumbName) await this.deps.thumbs.remove(video.thumbName);
    await this.deps.videos.remove(video.id);
  }

  async get(videoId: string, userId: string): Promise<StudioVideoDTO> {
    return StudioService.toStudioDTO(await this.requireOwned(videoId, userId));
  }

  async analytics(videoId: string, userId: string, days: number): Promise<VideoAnalyticsDTO> {
    const video = await this.requireOwned(videoId, userId);
    const analytics = await this.deps.videos.analytics(video.id, days);
    return {
      days: [...analytics.days],
      totalViews: analytics.totalViews,
      likes: analytics.likes,
      comments: analytics.comments,
    };
  }

  async topTags(userId: string): Promise<string[]> {
    return (await this.deps.videos.tagsByAuthor(userId)).slice(0, 12);
  }

  private async requireOwned(videoId: string, userId: string): Promise<VideoWithAuthor> {
    const video = await this.deps.videos.findById(videoId);
    if (!video) throw new NotFoundError("Видео не найдено");
    if (video.authorId !== userId) throw new ForbiddenError("Это видео вам не принадлежит");
    return video;
  }

  private async nextId(): Promise<string> {
    for (let attempt = 0; attempt < MAX_ID_ATTEMPTS; attempt += 1) {
      const id = this.deps.ids.generate();
      if (!(await this.deps.videos.findById(id))) return id;
    }
    throw new Error("Не удалось сгенерировать id видео");
  }

  private async notifySubscribers(video: VideoWithAuthor): Promise<void> {
    const subscriberIds = await this.deps.subscriptions.listSubscriberIds(video.authorId);
    await this.deps.notifications.createMany(
      subscriberIds.map((userId) => ({
        userId,
        kind: "new_video",
        actorHandle: video.author.handle,
        actorName: video.author.name,
        videoId: video.id,
        body: video.title,
      })),
    );
  }

  private static toStudioDTO(video: VideoWithAuthor): StudioVideoDTO {
    return {
      id: video.id,
      title: video.title,
      description: video.description,
      visibility: video.visibility,
      views: video.views,
      likes: video.likesCount,
      comments: video.commentsCount,
      thumbUrl: video.thumbName ? `/api/thumb/${video.id}` : null,
      durationSec: video.durationSec,
      createdAt: video.createdAt.toISOString(),
      updatedAt: video.updatedAt.toISOString(),
      tags: [...video.tags],
      category: video.category,
    };
  }
}
