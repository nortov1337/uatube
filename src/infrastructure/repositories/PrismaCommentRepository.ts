import type { PrismaClient } from "@prisma/client";
import type { CommentEntity } from "@/domain/entities/CommentEntity";
import type { CommentRepository } from "@/domain/ports/CommentRepository";
import { PrismaCommentMapper } from "@/infrastructure/repositories/mappers/PrismaCommentMapper";

const INCLUDE = { user: true } as const;

export class PrismaCommentRepository implements CommentRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async list(params: {
    videoId: string;
    cursor?: string;
    limit: number;
  }): Promise<{ items: CommentEntity[]; nextCursor: string | null }> {
    const rows = await this.prisma.comment.findMany({
      where: { videoId: params.videoId },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: params.limit + 1,
      ...(params.cursor ? { cursor: { id: params.cursor }, skip: 1 } : {}),
      include: INCLUDE,
    });

    const hasMore = rows.length > params.limit;
    const items = (hasMore ? rows.slice(0, params.limit) : rows).map(PrismaCommentMapper.toDomain);
    return { items, nextCursor: hasMore ? items[items.length - 1].id : null };
  }

  async countByVideo(videoId: string): Promise<number> {
    return this.prisma.comment.count({ where: { videoId } });
  }

  async create(data: { body: string; userId: string; videoId: string }): Promise<CommentEntity> {
    const row = await this.prisma.comment.create({ data, include: INCLUDE });
    return PrismaCommentMapper.toDomain(row);
  }

  async findById(id: string): Promise<CommentEntity | null> {
    const row = await this.prisma.comment.findUnique({ where: { id }, include: INCLUDE });
    return row ? PrismaCommentMapper.toDomain(row) : null;
  }

  async remove(id: string): Promise<void> {
    await this.prisma.comment.delete({ where: { id } });
  }
}
