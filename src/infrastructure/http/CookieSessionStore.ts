import { cookies } from "next/headers";
import type { SessionCookie } from "@/domain/ports/SessionCookie";

const COOKIE_NAME = "session";
const BASE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  path: "/",
} as const;

export class CookieSessionStore implements SessionCookie {
  async get(): Promise<string | undefined> {
    const store = await cookies();
    return store.get(COOKIE_NAME)?.value;
  }

  async set(token: string, maxAgeSec: number): Promise<void> {
    const store = await cookies();
    store.set(COOKIE_NAME, token, { ...BASE_OPTIONS, maxAge: maxAgeSec });
  }

  async clear(): Promise<void> {
    const store = await cookies();
    store.set(COOKIE_NAME, "", { ...BASE_OPTIONS, maxAge: 0 });
  }
}
