import { ZodError } from "zod";
import { AppError } from "@/domain/errors/AppError";
import { RateLimitError } from "@/domain/errors/RateLimitError";

export interface ErrorBody {
  error: string;
  code: string;
  retryAfterSec?: number;
}

export interface ErrorResponse {
  status: number;
  body: ErrorBody;
}

export class ErrorMapper {
  static toResponse(error: unknown): ErrorResponse {
    if (error instanceof AppError) {
      return {
        status: error.httpStatus,
        body: {
          error: error.message,
          code: error.code,
          ...(error instanceof RateLimitError ? { retryAfterSec: error.retryAfterSec } : {}),
        },
      };
    }

    if (error instanceof ZodError) {
      return {
        status: 400,
        body: {
          error: error.issues[0]?.message ?? "Некорректные данные",
          code: "VALIDATION",
        },
      };
    }

    console.error(error);
    return { status: 500, body: { error: "Внутренняя ошибка", code: "INTERNAL" } };
  }
}
