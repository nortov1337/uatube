import { JsonResponder } from "@/infrastructure/http/JsonResponder";
import { container } from "@/lib/container";
import { requireUserId } from "@/lib/http/requireUserId";
import { withApi } from "@/lib/http/withApi";

export const POST = withApi(async () => {
  const userId = await requireUserId();
  await container.notifications.markAllRead(userId);
  return JsonResponder.noContent();
});
