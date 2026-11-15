import { JsonResponder } from "@/infrastructure/http/JsonResponder";
import { container } from "@/lib/container";
import { requireUserId } from "@/lib/http/requireUserId";
import { withApi } from "@/lib/http/withApi";

export const PATCH = withApi(async (req) => {
  const userId = await requireUserId();
  const profile = await container.profile.update(userId, await req.json());
  return JsonResponder.ok(profile);
});
