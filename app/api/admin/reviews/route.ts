import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const forbidden = () => NextResponse.json({ error: "Forbidden" }, { status: 403 });

// GET /api/admin/reviews?status=pending|approved|all&page=1
export async function GET(req: Request) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return forbidden();

  const url = new URL(req.url);
  const status = url.searchParams.get("status") ?? "pending";
  const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1", 10));
  const limit = 20;
  const skip = (page - 1) * limit;

  const where =
    status === "pending"
      ? { approved: false }
      : status === "approved"
        ? { approved: true }
        : {};

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      select: {
        id: true,
        rating: true,
        title: true,
        body: true,
        approved: true,
        createdAt: true,
        user: { select: { id: true, name: true, email: true } },
        product: { select: { id: true, name: true } },
      },
    }),
    prisma.review.count({ where }),
  ]);

  return NextResponse.json({ reviews, total, page, pages: Math.ceil(total / limit) });
}
