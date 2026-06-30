import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCustomerSession } from "@/lib/customer-auth";
import { validateCoupon } from "@/lib/coupons";
import { checkoutRateLimit, getIp } from "@/lib/rate-limit";
import { getStripe, stripeEnabled } from "@/lib/stripe";
import { parseMLText } from "@/lib/products";
import type Stripe from "stripe";

type CheckoutBody = {
  // Guest fields (required when not logged in)
  name?: string;
  email?: string;
  phone?: string;
  // Address: either a saved addressId OR a free-text address string
  addressId?: string;
  address?: string;
  notes?: string;
  items: Array<{ id: string; quantity: number }>;
  coupon?: string;
};

function err(msg: string, status = 400) {
  return NextResponse.json({ error: msg }, { status });
}

export async function POST(request: Request) {
  let body: CheckoutBody;
  try {
    body = (await request.json()) as CheckoutBody;
  } catch {
    return err("Invalid JSON");
  }

  const { items, notes, coupon } = body;
  if (!items?.length) return err("Cart is empty", 422);

  // Rate limit: 10 checkout attempts per IP per hour
  const rl = await checkoutRateLimit(getIp(request));
  if (!rl.allowed) return err("Too many requests — please try again later", 429);

  // ── Resolve customer ─────────────────────────────────────────────────────────
  const session = await getCustomerSession();

  let userId: string;
  let resolvedName: string;
  let resolvedEmail: string;
  let resolvedPhone: string;

  if (session) {
    // Logged-in customer
    const user = await prisma.user.findUnique({
      where: { id: session.id },
      select: { id: true, name: true, email: true, phone: true },
    });
    if (!user) return err("User not found", 401);
    userId = user.id;
    resolvedName = body.name?.trim() || user.name;
    resolvedEmail = user.email;
    resolvedPhone = body.phone?.trim() || user.phone || "";
  } else {
    // Guest checkout — require all fields
    const errors: string[] = [];
    if (!body.name?.trim()) errors.push("Name is required");
    if (!body.email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email))
      errors.push("Valid email is required");
    if (!body.phone?.trim()) errors.push("Phone is required");
    if (errors.length) return NextResponse.json({ errors }, { status: 422 });

    resolvedName = body.name!.trim();
    resolvedEmail = body.email!.trim().toLowerCase();
    resolvedPhone = body.phone!.trim();

    const user = await prisma.user.upsert({
      where: { email: resolvedEmail },
      update: { name: resolvedName, phone: resolvedPhone },
      create: { email: resolvedEmail, name: resolvedName, phone: resolvedPhone },
    });
    userId = user.id;
  }

  // ── Resolve shipping address ─────────────────────────────────────────────────
  let shippingAddress: string;

  if (body.addressId) {
    const addr = await prisma.address.findUnique({ where: { id: body.addressId } });
    if (!addr || addr.userId !== userId) return err("Address not found", 422);
    shippingAddress = [
      addr.fullName,
      addr.phone,
      addr.line1,
      addr.line2,
      addr.city,
      addr.emirate,
    ]
      .filter(Boolean)
      .join(", ");
  } else if (body.address?.trim()) {
    shippingAddress = body.address.trim();
  } else {
    return err("Shipping address is required", 422);
  }

  // ── Verify products + stock ──────────────────────────────────────────────────
  const productIds = items.map((i) => i.id);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, price: true, inStock: true, stock: true, name: true },
  });

  const productMap = new Map(products.map((p) => [p.id, p]));
  const missingIds = productIds.filter((id) => !productMap.has(id));
  if (missingIds.length) return err(`Products not found: ${missingIds.join(", ")}`, 422);

  const unavailable = items.filter((i) => {
    const p = productMap.get(i.id)!;
    return !p.inStock || p.stock < i.quantity;
  });
  if (unavailable.length) {
    const names = unavailable.map((i) => productMap.get(i.id)!.name).join(", ");
    return err(`Insufficient stock for: ${names}`, 422);
  }

  // ── Compute total (server-side prices only) ──────────────────────────────────
  let subtotal = items.reduce((sum, i) => sum + productMap.get(i.id)!.price * i.quantity, 0);
  const shipping = subtotal > 200 ? 0 : 15;

  // Apply coupon if valid — always re-validated server-side (never trust client)
  const couponResult = coupon ? await validateCoupon(coupon) : null;

  let discountAmount = 0;
  if (couponResult?.valid) {
    if (couponResult.minOrderAmount !== null && subtotal < couponResult.minOrderAmount) {
      return err(
        `Minimum order of ${couponResult.minOrderAmount} AED required for this coupon`,
        422,
      );
    }
    if (couponResult.type === "fixed") {
      discountAmount = Math.min(couponResult.discount, subtotal); // cannot exceed subtotal
    } else {
      discountAmount = Math.round(subtotal * (couponResult.discount / 100) * 100) / 100;
    }
  }

  const total = Math.round((subtotal - discountAmount + shipping) * 100) / 100;

  // ── Create order in transaction ──────────────────────────────────────────────
  let order: Awaited<ReturnType<typeof prisma.order.create>>;
  try {
    order = await prisma.$transaction(async (tx) => {
      // ── 1. Decrement stock with optimistic locking ────────────────────────
      // updateMany WHERE stock >= quantity: if count === 0, another request
      // bought the last unit after our validation check above. Throw so Prisma
      // rolls back the entire transaction (no order created, no stock touched).
      for (const item of items) {
        const result = await tx.product.updateMany({
          where: { id: item.id, stock: { gte: item.quantity } },
          data: { stock: { decrement: item.quantity } },
        });

        if (result.count === 0) {
          const raw = productMap.get(item.id)!.name;
          let displayName: string;
          try {
            displayName = (JSON.parse(raw as string) as { en?: string }).en ?? String(raw);
          } catch {
            displayName = String(raw);
          }
          throw new Error(`"${displayName}" just sold out — please remove it from your cart`);
        }
      }

      // ── 2. Mark inStock = false for products that just reached 0 ─────────
      await tx.product.updateMany({
        where: { id: { in: productIds }, stock: { lte: 0 } },
        data: { inStock: false },
      });

      // ── 3. Create the order ───────────────────────────────────────────────
      const created = await tx.order.create({
        data: {
          userId,
          status: "PENDING",
          total,
          shippingAddress,
          notes: notes?.trim() || null,
          items: {
            create: items.map((i) => ({
              productId: i.id,
              quantity: i.quantity,
              price: productMap.get(i.id)!.price,
            })),
          },
        },
        include: { items: true },
      });

      await tx.orderStatusHistory.create({
        data: { orderId: created.id, status: "PENDING", note: "Order placed" },
      });

      // Increment coupon usage counter atomically inside the transaction
      if (couponResult?.couponId) {
        await tx.coupon.update({
          where: { id: couponResult.couponId },
          data: { usedCount: { increment: 1 } },
        });
      }

      // Clear DB cart for logged-in user
      if (session) {
        await tx.cartItem.deleteMany({ where: { userId } });
      }

      return created;
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Order could not be completed";
    // Stock-out errors are user-facing (422); everything else is a server fault
    const isStockError = message.includes("just sold out");
    return NextResponse.json({ error: message }, { status: isStockError ? 422 : 500 });
  }

  // ── COD mode (no Stripe keys) ────────────────────────────────────────────────
  if (!stripeEnabled()) {
    return NextResponse.json({ orderId: order.id }, { status: 201 });
  }

  // ── Stripe Checkout Session ──────────────────────────────────────────────────
  const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
  const stripe = getStripe();

  // Build line items from DB products (server-side prices only)
  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] =
    items.map((item) => {
      const product = productMap.get(item.id)!;
      const name = parseMLText(product.name as string);
      return {
        price_data: {
          currency: "aed",
          unit_amount: Math.round(product.price * 100), // fils (AED × 100)
          product_data: { name: name.en || name.ar || String(product.name) },
        },
        quantity: item.quantity,
      };
    });

  // Shipping as a line item
  if (shipping > 0) {
    lineItems.push({
      price_data: {
        currency: "aed",
        unit_amount: Math.round(shipping * 100),
        product_data: { name: "Shipping" },
      },
      quantity: 1,
    });
  }

  // Discount: create a one-time Stripe coupon so the hosted page shows the breakdown
  let stripeCouponId: string | undefined;
  if (discountAmount > 0) {
    const sc = await stripe.coupons.create({
      amount_off: Math.round(discountAmount * 100),
      currency: "aed",
      duration: "once",
      name: coupon ? `Coupon: ${coupon.toUpperCase()}` : "Discount",
    });
    stripeCouponId = sc.id;
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "payment",
    currency: "aed",
    line_items: lineItems,
    ...(stripeCouponId ? { discounts: [{ coupon: stripeCouponId }] } : {}),
    customer_email: resolvedEmail,
    metadata: { orderId: order.id },
    success_url: `${BASE}/order-success?id=${order.id}&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${BASE}/checkout?cancelled=1`,
    payment_intent_data: {
      // Store orderId so webhooks can find the order even without metadata
      metadata: { orderId: order.id },
    },
  });

  // Persist the Stripe session ID on the order
  await prisma.order.update({
    where: { id: order.id },
    data: { stripeSessionId: checkoutSession.id },
  });

  return NextResponse.json(
    { orderId: order.id, sessionUrl: checkoutSession.url },
    { status: 201 },
  );
}
