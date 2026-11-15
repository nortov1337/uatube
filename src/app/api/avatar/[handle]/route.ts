import { NotFoundError } from "@/domain/errors/NotFoundError";
import { container } from "@/lib/container";
import { withApi } from "@/lib/http/withApi";

type Context = { params: Promise<{ handle: string }> };

export const runtime = "nodejs";

export const GET = withApi<Context>(async (_req, ctx) => {
  const { handle } = await ctx.params;
  const image = await container.media.openAvatar(handle);
  if (!image) throw new NotFoundError("Аватар не найден");

  return new Response(new Uint8Array(image.data), {
    headers: {
      "Content-Type": "image/jpeg",
      "Cache-Control": "public, max-age=3600",
    },
  });
});
