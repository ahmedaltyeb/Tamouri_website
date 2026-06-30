// Rate limiting — Upstash Redis when env vars are set, in-memory fallback otherwise.
//
// Upstash env vars required in production (Vercel dashboard):
//   UPSTASH_REDIS_REST_URL
//   UPSTASH_REDIS_REST_TOKEN
//
// Without those vars the in-memory fallback is used, which is fine for local
// development but resets on every serverless cold start — do not rely on it in
// production Vercel deployments.

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number; // epoch ms
}

// ─── Upstash limiter factory ─────────────────────────────────────────────────

function makeUpstashLimiter(
  tokens: number,
  windowSeconds: number,
): Ratelimit | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;

  return new Ratelimit({
    redis: new Redis({ url, token }),
    limiter: Ratelimit.slidingWindow(tokens, `${windowSeconds} s`),
    analytics: false,
    prefix: "tamouri:rl",
  });
}

async function checkUpstash(
  limiter: Ratelimit,
  key: string,
): Promise<RateLimitResult> {
  const result = await limiter.limit(key);
  return {
    allowed: result.success,
    remaining: result.remaining,
    resetAt: result.reset,
  };
}

// ─── In-memory fallback ───────────────────────────────────────────────────────

interface Bucket {
  count: number;
  resetAt: number;
}
const store = new Map<string, Bucket>();

setInterval(() => {
  const now = Date.now();
  for (const [k, b] of store.entries()) {
    if (b.resetAt < now) store.delete(k);
  }
}, 5 * 60 * 1000);

function checkMemory(
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
  return {
    allowed: bucket.count <= limit,
    remaining: Math.max(0, limit - bucket.count),
    resetAt: bucket.resetAt,
  };
}

// ─── Unified check ───────────────────────────────────────────────────────────

async function check(
  limiter: Ratelimit | null,
  key: string,
  memLimit: number,
  memWindowMs: number,
): Promise<RateLimitResult> {
  if (limiter) {
    try {
      return await checkUpstash(limiter, key);
    } catch {
      // Upstash unreachable — fail open to avoid blocking legitimate users
      return { allowed: true, remaining: 1, resetAt: Date.now() + memWindowMs };
    }
  }
  return checkMemory(key, memLimit, memWindowMs);
}

// ─── Lazy singletons (created once per warm lambda / process) ────────────────

let _loginLimiter: Ratelimit | null | undefined;
let _registerLimiter: Ratelimit | null | undefined;
let _forgotLimiter: Ratelimit | null | undefined;
let _checkoutLimiter: Ratelimit | null | undefined;
let _couponLimiter: Ratelimit | null | undefined;

function loginLimiter() {
  if (_loginLimiter === undefined) _loginLimiter = makeUpstashLimiter(5, 15 * 60);
  return _loginLimiter;
}
function registerLimiter() {
  if (_registerLimiter === undefined) _registerLimiter = makeUpstashLimiter(3, 60 * 60);
  return _registerLimiter;
}
function forgotLimiter() {
  if (_forgotLimiter === undefined) _forgotLimiter = makeUpstashLimiter(3, 60 * 60);
  return _forgotLimiter;
}
function checkoutLimiter() {
  if (_checkoutLimiter === undefined) _checkoutLimiter = makeUpstashLimiter(10, 60 * 60);
  return _checkoutLimiter;
}
function couponLimiter() {
  if (_couponLimiter === undefined) _couponLimiter = makeUpstashLimiter(30, 60);
  return _couponLimiter;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/** 5 login attempts per IP per 15 minutes */
export async function loginRateLimit(ip: string): Promise<RateLimitResult> {
  return check(loginLimiter(), `login:${ip}`, 5, 15 * 60 * 1000);
}

/** 3 register attempts per IP per hour */
export async function registerRateLimit(ip: string): Promise<RateLimitResult> {
  return check(registerLimiter(), `register:${ip}`, 3, 60 * 60 * 1000);
}

/** 3 forgot-password requests per IP per hour */
export async function forgotRateLimit(ip: string): Promise<RateLimitResult> {
  return check(forgotLimiter(), `forgot:${ip}`, 3, 60 * 60 * 1000);
}

/** 10 checkout submissions per IP per hour */
export async function checkoutRateLimit(ip: string): Promise<RateLimitResult> {
  return check(checkoutLimiter(), `checkout:${ip}`, 10, 60 * 60 * 1000);
}

/** 30 coupon lookups per IP per minute */
export async function couponRateLimit(ip: string): Promise<RateLimitResult> {
  return check(couponLimiter(), `coupon:${ip}`, 30, 60 * 1000);
}

/** Extract the real client IP from the request headers */
export function getIp(request: Request): string {
  const xff = request.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return "unknown";
}
