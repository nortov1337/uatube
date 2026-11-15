import type { PublicUserDTO } from "@/application/dto/PublicUserDTO";
import type { VideoCardDTO } from "@/application/dto/VideoCardDTO";

export interface PlaylistDTO {
  id: string;
  title: string;
  description: string;
  visibility: string;
  kind: string;
  itemsCount: number;
  coverUrl: string | null;
  owner: PublicUserDTO;
  createdAt: string;
  updatedAt: string;
}

export interface PlaylistDetailsDTO extends PlaylistDTO {
  items: VideoCardDTO[];
  isOwner: boolean;
}
