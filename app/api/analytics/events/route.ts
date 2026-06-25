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
  const days = Math.min(parseInt(searchParams.get("days") ?? "30", 10), 365);
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const [
    eventCounts,
    topProducts,
    dailyTrend,
  ] = await Promise.all([
    // Total count per event type in the period
    prisma.analyticsEvent.groupBy({
      by: ["event"],
      where: { createdAt: { gte: since } },
      _count: { _all: true },
    }),

    // Top 10 products by product_view events
    prisma.analyticsEvent.groupBy({
      by: ["productId"],
      where: {
        event: "product_view",
        productId: { not: null },
        createdAt: { gte: since },
      },
      _count: { _all: true },
      orderBy: { _count: { productId: "desc" } },
      take: 10,
    }),

    // Daily event counts for trend chart (last N days)
    prisma.$queryRaw<{ day: string; event: string; count: bigint }[]>`
      SELECT
        TO_CHAR("createdAt" AT TIME ZONE 'UTC', 'YYYY-MM-DD') AS day,
        event,
        COUNT(*)::bigint AS count
      FROM "AnalyticsEvent"
      WHERE "createdAt" >= ${since}
      GROUP BY day, event
      ORDER BY day ASC
    `,
  ]);

  // Resolve product names for top-product rows
  const productIds = topProducts.map((r) => r.productId).filter(Boolean) as string[];
  const products = productIds.length
    ? await prisma.product.findMany({
        where: { id: { in: productIds } },
        select: { id: true, name: true, image: true },
      })
    : [];
  const productMap = Object.fromEntries(products.map((p) => [p.id, p]));

  const countsMap = Object.fromEntries(
    eventCounts.map((r) => [r.event, r._count._all])
  );

  return NextResponse.json({
    days,
    period: { from: since.toISOString(), to: new Date().toISOString() },
    counts: {
      page_view:            countsMap["page_view"] ?? 0,
      product_view:         countsMap["product_view"] ?? 0,
      add_to_cart:          countsMap["add_to_cart"] ?? 0,
      remove_from_cart:     countsMap["remove_from_cart"] ?? 0,
      checkout_start:       countsMap["checkout_start"] ?? 0,
      purchase_completed:   countsMap["purchase_completed"] ?? 0,
    },
    topProducts: topProducts.map((r) => ({
      productId: r.productId,
      views: r._count._all,
      product: r.productId ? productMap[r.productId] ?? null : null,
    })),
    dailyTrend: dailyTrend.map((r) => ({
      day: r.day,
      event: r.event,
      count: Number(r.count),
    })),
  });
}
