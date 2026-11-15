import { container } from "@/lib/container";
import { currentUserId } from "@/lib/http/currentUserId";
import { withApi } from "@/lib/http/withApi";

type Context = { params: Promise<{ id: string }> };

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = withApi<Context>(async (req, ctx) => {
  const { id } = await ctx.params;
  const viewerId = await currentUserId();
  const media = await container.media.openVideo(id, req.headers.get("range"), viewerId);
  const length = media.end - media.start + 1;

  return new Response(media.stream, {
    status: media.partial ? 206 : 200,
    headers: {
      "Content-Type": media.mimeType,
      "Content-Length": String(length),
      "Accept-Ranges": "bytes",
      "Cache-Control": "private, max-age=0, must-revalidate",
      ...(media.partial
        ? { "Content-Range": `bytes ${media.start}-${media.end}/${media.size}` }
        : {}),
    },
  });
});
