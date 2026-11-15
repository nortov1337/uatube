import { createReadStream } from "node:fs";
import { mkdir, rm, stat, writeFile } from "node:fs/promises";
import { Readable } from "node:stream";
import type { VideoStorage } from "@/domain/ports/VideoStorage";
import type { LocalFilePaths } from "@/infrastructure/storage/LocalFilePaths";

const EXTENSIONS: Record<string, "mp4" | "webm"> = {
  "video/mp4": "mp4",
  "video/webm": "webm",
};

export class LocalVideoStorage implements VideoStorage {
  constructor(private readonly paths: LocalFilePaths) {}

  async save(videoId: string, mime: string, data: Uint8Array): Promise<string> {
    const extension = EXTENSIONS[mime];
    if (!extension) throw new Error("Неподдерживаемый тип видео");
    const fileName = this.paths.videoFileName(videoId, extension);
    await mkdir(this.paths.root, { recursive: true });
    await writeFile(this.paths.videoPath(fileName), data);
    return fileName;
  }

  async remove(fileName: string): Promise<void> {
    await rm(this.paths.videoPath(fileName), { force: true });
  }

  async open(
    fileName: string,
    range: { start: number; end: number } | null,
  ): Promise<{ stream: ReadableStream; size: number }> {
    const path = this.paths.videoPath(fileName);
    const stats = await stat(path);
    const nodeStream = createReadStream(path, range ? { start: range.start, end: range.end } : {});
    return { stream: Readable.toWeb(nodeStream) as ReadableStream, size: stats.size };
  }

  async size(fileName: string): Promise<number | null> {
    try {
      const stats = await stat(this.paths.videoPath(fileName));
      return stats.size;
    } catch {
      return null;
    }
  }
}
