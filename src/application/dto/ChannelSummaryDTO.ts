import type { PublicUserDTO } from "@/application/dto/PublicUserDTO";

export interface ChannelSummaryDTO extends PublicUserDTO {
  subscribers: number;
}
