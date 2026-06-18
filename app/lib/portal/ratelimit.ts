import "server-only";

/**
 * Tiny in-memory fixed-window rate limiter for the login / request-access
 * endpoints. Good enough to blunt abuse from a single instance; for multi-
 * instance correctness swap this for a shared store (Upstash/Redis) later.
 */

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

/**
 * @returns `true` if the action is allowed, `false` if the limit is exceeded.
 */
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
  now: number,
): boolean {
  const existing = buckets.get(key);
  if (!existing || now > existing.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (existing.count >= limit) return false;
  existing.count += 1;
  return true;
}
