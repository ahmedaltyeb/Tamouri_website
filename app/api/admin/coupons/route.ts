import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

function forbidden() {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

export async function GET() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return forbidden();

  const coupons = await prisma.coupon.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(coupons);
}

export async function POST(request: Request) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return forbidden();

  let body: {
    code?: string;
    type?: string;
    discount?: number;
    minOrderAmount?: number | null;
    maxUses?: number | null;
    active?: boolean;
    expiresAt?: string | null;
    description?: string | null;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const code = body.code?.trim().toUpperCase();
  if (!code) return NextResponse.json({ error: "Code is required" }, { status: 422 });

  const type = body.type === "fixed" ? "fixed" : "percentage";
  const discount = Number(body.discount ?? 0);
  if (isNaN(discount) || discount <= 0)
    return NextResponse.json({ error: "Discount must be a positive number" }, { status: 422 });
  if (type === "percentage" && discount > 100)
    return NextResponse.json({ error: "Percentage discount cannot exceed 100" }, { status: 422 });

  try {
    const coupon = await prisma.coupon.create({
      data: {
        code,
        type,
        discount,
        minOrderAmount: body.minOrderAmount ?? null,
        maxUses: body.maxUses ?? null,
        active: body.active ?? true,
        expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
        description: body.description?.trim() || null,
      },
    });
    return NextResponse.json(coupon, { status: 201 });
  } catch (e: unknown) {
    const isUniqueViolation =
      e instanceof Error && e.message.includes("Unique constraint");
    if (isUniqueViolation) {
      return NextResponse.json({ error: "Coupon code already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: "Failed to create coupon" }, { status: 500 });
  }
}
