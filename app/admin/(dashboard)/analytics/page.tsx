import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { parseMLText } from "@/lib/products";

export const dynamic = "force-dynamic";

// ── Helpers ───────────────────────────────────────────────────────────────────

function pct(num: number, den: number): string {
  if (den === 0) return "0%";
  return `${((num / den) * 100).toFixed(1)}%`;
}

function fmtNum(n: number): string {
  return n.toLocaleString("en-AE");
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ days?: string }>;
}) {
  const sp = await searchParams;
  const days = Math.min(parseInt(sp.days ?? "30", 10), 365);
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  // ── Aggregate queries ─────────────────────────────────────────────────────

  const [
    eventCounts,
    topProductRows,
    recentEvents,
    dailyTrend,
  ] = await Promise.all([
    prisma.analyticsEvent.groupBy({
      by: ["event"],
      where: { createdAt: { gte: since } },
      _count: { _all: true },
    }),

    prisma.analyticsEvent.groupBy({
      by: ["productId"],
      where: {
        event: "product_view",
        productId: { not: null },
        createdAt: { gte: since },
      },
      _count: { _all: true },
      orderBy: { _count: { productId: "desc" } },
      take: 8,
    }),

    prisma.analyticsEvent.findMany({
      where: { createdAt: { gte: since } },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: { id: true, event: true, productId: true, sessionId: true, createdAt: true },
    }),

    prisma.$queryRaw<{ day: string; event: string; count: bigint }[]>`
      SELECT
        TO_CHAR("createdAt" AT TIME ZONE 'UTC', 'YYYY-MM-DD') AS day,
        event,
        COUNT(*)::bigint AS count
      FROM "AnalyticsEvent"
      WHERE "createdAt" >= ${since}
        AND event IN ('page_view','product_view','add_to_cart','checkout_start')
      GROUP BY day, event
      ORDER BY day ASC
    `,
  ]);

  // Resolve product details for top products
  const topProductIds = topProductRows.map((r) => r.productId).filter(Boolean) as string[];
  const topProducts = topProductIds.length
    ? await prisma.product.findMany({
        where: { id: { in: topProductIds } },
        select: { id: true, name: true, image: true, category: true },
      })
    : [];
  const productMap = Object.fromEntries(topProducts.map((p) => [p.id, p]));

  // Build counts map
  const counts = Object.fromEntries(eventCounts.map((r) => [r.event, r._count._all])) as
    Record<string, number>;

  const pageViews      = counts["page_view"]          ?? 0;
  const productViews   = counts["product_view"]        ?? 0;
  const addToCartCount = counts["add_to_cart"]         ?? 0;
  const checkoutStart  = counts["checkout_start"]      ?? 0;
  const purchases      = counts["purchase_completed"]  ?? 0;

  // Build daily chart data (last 7 days always shown; more with longer period)
  const chartDays = days <= 7 ? 7 : days <= 30 ? 30 : days;
  const dayLabels: string[] = [];
  for (let i = chartDays - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86_400_000);
    dayLabels.push(d.toISOString().slice(0, 10));
  }

  type EventKey = "page_view" | "product_view" | "add_to_cart" | "checkout_start";
  const trendMap: Record<string, Record<EventKey, number>> = {};
  for (const r of dailyTrend) {
    if (!trendMap[r.day]) trendMap[r.day] = { page_view: 0, product_view: 0, add_to_cart: 0, checkout_start: 0 };
    trendMap[r.day][r.event as EventKey] = Number(r.count);
  }

  const maxTrend = Math.max(
    1,
    ...Object.values(trendMap).map((d) => d.page_view + d.product_view)
  );

  const DAY_LABELS = dayLabels.slice(-Math.min(14, dayLabels.length));

  return (
    <div className="p-6 space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-stone-800">Analytics</h1>
          <p className="text-sm text-stone-500 mt-0.5">
            Behavior tracking — last {days} days
          </p>
        </div>
        {/* Date range tabs */}
        <div className="flex items-center gap-1 bg-stone-100 rounded-xl p-1">
          {[7, 30, 90].map((d) => (
            <Link
              key={d}
              href={`/admin/analytics?days=${d}`}
              className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                days === d
                  ? "bg-white text-stone-800 shadow-sm"
                  : "text-stone-500 hover:text-stone-700"
              }`}
            >
              {d}d
            </Link>
          ))}
        </div>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
        <StatCard label="Page Views"    value={fmtNum(pageViews)}      accent="blue"    icon="👁" />
        <StatCard label="Product Views" value={fmtNum(productViews)}   accent="amber"   icon="📦" />
        <StatCard label="Add to Cart"   value={fmtNum(addToCartCount)} accent="green"   icon="🛒" />
        <StatCard label="Checkout Start" value={fmtNum(checkoutStart)} accent="violet"  icon="💳" />
        <StatCard label="Purchases"     value={fmtNum(purchases)}      accent="emerald" icon="✅" />
      </div>

      {/* Conversion funnel */}
      <div className="bg-white border border-stone-200 rounded-2xl p-6">
        <h2 className="text-sm font-bold text-stone-800 mb-5">Conversion Funnel</h2>
        <div className="space-y-3">
          {[
            { label: "Product Views",  value: productViews,   base: productViews,  color: "bg-amber-400" },
            { label: "Add to Cart",    value: addToCartCount, base: productViews,  color: "bg-blue-400" },
            { label: "Checkout Start", value: checkoutStart,  base: productViews,  color: "bg-violet-400" },
            { label: "Purchases",      value: purchases,      base: productViews,  color: "bg-emerald-400" },
          ].map((row) => (
            <div key={row.label} className="flex items-center gap-4">
              <div className="w-32 text-xs font-semibold text-stone-600 flex-none">{row.label}</div>
              <div className="flex-1 bg-stone-100 rounded-full h-3">
                <div
                  className={`h-3 rounded-full ${row.color} transition-all`}
                  style={{ width: `${row.base > 0 ? (row.value / row.base) * 100 : 0}%` }}
                />
              </div>
              <div className="w-24 text-right flex-none">
                <span className="text-sm font-bold text-stone-800">{fmtNum(row.value)}</span>
                <span className="text-xs text-stone-400 ms-1.5">{pct(row.value, row.base)}</span>
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-stone-400 mt-4">
          Add-to-cart rate: <strong>{pct(addToCartCount, productViews)}</strong> ·
          Checkout rate: <strong>{pct(checkoutStart, addToCartCount)}</strong> ·
          Purchase rate: <strong>{pct(purchases, checkoutStart)}</strong>
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Daily trend — last 14 days max */}
        <div className="bg-white border border-stone-200 rounded-2xl p-6">
          <h2 className="text-sm font-bold text-stone-800 mb-4">
            Daily Trend
            <span className="text-xs font-normal text-stone-400 ms-2">
              (showing last {DAY_LABELS.length} days)
            </span>
          </h2>

          {DAY_LABELS.length === 0 ? (
            <p className="text-sm text-stone-400 text-center py-8">No data yet</p>
          ) : (
            <div className="space-y-2">
              {DAY_LABELS.map((day) => {
                const d = trendMap[day] ?? { page_view: 0, product_view: 0, add_to_cart: 0, checkout_start: 0 };
                const total = d.page_view + d.product_view;
                const barPct = maxTrend > 0 ? (total / maxTrend) * 100 : 0;
                return (
                  <div key={day} className="flex items-center gap-3 text-xs">
                    <span className="w-20 text-stone-400 flex-none font-mono">
                      {day.slice(5)} {/* MM-DD */}
                    </span>
                    <div className="flex-1 bg-stone-100 rounded-full h-2">
                      <div
                        className="h-2 rounded-full bg-amber-400"
                        style={{ width: `${barPct}%` }}
                      />
                    </div>
                    <span className="w-8 text-right text-stone-600 font-semibold flex-none">
                      {fmtNum(total)}
                    </span>
                    <span className="w-14 text-right text-stone-400 flex-none">
                      🛒{d.add_to_cart}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Top products by views */}
        <div className="bg-white border border-stone-200 rounded-2xl p-6">
          <h2 className="text-sm font-bold text-stone-800 mb-4">Top Products by Views</h2>
          {topProductRows.length === 0 ? (
            <p className="text-sm text-stone-400 text-center py-8">No product views yet</p>
          ) : (
            <div className="space-y-3">
              {topProductRows.map((row, i) => {
                const product = row.productId ? productMap[row.productId] : null;
                const maxViews = topProductRows[0]?._count._all ?? 1;
                const barPct = (row._count._all / maxViews) * 100;
                return (
                  <div key={row.productId ?? i} className="flex items-center gap-3">
                    <span className="text-xs font-bold text-stone-400 w-4 flex-none">
                      {i + 1}
                    </span>
                    {product?.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={product.image}
                        alt=""
                        className="w-8 h-8 rounded-lg object-cover bg-stone-100 flex-none"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-stone-100 flex-none" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-stone-800 truncate">
                        {product ? parseMLText(product.name).en : row.productId ?? "Unknown"}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <div className="flex-1 bg-stone-100 rounded-full h-1.5">
                          <div
                            className="h-1.5 rounded-full bg-amber-400"
                            style={{ width: `${barPct}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-stone-700 w-10 text-right flex-none">
                      {fmtNum(row._count._all)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Recent events feed */}
      <div className="bg-white border border-stone-200 rounded-2xl p-6">
        <h2 className="text-sm font-bold text-stone-800 mb-4">Recent Events</h2>
        {recentEvents.length === 0 ? (
          <p className="text-sm text-stone-400 text-center py-8">
            No events yet. Events appear here as users browse the store.
          </p>
        ) : (
          <div className="space-y-1 max-h-72 overflow-y-auto">
            {recentEvents.map((ev) => (
              <div
                key={ev.id}
                className="flex items-center gap-3 py-1.5 px-2 rounded-lg hover:bg-stone-50 transition-colors text-xs"
              >
                <EventBadge event={ev.event} />
                <span className="font-mono text-stone-400 flex-none">
                  {ev.sessionId?.slice(0, 8) ?? "—"}
                </span>
                <span className="text-stone-500 flex-none">
                  {ev.productId ? `product: ${ev.productId.slice(0, 8)}` : ""}
                </span>
                <span className="text-stone-400 ms-auto flex-none">
                  {new Date(ev.createdAt).toLocaleTimeString("en-AE", { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  accent,
  icon,
}: {
  label: string;
  value: string;
  accent: "blue" | "amber" | "green" | "violet" | "emerald";
  icon: string;
}) {
  const bg: Record<string, string> = {
    blue: "bg-blue-50 text-blue-600",
    amber: "bg-amber-50 text-amber-600",
    green: "bg-green-50 text-green-600",
    violet: "bg-violet-50 text-violet-600",
    emerald: "bg-emerald-50 text-emerald-600",
  };
  return (
    <div className="bg-white border border-stone-200 rounded-2xl p-4 flex items-start gap-3">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-base flex-none ${bg[accent]}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-stone-500 leading-tight">{label}</p>
        <p className="text-xl font-black text-stone-900 mt-0.5 leading-none">{value}</p>
      </div>
    </div>
  );
}

const EVENT_STYLES: Record<string, string> = {
  page_view:           "bg-blue-100 text-blue-700",
  product_view:        "bg-amber-100 text-amber-700",
  add_to_cart:         "bg-green-100 text-green-700",
  remove_from_cart:    "bg-red-100 text-red-600",
  checkout_start:      "bg-violet-100 text-violet-700",
  purchase_completed:  "bg-emerald-100 text-emerald-700",
};

function EventBadge({ event }: { event: string }) {
  const cls = EVENT_STYLES[event] ?? "bg-stone-100 text-stone-600";
  return (
    <span className={`px-2 py-0.5 rounded-full font-semibold text-[10px] flex-none ${cls}`}>
      {event.replace(/_/g, " ")}
    </span>
  );
}
