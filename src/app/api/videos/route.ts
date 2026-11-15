import { UnauthorizedError } from "@/domain/errors/UnauthorizedError";
import { ValidationError } from "@/domain/errors/ValidationError";
import { JsonResponder } from "@/infrastructure/http/JsonResponder";
import { container } from "@/lib/container";
import { currentUserId } from "@/lib/http/currentUserId";
import { withApi } from "@/lib/http/withApi";

export const dynamic = "force-dynamic";

export const GET = withApi(async (req) => {
  const page = await container.videos.listFeed(Object.fromEntries(req.nextUrl.searchParams));
  return JsonResponder.ok(page);
});

export const POST = withApi(async (req) => {
  const userId = await currentUserId();
  if (!userId) throw new UnauthorizedError("Требуется вход");

  container.uploadPolicy.assertContentLength(req.headers.get("content-length"));

  const form = await req.formData();
  const file = form.get("file");
  const thumb = form.get("thumb");
  if (!(file instanceof File)) throw new ValidationError("Выберите файл видео");

  const created = await container.videos.create({
    userId,
    file,
    title: form.get("title"),
    description: form.get("description") ?? "",
    durationSec: form.get("durationSec") ?? 0,
    thumb: thumb instanceof File ? thumb : null,
  });
  return JsonResponder.created(created);
});
