import { JsonResponder } from "@/infrastructure/http/JsonResponder";
import { container } from "@/lib/container";
import { requireUserId } from "@/lib/http/requireUserId";
import { withApi } from "@/lib/http/withApi";

export const POST = withApi(async (req) => {
  const userId = await requireUserId();
  await container.profile.changePassword(userId, await req.json());
  return JsonResponder.noContent();
});
