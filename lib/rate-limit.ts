// Simple in-memory rate limiter. Works on a single Render instance (no Redis needed).
// Each bucket: { count, resetAt }

interface Bucket {
  count: number;
  resetAt: number; // epoch ms
}

const store = new Map<string, Bucket>();

// Clean stale buckets every 5 minutes to avoid memory leak
setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of store.entries()) {
    if (bucket.resetAt < now) store.delete(key);
  }
}, 5 * 60 * 1000);

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number; // epoch ms
}

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now();
  let bucket = store.get(key);

  if (!bucket || bucket.resetAt < now) {
    bucket = { count: 0, resetAt: now + windowMs };
    store.set(key, bucket);
  }

  bucket.count += 1;
  const allowed = bucket.count <= limit;
  const remaining = Math.max(0, limit - bucket.count);

  return { allowed, remaining, resetAt: bucket.resetAt };
}

// Preset: 5 login attempts per 15 minutes per IP
export function loginRateLimit(ip: string): RateLimitResult {
  return rateLimit(`login:${ip}`, 5, 15 * 60 * 1000);
}

// Preset: 3 register attempts per hour per IP
export function registerRateLimit(ip: string): RateLimitResult {
  return rateLimit(`register:${ip}`, 3, 60 * 60 * 1000);
}

// Preset: 3 forgot-password requests per hour per IP
export function forgotRateLimit(ip: string): RateLimitResult {
  return rateLimit(`forgot:${ip}`, 3, 60 * 60 * 1000);
}

// Helper to extract IP from a Request
export function getIp(request: Request): string {
  const xff = request.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return "unknown";
}
