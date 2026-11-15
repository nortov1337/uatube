import { Prisma } from "@prisma/client";
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

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return { status: 409, body: { error: "Такая запись уже существует", code: "CONFLICT" } };
      }
      if (error.code === "P2025") {
        return { status: 404, body: { error: "Запись не найдена", code: "NOT_FOUND" } };
      }
    }

    console.error(error);
    return { status: 500, body: { error: "Внутренняя ошибка", code: "INTERNAL" } };
  }
}
