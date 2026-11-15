import { RateLimitError } from "@/domain/errors/RateLimitError";
import { JsonResponder } from "@/infrastructure/http/JsonResponder";
import { container } from "@/lib/container";
import { clientIp } from "@/lib/http/clientIp";
import { withApi } from "@/lib/http/withApi";

const LIMIT = 10;
const WINDOW_MS = 60_000;

export const POST = withApi(async (req) => {
  const limit = container.rateLimiter.consume(`login:${clientIp(req)}`, LIMIT, WINDOW_MS);
  if (!limit.allowed) {
    throw new RateLimitError("Слишком много попыток входа, попробуйте позже", limit.retryAfterSec);
  }
  const user = await container.auth.login(await req.json());
  return JsonResponder.ok(user);
});
