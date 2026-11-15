import type { PublicUserDTO } from "@/application/dto/PublicUserDTO";

export interface CommentDTO {
  id: string;
  body: string;
  createdAt: string;
  author: PublicUserDTO;
}
