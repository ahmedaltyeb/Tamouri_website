// Customer authentication helpers — separate from NextAuth admin session.
// Uses jose (available via next-auth) for Edge-compatible JWT operations.
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

const COOKIE = "cust_session";
const EXPIRY = 60 * 60 * 24 * 30; // 30 days in seconds

function secret(): Uint8Array {
  const key =
    process.env.CUSTOMER_JWT_SECRET ??
    process.env.JWT_SECRET ??
    process.env.NEXTAUTH_SECRET ??
    process.env.AUTH_SECRET ??
    "";
  if (!key) throw new Error("CUSTOMER_JWT_SECRET is not set");
  return new TextEncoder().encode(key);
}

export interface CustomerPayload {
  id: string;
  email: string;
  name: string;
}

// ── Sign ──────────────────────────────────────────────────────────────────────

export async function signCustomerToken(payload: CustomerPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${EXPIRY}s`)
    .sign(secret());
}

// ── Verify ────────────────────────────────────────────────────────────────────

export async function verifyCustomerToken(token: string): Promise<CustomerPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret());
    return payload as unknown as CustomerPayload;
  } catch {
    return null;
  }
}

// ── Get session from request (Edge-safe, for middleware) ──────────────────────

export async function getCustomerFromRequest(req: NextRequest): Promise<CustomerPayload | null> {
  const token = req.cookies.get(COOKIE)?.value;
  if (!token) return null;
  return verifyCustomerToken(token);
}

// ── Get session from server components / API routes ───────────────────────────

export async function getCustomerSession(): Promise<CustomerPayload | null> {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (!token) return null;
  return verifyCustomerToken(token);
}

// ── Set session cookie (call from API route response) ─────────────────────────

export async function setCustomerCookie(
  payload: CustomerPayload,
  remember: boolean = false,
): Promise<string> {
  const token = await signCustomerToken(payload);
  const store = await cookies();
  store.set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: remember ? EXPIRY : undefined, // session cookie if remember=false
  });
  return token;
}

// ── Clear session cookie ──────────────────────────────────────────────────────

export async function clearCustomerCookie(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE);
}
