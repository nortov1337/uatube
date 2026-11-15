import { NotFoundError } from "@/domain/errors/NotFoundError";
import { container } from "@/lib/container";
import { currentUserId } from "@/lib/http/currentUserId";
import { withApi } from "@/lib/http/withApi";

type Context = { params: Promise<{ id: string }> };

export const runtime = "nodejs";

export const GET = withApi<Context>(async (_req, ctx) => {
  const { id } = await ctx.params;
  const viewerId = await currentUserId();
  const thumb = await container.media.openThumb(id, viewerId);
  if (!thumb) throw new NotFoundError("Постер не найден");

  return new Response(new Uint8Array(thumb.data), {
    headers: {
      "Content-Type": "image/jpeg",
      "Cache-Control": "private, max-age=3600",
    },
  });
});
