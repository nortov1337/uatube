import type { PublicUserDTO } from "@/application/dto/PublicUserDTO";

export interface CommentDTO {
  id: string;
  body: string;
  createdAt: string;
  updatedAt: string;
  parentId: string | null;
  author: PublicUserDTO;
  likesCount: number;
  likedByMe: boolean;
  repliesCount: number;
}
