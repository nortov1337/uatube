export interface CommentLikeRepository {
  find(userId: string, commentId: string): Promise<boolean>;
  toggle(userId: string, commentId: string): Promise<boolean>;
  countByComment(commentId: string): Promise<number>;
  listLikedIds(userId: string, commentIds: readonly string[]): Promise<string[]>;
}
