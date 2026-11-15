import type { Prisma, PrismaClient } from "@prisma/client";
import type {
  PlaylistEntity,
  PlaylistItemEntity,
  PlaylistWithOwner,
} from "@/domain/entities/PlaylistEntity";
import type { NewPlaylistData, PlaylistRepository } from "@/domain/ports/PlaylistRepository";
import { PrismaUserMapper } from "@/infrastructure/repositories/mappers/PrismaUserMapper";
import { PrismaVideoMapper } from "@/infrastructure/repositories/mappers/PrismaVideoMapper";

const OWNER_INCLUDE = {
  owner: true,
  _count: { select: { items: true } },
  items: {
    where: { video: { visibility: { not: "private" } } },
    orderBy: { position: "asc" },
    take: 1,
    select: { videoId: true },
  },
} as const;

const ITEM_INCLUDE = {
  video: { include: { author: true, _count: { select: { likes: true, comments: true } } } },
} as const;

type PrismaPlaylistWithOwner = Prisma.PlaylistGetPayload<{ include: typeof OWNER_INCLUDE }>;

export class PrismaPlaylistRepository implements PlaylistRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(data: NewPlaylistData): Promise<PlaylistEntity> {
    const row = await this.prisma.playlist.create({ data });
    return this.toEntity(row);
  }

  async findById(id: string): Promise<PlaylistWithOwner | null> {
    const row = await this.prisma.playlist.findUnique({ where: { id }, include: OWNER_INCLUDE });
    return row ? this.toWithOwner(row as PrismaPlaylistWithOwner) : null;
  }

  async findWatchLater(ownerId: string): Promise<PlaylistEntity | null> {
    const row = await this.prisma.playlist.findFirst({
      where: { ownerId, kind: "watch_later" },
    });
    return row ? this.toEntity(row) : null;
  }

  async listByOwner(ownerId: string): Promise<PlaylistWithOwner[]> {
    const rows = await this.prisma.playlist.findMany({
      where: { ownerId },
      orderBy: [{ kind: "asc" }, { createdAt: "desc" }],
      include: OWNER_INCLUDE,
    });
    return rows.map((row) => this.toWithOwner(row as PrismaPlaylistWithOwner));
  }

  async listByVideo(ownerId: string, videoId: string): Promise<PlaylistEntity[]> {
    const rows = await this.prisma.playlist.findMany({
      where: { ownerId, items: { some: { videoId } } },
      orderBy: { createdAt: "desc" },
    });
    return rows.map((row) => this.toEntity(row));
  }

  async update(
    id: string,
    data: Partial<Pick<PlaylistEntity, "title" | "description" | "visibility">>,
  ): Promise<PlaylistEntity> {
    const row = await this.prisma.playlist.update({ where: { id }, data });
    return this.toEntity(row);
  }

  async remove(id: string): Promise<void> {
    await this.prisma.playlist.delete({ where: { id } });
  }

  async listItems(playlistId: string): Promise<PlaylistItemEntity[]> {
    const rows = await this.prisma.playlistItem.findMany({
      where: { playlistId },
      orderBy: [{ position: "asc" }, { addedAt: "asc" }],
      include: ITEM_INCLUDE,
    });
    return rows.map((row) => ({
      id: row.id,
      playlistId: row.playlistId,
      videoId: row.videoId,
      position: row.position,
      addedAt: row.addedAt,
      video: PrismaVideoMapper.toDomain(row.video),
    }));
  }

  async hasItem(playlistId: string, videoId: string): Promise<boolean> {
    const row = await this.prisma.playlistItem.findUnique({
      where: { playlistId_videoId: { playlistId, videoId } },
      select: { id: true },
    });
    return row !== null;
  }

  async addItem(playlistId: string, videoId: string): Promise<void> {
    const last = await this.prisma.playlistItem.findFirst({
      where: { playlistId },
      orderBy: { position: "desc" },
      select: { position: true },
    });
    await this.prisma.playlistItem.upsert({
      where: { playlistId_videoId: { playlistId, videoId } },
      create: { playlistId, videoId, position: (last?.position ?? -1) + 1 },
      update: {},
    });
  }

  async removeItem(playlistId: string, videoId: string): Promise<void> {
    await this.prisma.playlistItem.deleteMany({ where: { playlistId, videoId } });
  }

  async reorder(playlistId: string, videoIds: readonly string[]): Promise<void> {
    await this.prisma.$transaction(
      videoIds.map((videoId, position) =>
        this.prisma.playlistItem.updateMany({
          where: { playlistId, videoId },
          data: { position },
        }),
      ),
    );
  }

  private toEntity(row: {
    id: string;
    title: string;
    description: string;
    visibility: string;
    kind: string;
    ownerId: string;
    createdAt: Date;
    updatedAt: Date;
  }): PlaylistEntity {
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      visibility: row.visibility,
      kind: row.kind,
      ownerId: row.ownerId,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  private toWithOwner(row: PrismaPlaylistWithOwner): PlaylistWithOwner {
    return {
      ...this.toEntity(row),
      owner: PrismaUserMapper.toDomain(row.owner),
      itemsCount: row._count.items,
      coverVideoId: row.items[0]?.videoId ?? null,
    };
  }
}
