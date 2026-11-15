import { UnauthorizedError } from "@/domain/errors/UnauthorizedError";
import { JsonResponder } from "@/infrastructure/http/JsonResponder";
import { container } from "@/lib/container";
import { currentUserId } from "@/lib/http/currentUserId";
import { withApi } from "@/lib/http/withApi";

type Context = { params: Promise<{ id: string }> };

export const DELETE = withApi<Context>(async (_req, ctx) => {
  const userId = await currentUserId();
  if (!userId) throw new UnauthorizedError("Требуется вход");

  const { id } = await ctx.params;
  await container.comments.remove(id, userId);
  return JsonResponder.noContent();
});
