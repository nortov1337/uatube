import { RateLimitError } from "@/domain/errors/RateLimitError";
import { JsonResponder } from "@/infrastructure/http/JsonResponder";
import { container } from "@/lib/container";
import { clientIp } from "@/lib/http/clientIp";
import { currentUserId } from "@/lib/http/currentUserId";
import { withApi } from "@/lib/http/withApi";

type Context = { params: Promise<{ id: string }> };

const LIMIT = 60;
const WINDOW_MS = 60_000;

export const POST = withApi<Context>(async (req, ctx) => {
  const limit = container.rateLimiter.consume(`view:${clientIp(req)}`, LIMIT, WINDOW_MS);
  if (!limit.allowed) {
    throw new RateLimitError("Слишком много запросов, попробуйте позже", limit.retryAfterSec);
  }

  const { id } = await ctx.params;
  const viewerId = await currentUserId();
  const views = await container.videos.registerView(id, viewerId);
  return JsonResponder.ok(views);
});
