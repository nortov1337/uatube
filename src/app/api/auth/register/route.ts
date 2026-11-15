import { JsonResponder } from "@/infrastructure/http/JsonResponder";
import { container } from "@/lib/container";
import { withApi } from "@/lib/http/withApi";

export const POST = withApi(async (req) => {
  const user = await container.auth.register(await req.json());
  return JsonResponder.created(user);
});
