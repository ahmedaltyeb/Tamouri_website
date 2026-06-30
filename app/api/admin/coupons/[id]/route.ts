import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

function forbidden() {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return forbidden();

  const { id } = await params;

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

  const data: Record<string, unknown> = {};

  if (body.code !== undefined) data.code = body.code.trim().toUpperCase();
  if (body.type !== undefined) data.type = body.type === "fixed" ? "fixed" : "percentage";
  if (body.discount !== undefined) {
    const d = Number(body.discount);
    if (isNaN(d) || d <= 0)
      return NextResponse.json({ error: "Discount must be a positive number" }, { status: 422 });
    data.discount = d;
  }
  if ("minOrderAmount" in body) data.minOrderAmount = body.minOrderAmount ?? null;
  if ("maxUses" in body) data.maxUses = body.maxUses ?? null;
  if (body.active !== undefined) data.active = body.active;
  if ("expiresAt" in body)
    data.expiresAt = body.expiresAt ? new Date(body.expiresAt) : null;
  if ("description" in body) data.description = body.description?.trim() || null;

  try {
    const coupon = await prisma.coupon.update({ where: { id }, data });
    return NextResponse.json(coupon);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "";
    if (msg.includes("Record to update not found"))
      return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
    if (msg.includes("Unique constraint"))
      return NextResponse.json({ error: "Coupon code already exists" }, { status: 409 });
    return NextResponse.json({ error: "Failed to update coupon" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return forbidden();

  const { id } = await params;

  try {
    await prisma.coupon.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "";
    if (msg.includes("Record to delete does not exist"))
      return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
    return NextResponse.json({ error: "Failed to delete coupon" }, { status: 500 });
  }
}
