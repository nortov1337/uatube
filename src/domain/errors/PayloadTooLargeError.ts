import { AppError } from "@/domain/errors/AppError";

export class PayloadTooLargeError extends AppError {
  readonly code = "PAYLOAD_TOO_LARGE";
  readonly httpStatus = 413;
}
