import { JsonResponder } from "@/infrastructure/http/JsonResponder";
import { container } from "@/lib/container";
import { requireUserId } from "@/lib/http/requireUserId";
import { withApi } from "@/lib/http/withApi";

export const POST = withApi(async (req) => {
  const userId = await requireUserId();
  const body = (await req.json()) as { videoId?: string };
  const result = await container.playlists.toggleWatchLater(userId, String(body.videoId ?? ""));
  return JsonResponder.ok(result);
});
