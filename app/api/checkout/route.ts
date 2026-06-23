import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type CheckoutBody = {
  name: string;
  email: string;
  phone: string;
  address: string;
  notes?: string;
  items: Array<{ id: string; quantity: number }>;
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

  const { name, email, phone, address, notes, items } = body;

  // ── Validate ────────────────────────────────────────────────────────────────
  const errors: string[] = [];
  if (!name?.trim()) errors.push("Name is required");
  if (!email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    errors.push("Valid email is required");
  if (!phone?.trim()) errors.push("Phone is required");
  if (!address?.trim()) errors.push("Shipping address is required");
  if (!items?.length) errors.push("Cart is empty");
  if (errors.length) return NextResponse.json({ errors }, { status: 422 });

  // ── Verify products exist and fetch real prices ──────────────────────────────
  const productIds = items.map((i) => i.id);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, price: true, inStock: true, stock: true, name: true },
  });

  const productMap = new Map(products.map((p) => [p.id, p]));

  const missingIds = productIds.filter((id) => !productMap.has(id));
  if (missingIds.length)
    return err(`Products not found: ${missingIds.join(", ")}`, 422);

  const unavailable = items.filter((i) => {
    const p = productMap.get(i.id)!;
    return !p.inStock || p.stock < i.quantity;
  });
  if (unavailable.length) {
    const names = unavailable.map((i) => productMap.get(i.id)!.name).join(", ");
    return err(`Insufficient stock for: ${names}`, 422);
  }

  // ── Compute total using DB prices (never trust client) ──────────────────────
  const total = items.reduce((sum, i) => {
    const p = productMap.get(i.id)!;
    return sum + p.price * i.quantity;
  }, 0);

  // ── Upsert customer ──────────────────────────────────────────────────────────
  const user = await prisma.user.upsert({
    where: { email: email.trim().toLowerCase() },
    update: { name: name.trim(), phone: phone.trim() },
    create: {
      email: email.trim().toLowerCase(),
      name: name.trim(),
      phone: phone.trim(),
    },
  });

  // ── Create order + items + initial history in a transaction ─────────────────
  const roundedTotal = Math.round(total * 100) / 100;

  const order = await prisma.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: {
        userId: user.id,
        status: "PENDING",
        total: roundedTotal,
        shippingAddress: address.trim(),
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

    return created;
  });

  return NextResponse.json({ orderId: order.id }, { status: 201 });
}
