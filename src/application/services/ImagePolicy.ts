import { ValidationError } from "@/domain/errors/ValidationError";
import { PayloadTooLargeError } from "@/domain/errors/PayloadTooLargeError";
import { UnsupportedMediaTypeError } from "@/domain/errors/UnsupportedMediaTypeError";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export class ImagePolicy {
  assertJpeg(file: File): void {
    if (file.type !== "image/jpeg") {
      throw new UnsupportedMediaTypeError("Поддерживается только JPEG");
    }
    if (file.size <= 0) throw new ValidationError("Файл пустой");
    if (file.size > MAX_IMAGE_BYTES) {
      throw new PayloadTooLargeError("Изображение больше 5 МБ");
    }
  }
}
