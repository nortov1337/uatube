export interface LikeRepository {
  find(userId: string, videoId: string): Promise<boolean>;
  toggle(userId: string, videoId: string): Promise<boolean>;
  countByVideo(videoId: string): Promise<number>;
}
