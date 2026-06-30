import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { sendOrderConfirmation } from "@/lib/email";
import { parseMLText } from "@/lib/products";

// Must be dynamic — we read the raw request body for signature verification
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = await request.text(); // raw bytes — do NOT use request.json()
  const sig = request.headers.get("stripe-signature");

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("[stripe webhook] STRIPE_WEBHOOK_SECRET is not set");
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
  }
  if (!sig) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, sig, webhookSecret);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Signature verification failed";
    console.error("[stripe webhook] constructEvent:", msg);
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  // ── checkout.session.completed ─────────────────────────────────────────────
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.orderId;

    if (!orderId) {
      console.error("[stripe webhook] checkout.session.completed: missing orderId in metadata");
      return NextResponse.json({ received: true }); // ACK so Stripe doesn't retry
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: { select: { email: true, name: true } },
        items: {
          include: { product: { select: { name: true } } },
        },
      },
    });

    if (!order) {
      console.error(`[stripe webhook] Order not found: ${orderId}`);
      return NextResponse.json({ received: true }); // idempotent ACK
    }

    // Idempotency — skip if already PAID (webhook can fire more than once)
    if (order.status === "PAID") {
      return NextResponse.json({ received: true });
    }

    const isPaid = session.payment_status === "paid";

    // Update order status + history in one transaction
    // NOTE: stock was already decremented at order creation time (see /api/checkout).
    // We do NOT decrement again here.
    await prisma.$transaction([
      prisma.order.update({
        where: { id: orderId },
        data: {
          status: isPaid ? "PAID" : "CONFIRMED",
          stripeSessionId: session.id,
        },
      }),
      prisma.orderStatusHistory.create({
        data: {
          orderId,
          status: isPaid ? "PAID" : "CONFIRMED",
          note: `Payment ${isPaid ? "confirmed" : "received"} via Stripe (session: ${session.id})`,
        },
      }),
    ]);

    if (isPaid) {
      // Fire-and-forget — never blocks the webhook response
      void sendOrderConfirmation({
        to: order.user.email,
        customerName: order.user.name,
        orderId: order.id,
        items: order.items.map((i) => ({
          name: parseMLText(i.product.name).en,
          quantity: i.quantity,
          price: i.price,
        })),
        total: order.total,
        shippingAddress: order.shippingAddress,
      });
    }

    console.log(`[stripe webhook] Order ${orderId} → ${isPaid ? "PAID" : "CONFIRMED"}`);
  }

  // ── checkout.session.expired ───────────────────────────────────────────────
  // Customer didn't pay within Stripe's session window (24h by default).
  // Restore stock and cancel the order so inventory is unlocked.
  if (event.type === "checkout.session.expired") {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.orderId;
    if (!orderId) return NextResponse.json({ received: true });

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (order && order.status === "PENDING") {
      await prisma.$transaction(async (tx) => {
        // Restore each item's stock
        for (const item of order.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity }, inStock: true },
          });
        }
        await tx.order.update({
          where: { id: orderId },
          data: { status: "CANCELLED" },
        });
        await tx.orderStatusHistory.create({
          data: {
            orderId,
            status: "CANCELLED",
            note: "Stripe checkout session expired before payment",
          },
        });
      });
      console.log(`[stripe webhook] Order ${orderId} cancelled (session expired)`);
    }
  }

  // ── payment_intent.payment_failed ──────────────────────────────────────────
  if (event.type === "payment_intent.payment_failed") {
    const pi = event.data.object as Stripe.PaymentIntent;
    const orderId = pi.metadata?.orderId;
    console.warn(`[stripe webhook] payment failed — order: ${orderId ?? "unknown"}, reason: ${pi.last_payment_error?.message ?? "unknown"}`);
    // Order stays PENDING; customer can retry via a new checkout session
  }

  return NextResponse.json({ received: true });
}
