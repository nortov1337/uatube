import { AppError } from "@/domain/errors/AppError";

export class ForbiddenError extends AppError {
  readonly code = "FORBIDDEN";
  readonly httpStatus = 403;
}
