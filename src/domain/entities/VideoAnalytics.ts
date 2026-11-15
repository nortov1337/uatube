export interface VideoAnalytics {
  readonly days: ReadonlyArray<{ date: string; views: number }>;
  readonly totalViews: number;
  readonly likes: number;
  readonly comments: number;
}
