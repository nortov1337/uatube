import type { PrismaClient } from "@prisma/client";
import type { CommentEntity } from "@/domain/entities/CommentEntity";
import type { CommentRepository, CommentSort } from "@/domain/ports/CommentRepository";
import { PrismaCommentMapper } from "@/infrastructure/repositories/mappers/PrismaCommentMapper";

const INCLUDE = {
  user: true,
  _count: { select: { likes: true, replies: true } },
} as const;

const ORDER: Record<CommentSort, object[]> = {
  new: [{ createdAt: "desc" }, { id: "desc" }],
  top: [{ likes: { _count: "desc" } }, { createdAt: "desc" }],
};

export class PrismaCommentRepository implements CommentRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async listTopLevel(params: {
    videoId: string;
    sort: CommentSort;
    offset: number;
    limit: number;
  }): Promise<{ items: CommentEntity[]; hasMore: boolean }> {
    const rows = await this.prisma.comment.findMany({
      where: { videoId: params.videoId, parentId: null },
      orderBy: ORDER[params.sort],
      skip: params.offset,
      take: params.limit + 1,
      include: INCLUDE,
    });
    const hasMore = rows.length > params.limit;
    const items = (hasMore ? rows.slice(0, params.limit) : rows).map(PrismaCommentMapper.toDomain);
    return { items, hasMore };
  }

  async listReplies(params: {
    parentId: string;
    offset: number;
    limit: number;
  }): Promise<{ items: CommentEntity[]; hasMore: boolean }> {
    const rows = await this.prisma.comment.findMany({
      where: { parentId: params.parentId },
      orderBy: [{ createdAt: "asc" }, { id: "asc" }],
      skip: params.offset,
      take: params.limit + 1,
      include: INCLUDE,
    });
    const hasMore = rows.length > params.limit;
    const items = (hasMore ? rows.slice(0, params.limit) : rows).map(PrismaCommentMapper.toDomain);
    return { items, hasMore };
  }

  async countByVideo(videoId: string): Promise<number> {
    return this.prisma.comment.count({ where: { videoId } });
  }

  async create(data: {
    body: string;
    userId: string;
    videoId: string;
    parentId: string | null;
  }): Promise<CommentEntity> {
    const row = await this.prisma.comment.create({ data, include: INCLUDE });
    return PrismaCommentMapper.toDomain(row);
  }

  async findById(id: string): Promise<CommentEntity | null> {
    const row = await this.prisma.comment.findUnique({ where: { id }, include: INCLUDE });
    return row ? PrismaCommentMapper.toDomain(row) : null;
  }

  async update(id: string, body: string): Promise<CommentEntity> {
    const row = await this.prisma.comment.update({
      where: { id },
      data: { body },
      include: INCLUDE,
    });
    return PrismaCommentMapper.toDomain(row);
  }

  async remove(id: string): Promise<void> {
    await this.prisma.comment.delete({ where: { id } });
  }
}
