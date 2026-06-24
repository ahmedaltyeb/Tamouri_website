import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCustomerSession } from "@/lib/customer-auth";

export async function GET() {
  const session = await getCustomerSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const items = await prisma.wishlistItem.findMany({
    where: { userId: session.id },
    orderBy: { createdAt: "desc" },
    include: {
      product: {
        select: {
          id: true, name: true, price: true, originalPrice: true,
          image: true, images: true, category: true, categorySlug: true,
          inStock: true, rating: true, reviews: true, badge: true, stock: true,
        },
      },
    },
  });

  return NextResponse.json(items.map((i) => ({ wishlistId: i.id, ...i.product })));
}

export async function POST(request: Request) {
  const session = await getCustomerSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: { productId?: string };
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "invalidBody" }, { status: 400 });
  }

  if (!body.productId) {
    return NextResponse.json({ error: "productId required" }, { status: 422 });
  }

  const product = await prisma.product.findUnique({ where: { id: body.productId } });
  if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

  // upsert — idempotent
  const item = await prisma.wishlistItem.upsert({
    where: { userId_productId: { userId: session.id, productId: body.productId } },
    create: { userId: session.id, productId: body.productId },
    update: {},
  });

  return NextResponse.json(item, { status: 201 });
}
