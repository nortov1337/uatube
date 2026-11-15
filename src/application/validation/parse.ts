import type { ZodType } from "zod";
import { ValidationError } from "@/domain/errors/ValidationError";

export function parseOrThrow<T>(schema: ZodType<T>, input: unknown): T {
  const result = schema.safeParse(input);
  if (!result.success) {
    throw new ValidationError(result.error.issues[0]?.message ?? "Некорректные данные");
  }
  return result.data;
}
