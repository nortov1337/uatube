import type { VideoWithAuthor } from "@/domain/entities/VideoWithAuthor";

export interface HistoryEntry {
  readonly video: VideoWithAuthor;
  readonly positionSec: number;
  readonly watchedAt: Date;
}
