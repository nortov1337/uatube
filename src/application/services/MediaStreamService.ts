import { NotFoundError } from "@/domain/errors/NotFoundError";
import type { ImageStorage } from "@/domain/ports/ImageStorage";
import type { ThumbStorage } from "@/domain/ports/ThumbStorage";
import type { UserRepository } from "@/domain/ports/UserRepository";
import type { VideoRepository } from "@/domain/ports/VideoRepository";
import type { VideoStorage } from "@/domain/ports/VideoStorage";
import { parseRange } from "@/infrastructure/http/RangeParser";

interface MediaStreamServiceDeps {
  videos: VideoRepository;
  users: UserRepository;
  storage: VideoStorage;
  thumbs: ThumbStorage;
  images: ImageStorage;
}

export interface VideoStream {
  stream: ReadableStream;
  size: number;
  start: number;
  end: number;
  partial: boolean;
  mimeType: string;
}

export class MediaStreamService {
  constructor(private readonly deps: MediaStreamServiceDeps) {}

  async openVideo(id: string, rangeHeader: string | null): Promise<VideoStream> {
    const video = await this.deps.videos.findById(id);
    if (!video) throw new NotFoundError("Видео не найдено");

    const size = await this.deps.storage.size(video.fileName);
    if (size === null) throw new NotFoundError("Файл видео не найден");

    const range = parseRange(rangeHeader, size);
    if (range === "invalid") {
      throw new NotFoundError("Запрошенный диапазон недоступен");
    }

    const start = range ? range.start : 0;
    const end = range ? range.end : size - 1;
    const opened = await this.deps.storage.open(video.fileName, range);

    return {
      stream: opened.stream,
      size: opened.size,
      start,
      end,
      partial: range !== null,
      mimeType: video.mimeType,
    };
  }

  async openThumb(id: string): Promise<{ data: Uint8Array } | null> {
    const video = await this.deps.videos.findById(id);
    if (!video || !video.thumbName) return null;
    const data = await this.deps.thumbs.read(video.thumbName);
    return data ? { data } : null;
  }

  async openAvatar(handle: string): Promise<{ data: Uint8Array } | null> {
    return this.openImage(handle, "avatar");
  }

  async openBanner(handle: string): Promise<{ data: Uint8Array } | null> {
    return this.openImage(handle, "banner");
  }

  private async openImage(
    handle: string,
    kind: "avatar" | "banner",
  ): Promise<{ data: Uint8Array } | null> {
    const user = await this.deps.users.findByHandle(handle);
    if (!user) return null;
    const name = kind === "avatar" ? user.avatarName : user.bannerName;
    if (!name) return null;
    const data = await this.deps.images.read(name);
    return data ? { data } : null;
  }
}
