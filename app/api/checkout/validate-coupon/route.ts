import { NextResponse } from "next/server";
import { validateCoupon } from "@/lib/coupons";
import { couponRateLimit, getIp } from "@/lib/rate-limit";

// Lightweight coupon validation — called by the checkout UI for instant feedback.
// Does NOT create an order or touch the DB beyond a single SELECT.
// The discount is always re-validated server-side inside /api/checkout before the
// order is committed, so this endpoint is UI-only (not a security boundary).
export async function POST(request: Request) {
  // Rate limit: 30 coupon lookups per IP per minute (prevents code enumeration)
  const rl = await couponRateLimit(getIp(request));
  if (!rl.allowed) {
    return NextResponse.json({ valid: false, discount: 0, type: "percentage", minOrderAmount: null }, { status: 429 });
  }

  let body: { coupon?: unknown };
  try {
    body = (await request.json()) as { coupon?: unknown };
  } catch {
    return NextResponse.json({ valid: false, discount: 0, type: "percentage", minOrderAmount: null });
  }

  const code = String(body.coupon ?? "").trim();
  const result = await validateCoupon(code);

  // Never expose couponId to the client
  const { couponId: _omit, ...publicResult } = result;
  return NextResponse.json(publicResult);
}
