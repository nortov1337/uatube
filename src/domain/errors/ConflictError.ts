import { AppError } from "@/domain/errors/AppError";

export class ConflictError extends AppError {
  readonly code = "CONFLICT";
  readonly httpStatus = 409;
}
