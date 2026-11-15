export interface VideoStorage {
  save(videoId: string, mime: string, data: Uint8Array): Promise<string>;
  remove(fileName: string): Promise<void>;
  open(
    fileName: string,
    range: { start: number; end: number } | null,
  ): Promise<{ stream: ReadableStream; size: number }>;
  size(fileName: string): Promise<number | null>;
}
