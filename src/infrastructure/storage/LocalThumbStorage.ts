import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import type { ThumbStorage } from "@/domain/ports/ThumbStorage";
import type { LocalFilePaths } from "@/infrastructure/storage/LocalFilePaths";

export class LocalThumbStorage implements ThumbStorage {
  constructor(private readonly paths: LocalFilePaths) {}

  async save(videoId: string, jpeg: Uint8Array): Promise<string> {
    const thumbName = this.paths.thumbFileName(videoId);
    await mkdir(this.paths.thumbs, { recursive: true });
    await writeFile(this.paths.thumbPath(thumbName), jpeg);
    return thumbName;
  }

  async remove(thumbName: string): Promise<void> {
    await rm(this.paths.thumbPath(thumbName), { force: true });
  }

  path(thumbName: string): string {
    return this.paths.thumbPath(thumbName);
  }

  async read(thumbName: string): Promise<Uint8Array | null> {
    try {
      return await readFile(this.path(thumbName));
    } catch {
      return null;
    }
  }
}
