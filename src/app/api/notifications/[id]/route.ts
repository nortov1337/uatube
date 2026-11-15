import { JsonResponder } from "@/infrastructure/http/JsonResponder";
import { container } from "@/lib/container";
import { requireUserId } from "@/lib/http/requireUserId";
import { withApi } from "@/lib/http/withApi";

type Context = { params: Promise<{ id: string }> };

export const DELETE = withApi<Context>(async (_req, ctx) => {
  const userId = await requireUserId();
  const { id } = await ctx.params;
  await container.notifications.remove(id, userId);
  return JsonResponder.noContent();
});
