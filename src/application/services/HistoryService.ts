import type { HistoryItemDTO } from "@/application/dto/HistoryItemDTO";
import { offsetFromCursor, pageOf, type Page } from "@/application/dto/Page";
import { VideoMapper } from "@/application/mappers/VideoMapper";
import { parseOrThrow } from "@/application/validation/parse";
import { historySchema, listQuerySchema } from "@/application/validation/schemas";
import { NotFoundError } from "@/domain/errors/NotFoundError";
import type { HistoryRepository } from "@/domain/ports/HistoryRepository";
import type { VideoRepository } from "@/domain/ports/VideoRepository";

interface HistoryServiceDeps {
  history: HistoryRepository;
  videos: VideoRepository;
}

export class HistoryService {
  constructor(private readonly deps: HistoryServiceDeps) {}

  async record(userId: string, videoId: string, input: unknown): Promise<{ positionSec: number }> {
    const { positionSec } = parseOrThrow(historySchema, input);
    const video = await this.deps.videos.findById(videoId);
    if (!video) throw new NotFoundError("Видео не найдено");
    await this.deps.history.upsert({ userId, videoId: video.id, positionSec });
    return { positionSec };
  }

  async list(userId: string, query: unknown): Promise<Page<HistoryItemDTO>> {
    const parsed = parseOrThrow(listQuerySchema, query);
    const offset = offsetFromCursor(parsed.cursor);
    const page = await this.deps.history.list({ userId, offset, limit: parsed.limit });
    return pageOf(
      page.items.map(HistoryService.toDTO),
      page.hasMore,
      offset,
      parsed.limit,
    );
  }

  async continueWatching(userId: string, limit: number): Promise<HistoryItemDTO[]> {
    const entries = await this.deps.history.listRecent(userId, limit);
    return entries
      .filter((entry) => entry.positionSec > 0)
      .map(HistoryService.toDTO);
  }

  async position(userId: string, videoId: string): Promise<number> {
    return (await this.deps.history.findPosition(userId, videoId)) ?? 0;
  }

  async remove(userId: string, videoId: string): Promise<void> {
    await this.deps.history.remove(userId, videoId);
  }

  async clear(userId: string): Promise<void> {
    await this.deps.history.clear(userId);
  }

  private static toDTO(entry: {
    video: Parameters<typeof VideoMapper.toCard>[0];
    positionSec: number;
    watchedAt: Date;
  }): HistoryItemDTO {
    return {
      video: VideoMapper.toCard(entry.video),
      positionSec: entry.positionSec,
      watchedAt: entry.watchedAt.toISOString(),
    };
  }
}
