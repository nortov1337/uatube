export interface RateLimiter {
  consume(
    key: string,
    limit: number,
    windowMs: number,
  ): { allowed: boolean; retryAfterSec: number };
}
