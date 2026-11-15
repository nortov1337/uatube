import { NotFoundError } from "@/domain/errors/NotFoundError";
import { container } from "@/lib/container";
import { withApi } from "@/lib/http/withApi";

type Context = { params: Promise<{ id: string }> };

export const runtime = "nodejs";

export const GET = withApi<Context>(async (_req, ctx) => {
  const { id } = await ctx.params;
  const thumb = await container.media.openThumb(id);
  if (!thumb) throw new NotFoundError("Постер не найден");

  return new Response(new Uint8Array(thumb.data), {
    headers: {
      "Content-Type": "image/jpeg",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
});
