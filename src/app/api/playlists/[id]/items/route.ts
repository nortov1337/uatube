import { JsonResponder } from "@/infrastructure/http/JsonResponder";
import { container } from "@/lib/container";
import { requireUserId } from "@/lib/http/requireUserId";
import { withApi } from "@/lib/http/withApi";

type Context = { params: Promise<{ id: string }> };

export const POST = withApi<Context>(async (req, ctx) => {
  const userId = await requireUserId();
  const { id } = await ctx.params;
  const result = await container.playlists.addItem(id, userId, await req.json());
  return JsonResponder.ok(result);
});

export const DELETE = withApi<Context>(async (req, ctx) => {
  const userId = await requireUserId();
  const { id } = await ctx.params;
  const videoId = req.nextUrl.searchParams.get("videoId") ?? "";
  await container.playlists.removeItem(id, userId, videoId);
  return JsonResponder.noContent();
});
