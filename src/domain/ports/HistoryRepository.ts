import type { HistoryEntry } from "@/domain/entities/HistoryEntry";

export interface HistoryRepository {
  upsert(data: { userId: string; videoId: string; positionSec: number }): Promise<void>;
  findPosition(userId: string, videoId: string): Promise<number | null>;
  list(params: {
    userId: string;
    offset: number;
    limit: number;
  }): Promise<{ items: HistoryEntry[]; hasMore: boolean }>;
  listRecent(userId: string, limit: number): Promise<HistoryEntry[]>;
  remove(userId: string, videoId: string): Promise<void>;
  clear(userId: string): Promise<void>;
}
