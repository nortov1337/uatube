import { z } from "zod";
import { VIDEO_CATEGORY_SLUGS } from "@/domain/values/VideoCategory";

const categorySchema = z.union([z.enum(VIDEO_CATEGORY_SLUGS), z.literal("")]);
const visibilitySchema = z.enum(["public", "unlisted", "private"]);
const tagsSchema = z.string().max(400, "Слишком много тегов").default("");
const titleSchema = z
  .string()
  .trim()
  .min(1, "Название от 1 до 120 символов")
  .max(120, "Название от 1 до 120 символов");
const descriptionSchema = z.string().trim().max(5000, "Описание до 5000 символов").default("");

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
  body: z
    .string()
    .trim()
    .min(1, "Комментарий не может быть пустым")
    .max(1000, "Комментарий до 1000 символов"),
  parentId: z.string().max(40).nullish(),
});

export const commentUpdateSchema = z.object({
  body: z
    .string()
    .trim()
    .min(1, "Комментарий не может быть пустым")
    .max(1000, "Комментарий до 1000 символов"),
});

export const videoMetaSchema = z.object({
  title: titleSchema,
  description: descriptionSchema,
  durationSec: z.coerce.number().min(0).max(86400).default(0),
  tags: tagsSchema,
  category: categorySchema.default(""),
  visibility: visibilitySchema.default("public"),
});

export const videoUpdateSchema = z.object({
  title: titleSchema,
  description: descriptionSchema,
  tags: tagsSchema,
  category: categorySchema,
  visibility: visibilitySchema,
});

export const listQuerySchema = z.object({
  q: z.string().trim().max(120).optional(),
  cursor: z.string().max(64).optional(),
  tag: z.string().trim().max(40).optional(),
  category: z.string().trim().max(40).optional(),
  sort: z.enum(["new", "views", "likes"]).default("new"),
  limit: z.coerce.number().int().min(1).max(60).default(24),
});

export const commentListQuerySchema = z.object({
  cursor: z.string().max(64).optional(),
  sort: z.enum(["new", "top"]).default("new"),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export const playlistSchema = z.object({
  title: z.string().trim().min(1, "Название от 1 до 80 символов").max(80, "Название до 80 символов"),
  description: z.string().trim().max(1000, "Описание до 1000 символов").default(""),
  visibility: visibilitySchema.default("public"),
});

export const playlistUpdateSchema = playlistSchema.partial();

export const playlistItemSchema = z.object({
  videoId: z.string().min(1).max(40),
});

export const playlistReorderSchema = z.object({
  videoIds: z.array(z.string().min(1).max(40)).max(500),
});

export const profileSchema = z.object({
  name: z.string().trim().min(2, "Имя от 2 до 60 символов").max(60, "Имя до 60 символов"),
  handle: z
    .string()
    .trim()
    .regex(/^[a-z0-9_]{3,20}$/, "Латиница, цифры и _ от 3 до 20 символов"),
  bio: z.string().trim().max(500, "О себе до 500 символов").default(""),
});

export const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Введите текущий пароль").max(72),
  newPassword: z.string().min(8, "Новый пароль от 8 символов").max(72, "Пароль до 72 символов"),
});

export const historySchema = z.object({
  positionSec: z.coerce.number().min(0).max(86400),
});
