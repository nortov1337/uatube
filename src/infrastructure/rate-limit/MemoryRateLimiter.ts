import type { RateLimiter } from "@/domain/ports/RateLimiter";

export class MemoryRateLimiter implements RateLimiter {
  private readonly hits = new Map<string, number[]>();
  private lastSweep = Date.now();

  consume(
    key: string,
    limit: number,
    windowMs: number,
  ): { allowed: boolean; retryAfterSec: number } {
    const now = Date.now();
    this.sweep(now, windowMs);

    const fresh = (this.hits.get(key) ?? []).filter((stamp) => now - stamp < windowMs);
    if (fresh.length >= limit) {
      this.hits.set(key, fresh);
      const oldest = fresh[0] ?? now;
      return {
        allowed: false,
        retryAfterSec: Math.max(1, Math.ceil((windowMs - (now - oldest)) / 1000)),
      };
    }

    fresh.push(now);
    this.hits.set(key, fresh);
    return { allowed: true, retryAfterSec: 0 };
  }

  private sweep(now: number, windowMs: number): void {
    if (now - this.lastSweep < windowMs) return;
    for (const [key, stamps] of this.hits) {
      if (stamps.every((stamp) => now - stamp >= windowMs)) this.hits.delete(key);
    }
    this.lastSweep = now;
  }
}
