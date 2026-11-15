import { JsonResponder } from "@/infrastructure/http/JsonResponder";
import { container } from "@/lib/container";
import { requireUserId } from "@/lib/http/requireUserId";
import { withApi } from "@/lib/http/withApi";

export const DELETE = withApi(async () => {
  const userId = await requireUserId();
  await container.profile.removeAccount(userId);
  await container.auth.logout();
  return JsonResponder.noContent();
});
