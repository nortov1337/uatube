import { AppError } from "@/domain/errors/AppError";

export class UnsupportedMediaTypeError extends AppError {
  readonly code = "UNSUPPORTED_MEDIA";
  readonly httpStatus = 415;
}
