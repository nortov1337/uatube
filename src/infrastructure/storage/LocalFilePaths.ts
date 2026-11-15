import { join, resolve, sep } from "node:path";

const NAME_PATTERN = /^[a-zA-Z0-9_-]+\.(mp4|webm|jpg)$/;

function resolveRoot(): string {
  const dir = process.env.UPLOAD_DIR;
  if (!dir) throw new Error("UPLOAD_DIR не задан");
  return resolve(dir);
}

export class LocalFilePaths {
  readonly root = resolveRoot();
  readonly thumbs = join(this.root, "thumbs");
  readonly images = join(this.root, "images");

  videoFileName(id: string, extension: "mp4" | "webm"): string {
    return this.assertName(`${id}.${extension}`);
  }

  videoPath(fileName: string): string {
    return this.assertInside(this.root, join(this.root, this.assertName(fileName)));
  }

  thumbFileName(id: string): string {
    return this.assertName(`${id}.jpg`);
  }

  thumbPath(thumbName: string): string {
    return this.assertInside(this.thumbs, join(this.thumbs, this.assertName(thumbName)));
  }

  imageFileName(kind: "avatar" | "banner", ownerId: string): string {
    return this.assertName(`${kind}-${ownerId}.jpg`);
  }

  imagePath(name: string): string {
    return this.assertInside(this.images, join(this.images, this.assertName(name)));
  }

  private assertName(name: string): string {
    if (!NAME_PATTERN.test(name)) throw new Error("Недопустимое имя файла");
    return name;
  }

  private assertInside(root: string, path: string): string {
    const normalizedRoot = root.endsWith(sep) ? root : `${root}${sep}`;
    if (!resolve(path).startsWith(normalizedRoot)) throw new Error("Недопустимый путь");
    return path;
  }
}
