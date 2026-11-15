import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import type { ImageKind, ImageStorage } from "@/domain/ports/ImageStorage";
import type { LocalFilePaths } from "@/infrastructure/storage/LocalFilePaths";

export class LocalImageStorage implements ImageStorage {
  constructor(private readonly paths: LocalFilePaths) {}

  async save(kind: ImageKind, ownerId: string, jpeg: Uint8Array): Promise<string> {
    const name = this.paths.imageFileName(kind, ownerId);
    await mkdir(this.paths.images, { recursive: true });
    await writeFile(this.paths.imagePath(name), jpeg);
    return name;
  }

  async remove(name: string): Promise<void> {
    await rm(this.paths.imagePath(name), { force: true });
  }

  path(name: string): string {
    return this.paths.imagePath(name);
  }

  async read(name: string): Promise<Uint8Array | null> {
    try {
      return await readFile(this.path(name));
    } catch {
      return null;
    }
  }
}
