import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const forbidden = () => NextResponse.json({ error: "Forbidden" }, { status: 403 });

type Ctx = { params: Promise<{ id: string }> };

// PATCH /api/admin/reviews/:id  { approved: true | false }
// Approving a review recalculates product.rating + product.reviews atomically.
// Rejecting (unapproving) does the same.
export async function PATCH(req: Request, { params }: Ctx) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return forbidden();

  const { id } = await params;

  let body: { approved?: boolean };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalidBody" }, { status: 400 });
  }

  if (typeof body.approved !== "boolean") {
    return NextResponse.json({ error: "approved must be boolean" }, { status: 422 });
  }

  const existing = await prisma.review.findUnique({
    where: { id },
    select: { id: true, productId: true, approved: true },
  });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Run update + rating recalculation in one transaction
  const [review] = await prisma.$transaction([
    prisma.review.update({
      where: { id },
      data: { approved: body.approved },
      select: { id: true, approved: true, rating: true, title: true, productId: true },
    }),
    // Recalculate denormalized rating + review count from approved reviews
    prisma.$executeRaw`
      UPDATE "Product"
      SET
        rating  = COALESCE((
          SELECT AVG(rating::float)
          FROM "Review"
          WHERE "productId" = ${existing.productId} AND approved = true
        ), 0),
        reviews = (
          SELECT COUNT(*)::int
          FROM "Review"
          WHERE "productId" = ${existing.productId} AND approved = true
        )
      WHERE id = ${existing.productId}
    `,
  ]);

  return NextResponse.json(review);
}

// DELETE /api/admin/reviews/:id — hard delete
export async function DELETE(_req: Request, { params }: Ctx) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return forbidden();

  const { id } = await params;

  const existing = await prisma.review.findUnique({
    where: { id },
    select: { productId: true, approved: true },
  });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.$transaction([
    prisma.review.delete({ where: { id } }),
    prisma.$executeRaw`
      UPDATE "Product"
      SET
        rating  = COALESCE((
          SELECT AVG(rating::float)
          FROM "Review"
          WHERE "productId" = ${existing.productId} AND approved = true
        ), 0),
        reviews = (
          SELECT COUNT(*)::int
          FROM "Review"
          WHERE "productId" = ${existing.productId} AND approved = true
        )
      WHERE id = ${existing.productId}
    `,
  ]);

  return NextResponse.json({ ok: true });
}
