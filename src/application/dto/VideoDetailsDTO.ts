import type { VideoCardDTO } from "@/application/dto/VideoCardDTO";

export interface VideoDetailsDTO extends VideoCardDTO {
  description: string;
  mimeType: string;
  likedByMe: boolean;
  visibility: string;
  commentsCount: number;
}
