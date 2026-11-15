import { ValidationError } from "@/domain/errors/ValidationError";
import { JsonResponder } from "@/infrastructure/http/JsonResponder";
import { container } from "@/lib/container";
import { requireUserId } from "@/lib/http/requireUserId";
import { withApi } from "@/lib/http/withApi";

export const POST = withApi(async (req) => {
  const userId = await requireUserId();
  const form = await req.formData();
  const file = form.get("image");
  if (!(file instanceof File)) throw new ValidationError("Выберите изображение");
  const result = await container.profile.setImage(userId, "avatar", file);
  return JsonResponder.ok(result);
});

export const DELETE = withApi(async () => {
  const userId = await requireUserId();
  await container.profile.removeImage(userId, "avatar");
  return JsonResponder.noContent();
});
