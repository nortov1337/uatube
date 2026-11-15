import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Имя от 2 до 60 символов").max(60, "Имя от 2 до 60 символов"),
  email: z.email("Некорректный email").max(160, "Слишком длинный email"),
  password: z.string().min(8, "Пароль от 8 символов").max(72, "Пароль до 72 символов"),
});

export const loginSchema = z.object({
  email: z.email("Некорректный email").max(160, "Слишком длинный email"),
  password: z.string().min(1, "Введите пароль").max(72, "Пароль до 72 символов"),
});

export const commentSchema = z.object({
  body: z.string().trim().min(1, "Комментарий не может быть пустым").max(1000, "Комментарий до 1000 символов"),
});

export const videoMetaSchema = z.object({
  title: z.string().trim().min(1, "Название от 1 до 120 символов").max(120, "Название от 1 до 120 символов"),
  description: z.string().trim().max(5000, "Описание до 5000 символов").default(""),
  durationSec: z.coerce.number().min(0).max(86400).default(0),
});

export const listQuerySchema = z.object({
  q: z.string().trim().max(120).optional(),
  cursor: z.string().max(64).optional(),
  limit: z.coerce.number().int().min(1).max(60).default(24),
});
