import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import type { OrderStatus } from "@prisma/client";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

async function requireAdmin() {
  const session = await auth();
  return session?.user?.role === "ADMIN" ? session : null;
}

const VALID_STATUSES = new Set<OrderStatus>([
  "PENDING",
  "CONFIRMED",
  "PAID",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
]);

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await requireAdmin())) return unauthorized();

  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: true,
      items: { include: { product: true } },
      statusHistory: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(order);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await requireAdmin())) return unauthorized();

  const { id } = await params;
  const body = (await request.json()) as { status?: string; note?: string };

  if (!body.status || !VALID_STATUSES.has(body.status as OrderStatus)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 422 });
  }

  const existing = await prisma.order.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const newStatus = body.status as OrderStatus;

  // Update order and create history entry atomically
  const [order] = await prisma.$transaction([
    prisma.order.update({
      where: { id },
      data: { status: newStatus },
      include: {
        user: true,
        items: { include: { product: true } },
        statusHistory: { orderBy: { createdAt: "asc" } },
      },
    }),
    prisma.orderStatusHistory.create({
      data: {
        orderId: id,
        status: newStatus,
        note: body.note ?? null,
      },
    }),
  ]);

  return NextResponse.json(order);
}
