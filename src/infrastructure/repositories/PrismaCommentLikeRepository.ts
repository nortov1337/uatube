import type { PrismaClient } from "@prisma/client";
import type { CommentLikeRepository } from "@/domain/ports/CommentLikeRepository";

export class PrismaCommentLikeRepository implements CommentLikeRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async find(userId: string, commentId: string): Promise<boolean> {
    const row = await this.prisma.commentLike.findUnique({
      where: { userId_commentId: { userId, commentId } },
      select: { id: true },
    });
    return row !== null;
  }

  async toggle(userId: string, commentId: string): Promise<boolean> {
    const existing = await this.prisma.commentLike.findUnique({
      where: { userId_commentId: { userId, commentId } },
      select: { id: true },
    });
    if (existing) {
      await this.prisma.commentLike.delete({ where: { id: existing.id } });
      return false;
    }
    await this.prisma.commentLike.create({ data: { userId, commentId } });
    return true;
  }

  async countByComment(commentId: string): Promise<number> {
    return this.prisma.commentLike.count({ where: { commentId } });
  }

  async listLikedIds(userId: string, commentIds: readonly string[]): Promise<string[]> {
    if (commentIds.length === 0) return [];
    const rows = await this.prisma.commentLike.findMany({
      where: { userId, commentId: { in: [...commentIds] } },
      select: { commentId: true },
    });
    return rows.map((row) => row.commentId);
  }
}
