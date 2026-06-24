import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { parseMLText } from "@/lib/products";

export async function POST(request: Request) {
  const body = (await request.json()) as { orderId?: string };
  const { orderId } = body;

  if (!orderId) {
    return NextResponse.json({ error: "orderId required" }, { status: 400 });
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: { include: { product: true } } },
  });

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  // If a session was already created for this order, retrieve and return it
  if (order.stripeSessionId) {
    const existing = await stripe.checkout.sessions.retrieve(
      order.stripeSessionId
    );
    if (existing.url) {
      return NextResponse.json({ url: existing.url });
    }
  }

  const origin = new URL(request.url).origin;

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    line_items: order.items.map((item) => ({
      price_data: {
        currency: "aed",
        product_data: {
          name: parseMLText(item.product.name).en,
          ...(item.product.image.startsWith("https://")
            ? { images: [item.product.image] }
            : {}),
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    })),
    metadata: { orderId: order.id },
    success_url: `${origin}/order-success?id=${order.id}`,
    cancel_url: `${origin}/checkout`,
  });

  // Persist session ID so the webhook can find the order
  await prisma.order.update({
    where: { id: orderId },
    data: { stripeSessionId: session.id },
  });

  return NextResponse.json({ url: session.url });
}
