import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCustomerSession } from "@/lib/customer-auth";

type Params = { params: Promise<{ id: string }> };

export async function DELETE(_request: Request, { params }: Params) {
  const session = await getCustomerSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  // id can be productId (for Zustand migration) or wishlistItem.id
  const byWishlist = await prisma.wishlistItem.findFirst({
    where: { id, userId: session.id },
  });
  const byProduct = !byWishlist
    ? await prisma.wishlistItem.findFirst({
        where: { productId: id, userId: session.id },
      })
    : null;

  const item = byWishlist ?? byProduct;
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.wishlistItem.delete({ where: { id: item.id } });
  return NextResponse.json({ ok: true });
}
