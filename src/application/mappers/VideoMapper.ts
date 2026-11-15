import type { VideoCardDTO } from "@/application/dto/VideoCardDTO";
import type { VideoDetailsDTO } from "@/application/dto/VideoDetailsDTO";
import { UserMapper } from "@/application/mappers/UserMapper";
import type { VideoWithAuthor } from "@/domain/entities/VideoWithAuthor";

export class VideoMapper {
  static toCard(video: VideoWithAuthor): VideoCardDTO {
    return {
      id: video.id,
      title: video.title,
      thumbUrl: video.thumbName ? `/api/thumb/${video.id}` : null,
      durationSec: video.durationSec,
      views: video.views,
      createdAt: video.createdAt.toISOString(),
      author: UserMapper.toPublic(video.author),
      likesCount: video.likesCount,
    };
  }

  static toDetails(video: VideoWithAuthor, likedByMe: boolean): VideoDetailsDTO {
    return {
      ...VideoMapper.toCard(video),
      description: video.description,
      mimeType: video.mimeType,
      sizeBytes: video.sizeBytes,
      likedByMe,
    };
  }
}
