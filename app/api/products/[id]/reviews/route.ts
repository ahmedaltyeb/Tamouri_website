import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCustomerSession } from "@/lib/customer-auth";

type Ctx = { params: Promise<{ id: string }> };

// ── GET /api/products/:id/reviews ─────────────────────────────────────────────
// Returns approved reviews for a product, newest first.
// Also returns whether the current customer has already reviewed it.
export async function GET(req: Request, { params }: Ctx) {
  const { id: productId } = await params;
  const url = new URL(req.url);
  const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1", 10));
  const limit = 10;
  const skip = (page - 1) * limit;

  const session = await getCustomerSession();

  const [reviews, total, myReview] = await Promise.all([
    prisma.review.findMany({
      where: { productId, approved: true },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      select: {
        id: true,
        rating: true,
        title: true,
        body: true,
        createdAt: true,
        user: { select: { name: true } },
      },
    }),
    prisma.review.count({ where: { productId, approved: true } }),
    session
      ? prisma.review.findUnique({
          where: { userId_productId: { userId: session.id, productId } },
          select: { id: true, rating: true, title: true, body: true, approved: true },
        })
      : null,
  ]);

  return NextResponse.json(
    { reviews, total, page, pages: Math.ceil(total / limit), myReview },
    { headers: { "Cache-Control": "no-store" } },
  );
}

// ── POST /api/products/:id/reviews ────────────────────────────────────────────
// Submits a new review. Requires customer login.
// One review per customer per product — returns 409 if already submitted.
export async function POST(req: Request, { params }: Ctx) {
  const session = await getCustomerSession();
  if (!session) {
    return NextResponse.json({ error: "loginRequired" }, { status: 401 });
  }

  const { id: productId } = await params;

  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true },
  });
  if (!product) {
    return NextResponse.json({ error: "productNotFound" }, { status: 404 });
  }

  let body: { rating?: number; title?: string; body?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalidBody" }, { status: 400 });
  }

  const { rating, title, body: reviewBody } = body;
  const errors: Record<string, string> = {};
  if (!rating || rating < 1 || rating > 5 || !Number.isInteger(rating)) {
    errors.rating = "Rating must be 1–5";
  }
  if (!title || title.trim().length < 3 || title.trim().length > 100) {
    errors.title = "Title must be 3–100 characters";
  }
  if (!reviewBody || reviewBody.trim().length < 10 || reviewBody.trim().length > 2000) {
    errors.body = "Review must be 10–2000 characters";
  }
  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ errors }, { status: 422 });
  }

  try {
    const review = await prisma.review.create({
      data: {
        productId,
        userId: session.id,
        rating: rating!,
        title: title!.trim(),
        body: reviewBody!.trim(),
        approved: false,
      },
      select: { id: true, rating: true, title: true, body: true, approved: true },
    });
    return NextResponse.json(review, { status: 201 });
  } catch (err: unknown) {
    // Unique constraint: already reviewed
    if ((err as { code?: string }).code === "P2002") {
      return NextResponse.json({ error: "alreadyReviewed" }, { status: 409 });
    }
    throw err;
  }
}
