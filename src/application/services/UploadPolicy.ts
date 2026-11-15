import { PayloadTooLargeError } from "@/domain/errors/PayloadTooLargeError";
import { UnsupportedMediaTypeError } from "@/domain/errors/UnsupportedMediaTypeError";
import { ValidationError } from "@/domain/errors/ValidationError";

const ALLOWED_MIME: Record<string, "mp4" | "webm"> = {
  "video/mp4": "mp4",
  "video/webm": "webm",
};

const MULTIPART_OVERHEAD_BYTES = 2 * 1024 * 1024;

interface UploadPolicyDeps {
  maxBytes: number;
}

export class UploadPolicy {
  constructor(private readonly deps: UploadPolicyDeps) {}

  assertValid(file: File, title: string): void {
    const extension = ALLOWED_MIME[file.type];
    if (!extension) {
      throw new UnsupportedMediaTypeError("Поддерживаются только MP4 и WebM");
    }
    if (file.size <= 0) {
      throw new ValidationError("Файл пустой");
    }
    if (file.size > this.deps.maxBytes) {
      throw new PayloadTooLargeError(
        `Файл больше ${Math.round(this.deps.maxBytes / (1024 * 1024))} МБ`,
      );
    }
    const trimmed = title.trim();
    if (trimmed.length < 1 || trimmed.length > 120) {
      throw new ValidationError("Название от 1 до 120 символов");
    }
  }

  extensionFor(mime: string): "mp4" | "webm" {
    const extension = ALLOWED_MIME[mime];
    if (!extension) throw new UnsupportedMediaTypeError("Поддерживаются только MP4 и WebM");
    return extension;
  }

  assertContentLength(header: string | null): void {
    if (!header) return;
    const length = Number(header);
    if (Number.isFinite(length) && length > this.deps.maxBytes + MULTIPART_OVERHEAD_BYTES) {
      throw new PayloadTooLargeError(
        `Файл больше ${Math.round(this.deps.maxBytes / (1024 * 1024))} МБ`,
      );
    }
  }
}
