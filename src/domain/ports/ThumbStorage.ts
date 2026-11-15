export interface ThumbStorage {
  save(videoId: string, jpeg: Uint8Array): Promise<string>;
  remove(thumbName: string): Promise<void>;
  path(thumbName: string): string;
  read(thumbName: string): Promise<Uint8Array | null>;
}
