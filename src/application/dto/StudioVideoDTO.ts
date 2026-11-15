export interface StudioVideoDTO {
  id: string;
  title: string;
  description: string;
  visibility: string;
  views: number;
  likes: number;
  comments: number;
  thumbUrl: string | null;
  durationSec: number;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  category: string;
}
