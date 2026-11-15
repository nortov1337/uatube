import { AppError } from "@/domain/errors/AppError";

export class RateLimitError extends AppError {
  readonly code = "RATE_LIMIT";
  readonly httpStatus = 429;

  constructor(
    message: string,
    readonly retryAfterSec: number,
  ) {
    super(message);
  }
}
