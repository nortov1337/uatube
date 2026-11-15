import { JsonResponder } from "@/infrastructure/http/JsonResponder";
import { container } from "@/lib/container";
import { withApi } from "@/lib/http/withApi";

type Context = { params: Promise<{ id: string }> };

export const POST = withApi<Context>(async (_req, ctx) => {
  const { id } = await ctx.params;
  const views = await container.videos.registerView(id);
  return JsonResponder.ok(views);
});
