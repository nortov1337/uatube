import type { CommentDTO } from "@/application/dto/CommentDTO";
import type { Page } from "@/application/dto/Page";
import { CommentMapper } from "@/application/mappers/CommentMapper";
import { commentSchema, listQuerySchema } from "@/application/validation/schemas";
import { parseOrThrow } from "@/application/validation/parse";
import { ForbiddenError } from "@/domain/errors/ForbiddenError";
import { NotFoundError } from "@/domain/errors/NotFoundError";
import type { CommentRepository } from "@/domain/ports/CommentRepository";
import type { VideoRepository } from "@/domain/ports/VideoRepository";

interface CommentServiceDeps {
  comments: CommentRepository;
  videos: VideoRepository;
}

export class CommentService {
  constructor(private readonly deps: CommentServiceDeps) {}

  async list(videoId: string, query: unknown): Promise<Page<CommentDTO>> {
    const video = await this.deps.videos.findById(videoId);
    if (!video) throw new NotFoundError("Видео не найдено");

    const { cursor, limit } = parseOrThrow(listQuerySchema, query);
    const page = await this.deps.comments.list({ videoId: video.id, cursor, limit });
    return { items: page.items.map(CommentMapper.toDTO), nextCursor: page.nextCursor };
  }

  async create(videoId: string, userId: string, input: unknown): Promise<CommentDTO> {
    const video = await this.deps.videos.findById(videoId);
    if (!video) throw new NotFoundError("Видео не найдено");

    const { body } = parseOrThrow(commentSchema, input);
    const comment = await this.deps.comments.create({ body, userId, videoId: video.id });
    return CommentMapper.toDTO(comment);
  }

  async remove(commentId: string, userId: string): Promise<void> {
    const comment = await this.deps.comments.findById(commentId);
    if (!comment) throw new NotFoundError("Комментарий не найден");

    const video = await this.deps.videos.findById(comment.videoId);
    if (!video) throw new NotFoundError("Видео не найдено");

    if (comment.userId !== userId && video.authorId !== userId) {
      throw new ForbiddenError("Удалять комментарий может только его автор или автор видео");
    }
    await this.deps.comments.remove(comment.id);
  }
}
