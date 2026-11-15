import { JsonResponder } from "@/infrastructure/http/JsonResponder";
import { container } from "@/lib/container";
import { currentUserId } from "@/lib/http/currentUserId";
import { withApi } from "@/lib/http/withApi";

type Context = { params: Promise<{ id: string }> };

export const dynamic = "force-dynamic";

export const GET = withApi<Context>(async (req, ctx) => {
  const { id } = await ctx.params;
  const viewerId = await currentUserId();
  const page = await container.comments.replies(
    id,
    Object.fromEntries(req.nextUrl.searchParams),
    viewerId,
  );
  return JsonResponder.ok(page);
});
