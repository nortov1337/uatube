export type VideoVisibility = "public" | "unlisted" | "private";

export type VideoSort = "new" | "views" | "likes";

export function canViewVideo(
  visibility: VideoVisibility,
  authorId: string,
  viewerId: string | null,
): boolean {
  return visibility !== "private" || authorId === viewerId;
}
