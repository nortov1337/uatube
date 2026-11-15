import { AppError } from "@/domain/errors/AppError";

export class ValidationError extends AppError {
  readonly code = "VALIDATION";
  readonly httpStatus = 400;
}
