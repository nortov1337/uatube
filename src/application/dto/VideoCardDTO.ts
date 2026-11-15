import type { PublicUserDTO } from "@/application/dto/PublicUserDTO";

export interface VideoCardDTO {
  id: string;
  title: string;
  thumbUrl: string | null;
  durationSec: number;
  views: number;
  createdAt: string;
  author: PublicUserDTO;
  likesCount: number;
}
