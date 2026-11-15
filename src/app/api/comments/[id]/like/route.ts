import { JsonResponder } from "@/infrastructure/http/JsonResponder";
import { container } from "@/lib/container";
import { requireUserId } from "@/lib/http/requireUserId";
import { withApi } from "@/lib/http/withApi";

type Context = { params: Promise<{ id: string }> };

export const POST = withApi<Context>(async (_req, ctx) => {
  const userId = await requireUserId();
  const { id } = await ctx.params;
  const result = await container.comments.toggleLike(id, userId);
  return JsonResponder.ok(result);
});
