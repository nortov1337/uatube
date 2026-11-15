import type { VideoVisibility } from "@/domain/values/VideoVisibility";

export interface VideoEntity {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly tags: readonly string[];
  readonly category: string;
  readonly visibility: VideoVisibility;
  readonly fileName: string;
  readonly mimeType: string;
  readonly sizeBytes: number;
  readonly durationSec: number;
  readonly thumbName: string | null;
  readonly views: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly authorId: string;
}
