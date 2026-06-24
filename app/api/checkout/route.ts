import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCustomerSession } from "@/lib/customer-auth";

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
  // Coupon discount (validated server-side against VALID_COUPONS)
  coupon?: string;
};

const VALID_COUPONS: Record<string, number> = {
  TAMOURI10: 10,
  WELCOME5: 5,
  UAE15: 15,
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

  // Apply coupon if valid
  let discountPct = 0;
  if (coupon) {
    discountPct = VALID_COUPONS[coupon.trim().toUpperCase()] ?? 0;
  }
  const discountAmount = Math.round(subtotal * (discountPct / 100) * 100) / 100;
  const total = Math.round((subtotal - discountAmount + shipping) * 100) / 100;

  // ── Create order in transaction ──────────────────────────────────────────────
  const order = await prisma.$transaction(async (tx) => {
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

    // Clear DB cart for logged-in user
    if (session) {
      await tx.cartItem.deleteMany({ where: { userId } });
    }

    return created;
  });

  return NextResponse.json({ orderId: order.id }, { status: 201 });
}
