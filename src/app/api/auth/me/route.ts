import { JsonResponder } from "@/infrastructure/http/JsonResponder";
import { container } from "@/lib/container";
import { withApi } from "@/lib/http/withApi";

export const dynamic = "force-dynamic";

export const GET = withApi(async () => {
  const user = await container.auth.currentUser();
  return JsonResponder.ok({ user });
});
