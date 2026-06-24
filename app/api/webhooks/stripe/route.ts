import { NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { sendOrderConfirmation } from "@/lib/email";
import { parseMLText } from "@/lib/products";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch {
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.orderId;

    if (!orderId) {
      return NextResponse.json({ error: "Missing orderId in metadata" }, { status: 400 });
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
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Idempotency: skip if already marked PAID
    if (order.status === "PAID") {
      return NextResponse.json({ received: true });
    }

    // Update status + history + decrement stock in one transaction
    await prisma.$transaction([
      prisma.order.update({
        where: { id: orderId },
        data: { status: "PAID" },
      }),
      prisma.orderStatusHistory.create({
        data: {
          orderId,
          status: "PAID",
          note: `Payment completed via Stripe (session: ${session.id})`,
        },
      }),
      ...order.items.map((item) =>
        prisma.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        })
      ),
    ]);

    // Fire-and-forget confirmation email — never blocks webhook response
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

  if (event.type === "payment_intent.payment_failed") {
    // Order stays PENDING — no action needed
    const pi = event.data.object as Stripe.PaymentIntent;
    console.log(`[stripe] payment_intent.payment_failed: ${pi.id}`);
  }

  return NextResponse.json({ received: true });
}
