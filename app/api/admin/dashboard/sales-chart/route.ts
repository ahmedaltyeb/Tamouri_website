import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await auth();
  return session?.user?.role === "ADMIN" ? session : null;
}

export async function GET(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const days = Math.min(Math.max(parseInt(searchParams.get("days") ?? "30", 10), 7), 365);
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const rows = await prisma.$queryRaw<{ day: string; revenue: number; orders: bigint }[]>`
    SELECT
      TO_CHAR("createdAt" AT TIME ZONE 'UTC', 'YYYY-MM-DD') AS day,
      COALESCE(SUM(total), 0)::float AS revenue,
      COUNT(*)::bigint AS orders
    FROM "Order"
    WHERE "createdAt" >= ${since}
      AND status IN ('PAID', 'DELIVERED')
    GROUP BY day
    ORDER BY day ASC
  `;

  // Fill in missing days with 0
  const map = new Map(rows.map((r) => [r.day, { revenue: r.revenue, orders: Number(r.orders) }]));
  const labels: string[] = [];
  const revenue: number[] = [];
  const orders: number[] = [];

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    const key = d.toISOString().slice(0, 10);
    labels.push(key);
    revenue.push(map.get(key)?.revenue ?? 0);
    orders.push(map.get(key)?.orders ?? 0);
  }

  return NextResponse.json({ labels, revenue, orders });
}
