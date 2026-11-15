import { UnauthorizedError } from "@/domain/errors/UnauthorizedError";
import { currentUserId } from "@/lib/http/currentUserId";

export async function requireUserId(): Promise<string> {
  const userId = await currentUserId();
  if (!userId) throw new UnauthorizedError("Требуется вход");
  return userId;
}
