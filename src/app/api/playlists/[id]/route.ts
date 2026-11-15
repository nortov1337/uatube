import { JsonResponder } from "@/infrastructure/http/JsonResponder";
import { container } from "@/lib/container";
import { currentUserId } from "@/lib/http/currentUserId";
import { requireUserId } from "@/lib/http/requireUserId";
import { withApi } from "@/lib/http/withApi";

type Context = { params: Promise<{ id: string }> };

export const dynamic = "force-dynamic";

export const GET = withApi<Context>(async (_req, ctx) => {
  const { id } = await ctx.params;
  const viewerId = await currentUserId();
  const playlist = await container.playlists.getDetails(id, viewerId);
  return JsonResponder.ok(playlist);
});

export const PATCH = withApi<Context>(async (req, ctx) => {
  const userId = await requireUserId();
  const { id } = await ctx.params;
  const playlist = await container.playlists.update(id, userId, await req.json());
  return JsonResponder.ok(playlist);
});

export const DELETE = withApi<Context>(async (_req, ctx) => {
  const userId = await requireUserId();
  const { id } = await ctx.params;
  await container.playlists.remove(id, userId);
  return JsonResponder.noContent();
});
