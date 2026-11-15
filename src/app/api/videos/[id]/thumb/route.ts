import { ValidationError } from "@/domain/errors/ValidationError";
import { JsonResponder } from "@/infrastructure/http/JsonResponder";
import { container } from "@/lib/container";
import { requireUserId } from "@/lib/http/requireUserId";
import { withApi } from "@/lib/http/withApi";

type Context = { params: Promise<{ id: string }> };

export const POST = withApi<Context>(async (req, ctx) => {
  const userId = await requireUserId();
  const { id } = await ctx.params;

  const form = await req.formData();
  const file = form.get("thumb");
  if (!(file instanceof File)) throw new ValidationError("Выберите изображение");

  const result = await container.studio.setThumb(id, userId, file);
  return JsonResponder.ok(result);
});
