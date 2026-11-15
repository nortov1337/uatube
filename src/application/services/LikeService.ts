import { NotFoundError } from "@/domain/errors/NotFoundError";
import type { LikeRepository } from "@/domain/ports/LikeRepository";
import type { VideoRepository } from "@/domain/ports/VideoRepository";

interface LikeServiceDeps {
  likes: LikeRepository;
  videos: VideoRepository;
}

export class LikeService {
  constructor(private readonly deps: LikeServiceDeps) {}

  async toggle(videoId: string, userId: string): Promise<{ liked: boolean; likes: number }> {
    const video = await this.deps.videos.findById(videoId);
    if (!video) throw new NotFoundError("Видео не найдено");

    const liked = await this.deps.likes.toggle(userId, video.id);
    const likes = await this.deps.likes.countByVideo(video.id);
    return { liked, likes };
  }
}
