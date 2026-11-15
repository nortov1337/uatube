import type { VideoCardDTO } from "@/application/dto/VideoCardDTO";

export interface HistoryItemDTO {
  video: VideoCardDTO;
  positionSec: number;
  watchedAt: string;
}
