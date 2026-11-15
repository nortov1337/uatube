import { JsonResponder } from "@/infrastructure/http/JsonResponder";
import { container } from "@/lib/container";
import { requireUserId } from "@/lib/http/requireUserId";
import { withApi } from "@/lib/http/withApi";

export const dynamic = "force-dynamic";

export const GET = withApi(async () => {
  const userId = await requireUserId();
  const playlists = await container.playlists.listMine(userId);
  return JsonResponder.ok({ items: playlists });
});

export const POST = withApi(async (req) => {
  const userId = await requireUserId();
  const playlist = await container.playlists.create(userId, await req.json());
  return JsonResponder.created(playlist);
});
