export interface SessionCookie {
  get(): Promise<string | undefined>;
  set(token: string, maxAgeSec: number): Promise<void>;
  clear(): Promise<void>;
}
