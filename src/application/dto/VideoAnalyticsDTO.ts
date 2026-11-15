export interface VideoAnalyticsDTO {
  days: Array<{ date: string; views: number }>;
  totalViews: number;
  likes: number;
  comments: number;
}
