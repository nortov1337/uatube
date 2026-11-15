import type { PrismaClient } from "@prisma/client";
import type { LikeRepository } from "@/domain/ports/LikeRepository";

export class PrismaLikeRepository implements LikeRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async find(userId: string, videoId: string): Promise<boolean> {
    const row = await this.prisma.like.findUnique({
      where: { userId_videoId: { userId, videoId } },
      select: { id: true },
    });
    return row !== null;
  }

  async toggle(userId: string, videoId: string): Promise<boolean> {
    const existing = await this.prisma.like.findUnique({
      where: { userId_videoId: { userId, videoId } },
      select: { id: true },
    });
    if (existing) {
      await this.prisma.like.delete({ where: { id: existing.id } });
      return false;
    }
    await this.prisma.like.create({ data: { userId, videoId } });
    return true;
  }

  async countByVideo(videoId: string): Promise<number> {
    return this.prisma.like.count({ where: { videoId } });
  }
}
