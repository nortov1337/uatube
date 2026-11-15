import { JsonResponder } from "@/infrastructure/http/JsonResponder";
import { container } from "@/lib/container";
import { withApi } from "@/lib/http/withApi";

export const POST = withApi(async () => {
  await container.auth.logout();
  return JsonResponder.noContent();
});
