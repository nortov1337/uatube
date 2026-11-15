import { JsonResponder } from "@/infrastructure/http/JsonResponder";
import { container } from "@/lib/container";
import { requireUserId } from "@/lib/http/requireUserId";
import { withApi } from "@/lib/http/withApi";

export const POST = withApi(async (req) => {
  const userId = await requireUserId();
  const result = await container.subscriptions.toggle(await req.json(), userId);
  return JsonResponder.ok(result);
});
