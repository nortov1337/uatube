export interface VideoEntity {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly fileName: string;
  readonly mimeType: string;
  readonly sizeBytes: number;
  readonly durationSec: number;
  readonly thumbName: string | null;
  readonly views: number;
  readonly createdAt: Date;
  readonly authorId: string;
}
