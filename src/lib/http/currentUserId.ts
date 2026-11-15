import { container } from "@/lib/container";

export async function currentUserId(): Promise<string | null> {
  const session = await container.auth.resolveSession();
  return session?.userId ?? null;
}
