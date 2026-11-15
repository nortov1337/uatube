import type { CommentDTO } from "@/application/dto/CommentDTO";
import { offsetFromCursor, pageOf, type Page } from "@/application/dto/Page";
import { CommentMapper } from "@/application/mappers/CommentMapper";
import { parseOrThrow } from "@/application/validation/parse";
import {
  commentListQuerySchema,
  commentSchema,
  commentUpdateSchema,
} from "@/application/validation/schemas";
import type { CommentEntity } from "@/domain/entities/CommentEntity";
import { ForbiddenError } from "@/domain/errors/ForbiddenError";
import { NotFoundError } from "@/domain/errors/NotFoundError";
import { ValidationError } from "@/domain/errors/ValidationError";
import type { CommentLikeRepository } from "@/domain/ports/CommentLikeRepository";
import type { CommentRepository } from "@/domain/ports/CommentRepository";
import type { NotificationRepository } from "@/domain/ports/NotificationRepository";
import type { VideoRepository } from "@/domain/ports/VideoRepository";
import { canViewVideo } from "@/domain/values/VideoVisibility";

interface CommentServiceDeps {
  comments: CommentRepository;
  commentLikes: CommentLikeRepository;
  videos: VideoRepository;
  notifications: NotificationRepository;
}

export class CommentService {
  constructor(private readonly deps: CommentServiceDeps) {}

  async list(videoId: string, query: unknown, viewerId: string | null): Promise<Page<CommentDTO>> {
    const video = await this.deps.videos.findById(videoId);
    if (!video || !canViewVideo(video.visibility, video.authorId, viewerId)) {
      throw new NotFoundError("Видео не найдено");
    }

    const parsed = parseOrThrow(commentListQuerySchema, query);
    const offset = offsetFromCursor(parsed.cursor);
    const page = await this.deps.comments.listTopLevel({
      videoId: video.id,
      sort: parsed.sort,
      offset,
      limit: parsed.limit,
    });
    return pageOf(
      await this.withLikes(page.items, viewerId),
      page.hasMore,
      offset,
      parsed.limit,
    );
  }

  async replies(commentId: string, query: unknown, viewerId: string | null): Promise<Page<CommentDTO>> {
    const comment = await this.deps.comments.findById(commentId);
    if (!comment) throw new NotFoundError("Комментарий не найден");

    const video = await this.deps.videos.findById(comment.videoId);
    if (!video || !canViewVideo(video.visibility, video.authorId, viewerId)) {
      throw new NotFoundError("Комментарий не найден");
    }

    const parsed = parseOrThrow(commentListQuerySchema, query);
    const offset = offsetFromCursor(parsed.cursor);
    const page = await this.deps.comments.listReplies({
      parentId: comment.id,
      offset,
      limit: parsed.limit,
    });
    return pageOf(
      await this.withLikes(page.items, viewerId),
      page.hasMore,
      offset,
      parsed.limit,
    );
  }

  async create(videoId: string, userId: string, input: unknown): Promise<CommentDTO> {
    const video = await this.deps.videos.findById(videoId);
    if (!video || !canViewVideo(video.visibility, video.authorId, userId)) {
      throw new NotFoundError("Видео не найдено");
    }

    const data = parseOrThrow(commentSchema, input);
    const parent = data.parentId ? await this.deps.comments.findById(data.parentId) : null;
    if (data.parentId && !parent) throw new NotFoundError("Комментарий не найден");
    if (parent && parent.videoId !== video.id) {
      throw new ValidationError("Ответ должен быть к комментарию этого видео");
    }

    const comment = await this.deps.comments.create({
      body: data.body,
      userId,
      videoId: video.id,
      parentId: parent ? (parent.parentId ?? parent.id) : null,
    });

    if (parent && parent.userId !== userId) {
      await this.deps.notifications.createMany([
        {
          userId: parent.userId,
          kind: "comment_reply",
          actorHandle: comment.author.handle,
          actorName: comment.author.name,
          videoId: video.id,
          body: comment.body.slice(0, 120),
        },
      ]);
    }

    return CommentMapper.toDTO(comment, false);
  }

  async update(commentId: string, userId: string, input: unknown): Promise<CommentDTO> {
    const comment = await this.deps.comments.findById(commentId);
    if (!comment) throw new NotFoundError("Комментарий не найден");
    if (comment.userId !== userId) throw new ForbiddenError("Можно править только свой комментарий");

    const { body } = parseOrThrow(commentUpdateSchema, input);
    const updated = await this.deps.comments.update(comment.id, body);
    return CommentMapper.toDTO(updated, false);
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

  async toggleLike(commentId: string, userId: string): Promise<{ liked: boolean; likes: number }> {
    const comment = await this.deps.comments.findById(commentId);
    if (!comment) throw new NotFoundError("Комментарий не найден");

    const liked = await this.deps.commentLikes.toggle(userId, comment.id);
    const likes = await this.deps.commentLikes.countByComment(comment.id);
    return { liked, likes };
  }

  private async withLikes(
    comments: readonly CommentEntity[],
    viewerId: string | null,
  ): Promise<CommentDTO[]> {
    if (!viewerId) return comments.map((comment) => CommentMapper.toDTO(comment, false));
    const likedIds = new Set(
      await this.deps.commentLikes.listLikedIds(
        viewerId,
        comments.map((comment) => comment.id),
      ),
    );
    return comments.map((comment) => CommentMapper.toDTO(comment, likedIds.has(comment.id)));
  }
}
