import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCustomerSession } from "@/lib/customer-auth";

const PRODUCT_SELECT = {
  id: true, name: true, description: true, price: true, originalPrice: true,
  category: true, categorySlug: true, image: true, images: true,
  badge: true, rating: true, reviews: true, inStock: true, stock: true,
};

function unauth() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

/** GET /api/cart — fetch logged-in user's cart with product details */
export async function GET() {
  const session = await getCustomerSession();
  if (!session) return unauth();

  const items = await prisma.cartItem.findMany({
    where: { userId: session.id },
    include: { product: { select: PRODUCT_SELECT } },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(
    items.map((i) => ({
      productId: i.productId,
      quantity: i.quantity,
      product: i.product,
    }))
  );
}

/** POST /api/cart — sync full cart (upsert present, delete absent) */
export async function POST(request: Request) {
  const session = await getCustomerSession();
  if (!session) return unauth();

  let body: { items: Array<{ productId: string; quantity: number }> };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalidBody" }, { status: 400 });
  }

  const validItems = (body.items ?? []).filter((i) => i.quantity > 0);

  await prisma.$transaction(async (tx) => {
    // Upsert provided items
    for (const item of validItems) {
      await tx.cartItem.upsert({
        where: { userId_productId: { userId: session.id, productId: item.productId } },
        create: { userId: session.id, productId: item.productId, quantity: item.quantity },
        update: { quantity: item.quantity, updatedAt: new Date() },
      });
    }
    // Remove items no longer in the cart
    const keepIds = validItems.map((i) => i.productId);
    await tx.cartItem.deleteMany({
      where: { userId: session.id, productId: { notIn: keepIds } },
    });
  });

  return NextResponse.json({ ok: true });
}

/** DELETE /api/cart — clear the entire cart */
export async function DELETE() {
  const session = await getCustomerSession();
  if (!session) return unauth();

  await prisma.cartItem.deleteMany({ where: { userId: session.id } });
  return NextResponse.json({ ok: true });
}
