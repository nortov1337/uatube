import { AppError } from "@/domain/errors/AppError";

export class UnauthorizedError extends AppError {
  readonly code = "UNAUTHORIZED";
  readonly httpStatus = 401;
}
