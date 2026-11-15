import { JsonResponder } from "@/infrastructure/http/JsonResponder";
import { container } from "@/lib/container";
import { requireUserId } from "@/lib/http/requireUserId";
import { withApi } from "@/lib/http/withApi";

type Context = { params: Promise<{ videoId: string }> };

export const DELETE = withApi<Context>(async (_req, ctx) => {
  const userId = await requireUserId();
  const { videoId } = await ctx.params;
  await container.history.remove(userId, videoId);
  return JsonResponder.noContent();
});
