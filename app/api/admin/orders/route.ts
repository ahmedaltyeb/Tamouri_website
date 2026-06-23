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

export async function GET(request: Request) {
  if (!(await requireAdmin())) return unauthorized();

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search")?.trim() ?? "";
  const statusParam = searchParams.get("status") ?? "";
  const status =
    statusParam && VALID_STATUSES.has(statusParam as OrderStatus)
      ? (statusParam as OrderStatus)
      : undefined;

  const orders = await prisma.order.findMany({
    where: {
      AND: [
        status ? { status } : {},
        search
          ? {
              OR: [
                { id: { contains: search, mode: "insensitive" } },
                { user: { name: { contains: search, mode: "insensitive" } } },
                { user: { email: { contains: search, mode: "insensitive" } } },
              ],
            }
          : {},
      ],
    },
    include: {
      user: true,
      items: { include: { product: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(orders);
}
