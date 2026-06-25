import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const ALLOWED_EVENTS = new Set([
  "page_view",
  "product_view",
  "add_to_cart",
  "remove_from_cart",
  "checkout_start",
  "purchase_completed",
]);

export async function POST(request: Request) {
  let body: {
    event?: string;
    sessionId?: string;
    productId?: string;
    metadata?: Record<string, unknown>;
  };

  try {
    body = await request.json() as typeof body;
  } catch {
    return new Response(null, { status: 204 });
  }

  const event = body.event?.trim();
  if (!event || !ALLOWED_EVENTS.has(event)) {
    return new Response(null, { status: 204 });
  }

  // Write is intentionally not awaited — fire and forget from the client's
  // perspective. We still await here so Vercel/Render doesn't kill the
  // serverless function before the write completes, but we never let errors
  // surface to the caller.
  try {
    await prisma.analyticsEvent.create({
      data: {
        event,
        sessionId: body.sessionId ?? null,
        productId: body.productId ?? null,
        metadata: JSON.stringify(body.metadata ?? {}),
      },
    });
  } catch {
    // silent — analytics must never break the storefront
  }

  // 204 No Content — smallest possible response
  return new Response(null, { status: 204 });
}
