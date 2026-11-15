import { AppError } from "@/domain/errors/AppError";

export class NotFoundError extends AppError {
  readonly code = "NOT_FOUND";
  readonly httpStatus = 404;
}
