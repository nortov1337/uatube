import type { VideoCardDTO } from "@/application/dto/VideoCardDTO";

export interface VideoDetailsDTO extends VideoCardDTO {
  description: string;
  mimeType: string;
  sizeBytes: number;
  likedByMe: boolean;
  visibility: string;
  commentsCount: number;
}
