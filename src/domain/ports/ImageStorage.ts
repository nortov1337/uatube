export type ImageKind = "avatar" | "banner";

export interface ImageStorage {
  save(kind: ImageKind, ownerId: string, jpeg: Uint8Array): Promise<string>;
  remove(name: string): Promise<void>;
  path(name: string): string;
  read(name: string): Promise<Uint8Array | null>;
}
