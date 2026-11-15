import { RateLimitError } from "@/domain/errors/RateLimitError";
import { UnauthorizedError } from "@/domain/errors/UnauthorizedError";
import { JsonResponder } from "@/infrastructure/http/JsonResponder";
import { container } from "@/lib/container";
import { clientIp } from "@/lib/http/clientIp";
import { currentUserId } from "@/lib/http/currentUserId";
import { withApi } from "@/lib/http/withApi";

type Context = { params: Promise<{ id: string }> };

const LIMIT = 20;
const WINDOW_MS = 60_000;

export const dynamic = "force-dynamic";

export const GET = withApi<Context>(async (req, ctx) => {
  const { id } = await ctx.params;
  const page = await container.comments.list(id, Object.fromEntries(req.nextUrl.searchParams));
  return JsonResponder.ok(page);
});

export const POST = withApi<Context>(async (req, ctx) => {
  const userId = await currentUserId();
  if (!userId) throw new UnauthorizedError("Требуется вход");

  const key = `comment:${clientIp(req)}:${userId}`;
  const limit = container.rateLimiter.consume(key, LIMIT, WINDOW_MS);
  if (!limit.allowed) {
    throw new RateLimitError("Слишком много комментариев, попробуйте позже", limit.retryAfterSec);
  }

  const { id } = await ctx.params;
  const comment = await container.comments.create(id, userId, await req.json());
  return JsonResponder.created(comment);
});
