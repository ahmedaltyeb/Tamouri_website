import Link from "next/link";
import { prisma } from "@/lib/prisma";
import type { OrderStatus } from "@prisma/client";
import StatusBadge from "./orders/_components/StatusBadge";
import { parseMLText } from "@/lib/products";
import SalesChart from "./_widgets/SalesChart";
import QuickActions from "./_widgets/QuickActions";

export const dynamic = "force-dynamic";

type TopProduct = { productId: string; revenue: number; units: bigint };

const STATUS_ORDER: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "PAID",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

export default async function AdminDashboardPage() {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

  const [
    totalRevenue,
    monthRevenue,
    lastMonthRevenue,
    todayRevenue,
    todayCount,
    pendingCount,
    totalOrders,
    productCount,
    customerCount,
    newCustomersToday,
    newCustomersWeek,
    statusGroups,
    recentOrders,
    topProductsRaw,
    lowStockProducts,
    stalePendingOrders,
    recentCustomers,
  ] = await Promise.all([
    prisma.order.aggregate({
      _sum: { total: true },
      where: { status: { in: ["PAID", "DELIVERED"] } },
    }),
    prisma.order.aggregate({
      _sum: { total: true },
      where: { status: { in: ["PAID", "DELIVERED"] }, createdAt: { gte: startOfMonth } },
    }),
    prisma.order.aggregate({
      _sum: { total: true },
      where: { status: { in: ["PAID", "DELIVERED"] }, createdAt: { gte: lastMonthStart, lte: lastMonthEnd } },
    }),
    prisma.order.aggregate({
      _sum: { total: true },
      where: { status: { in: ["PAID", "DELIVERED"] }, createdAt: { gte: startOfToday } },
    }),
    prisma.order.count({ where: { createdAt: { gte: startOfToday } } }),
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.order.count({ where: { status: { in: ["PAID", "DELIVERED"] } } }),
    prisma.product.count(),
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: startOfToday } } }),
    prisma.user.count({ where: { createdAt: { gte: startOfWeek } } }),
    prisma.order.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.order.findMany({
      take: 8,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true } } },
    }),
    prisma.$queryRaw<TopProduct[]>`
      SELECT oi."productId",
             SUM(oi.price * oi.quantity)::float AS revenue,
             SUM(oi.quantity) AS units
      FROM "OrderItem" oi
      JOIN "Order" o ON o.id = oi."orderId"
      WHERE o.status IN ('PAID', 'DELIVERED')
      GROUP BY oi."productId"
      ORDER BY revenue DESC
      LIMIT 5
    `,
    prisma.product.findMany({
      where: { inStock: true, stock: { lte: 5 } },
      select: { id: true, name: true, stock: true },
      orderBy: { stock: "asc" },
      take: 5,
    }),
    prisma.order.findMany({
      where: { status: "PENDING", createdAt: { lt: twoDaysAgo } },
      select: { id: true, createdAt: true, total: true, user: { select: { name: true } } },
      orderBy: { createdAt: "asc" },
      take: 5,
    }),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, name: true, email: true, createdAt: true },
    }),
  ]);

  const statusMap = Object.fromEntries(
    statusGroups.map((g) => [g.status, g._count._all])
  ) as Partial<Record<OrderStatus, number>>;

  const topProductIds = topProductsRaw.map((r) => r.productId);
  const topProductDetails = await prisma.product.findMany({
    where: { id: { in: topProductIds } },
    select: { id: true, name: true, image: true, category: true },
  });
  const productMap = Object.fromEntries(topProductDetails.map((p) => [p.id, p]));

  const totalRev = totalRevenue._sum.total ?? 0;
  const monthRev = monthRevenue._sum.total ?? 0;
  const lastMonthRev = lastMonthRevenue._sum.total ?? 0;
  const todayRev = todayRevenue._sum.total ?? 0;
  const aov = totalOrders > 0 ? totalRev / totalOrders : 0;

  const monthVsLastMonth = lastMonthRev > 0
    ? ((monthRev - lastMonthRev) / lastMonthRev) * 100
    : null;

  const maxRevenue = topProductsRaw[0]?.revenue ?? 1;

  // Time-since helper
  function timeAgo(d: Date): string {
    const hrs = Math.floor((now.getTime() - d.getTime()) / 3600000);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  }

  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-stone-900">Dashboard</h1>
          <p className="text-sm text-stone-500 mt-0.5">
            {now.toLocaleDateString("en-AE", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        {/* Live indicator */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-100 rounded-full">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="text-xs font-semibold text-emerald-700">Live</span>
        </div>
      </div>

      {/* ── KPI Row 1: Revenue ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard
          label="Total Revenue"
          value={`${totalRev.toLocaleString("en-AE", { maximumFractionDigits: 0 })} AED`}
          sub="Paid & delivered orders"
          accent="emerald"
          icon={<RevenueIcon />}
        />
        <KpiCard
          label="This Month"
          value={`${monthRev.toLocaleString("en-AE", { maximumFractionDigits: 0 })} AED`}
          sub={
            monthVsLastMonth !== null
              ? `${monthVsLastMonth >= 0 ? "▲" : "▼"} ${Math.abs(monthVsLastMonth).toFixed(1)}% vs last month`
              : "Revenue in current month"
          }
          subColor={
            monthVsLastMonth !== null
              ? monthVsLastMonth >= 0
                ? "text-emerald-600"
                : "text-red-500"
              : undefined
          }
          accent="teal"
          icon={<CalendarIcon />}
        />
        <KpiCard
          label="Today's Revenue"
          value={`${todayRev.toLocaleString("en-AE", { maximumFractionDigits: 0 })} AED`}
          sub={`${todayCount} order${todayCount !== 1 ? "s" : ""} today`}
          accent="blue"
          icon={<SunIcon />}
        />
        <KpiCard
          label="Avg Order Value"
          value={`${aov.toLocaleString("en-AE", { maximumFractionDigits: 0 })} AED`}
          sub={`Across ${totalOrders} completed orders`}
          accent="amber"
          icon={<AovIcon />}
        />
      </div>

      {/* ── KPI Row 2: Operations ──────────────────────────────────────────── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard
          label="Pending Orders"
          value={String(pendingCount)}
          sub={pendingCount > 0 ? "Needs attention" : "All clear"}
          accent={pendingCount > 0 ? "amber" : "stone"}
          icon={<PendingIcon />}
          alert={pendingCount > 0}
        />
        <KpiCard
          label="Products"
          value={String(productCount)}
          sub="Active catalogue"
          accent="stone"
          icon={<ProductIcon />}
        />
        <KpiCard
          label="Customers"
          value={String(customerCount)}
          sub="Registered via checkout"
          accent="violet"
          icon={<CustomerIcon />}
        />
        <KpiCard
          label="New This Week"
          value={String(newCustomersWeek)}
          sub={`${newCustomersToday} registered today`}
          accent={newCustomersWeek > 0 ? "violet" : "stone"}
          icon={<UserPlusIcon />}
        />
      </div>

      {/* ── Sales Analytics Chart ──────────────────────────────────────────── */}
      <SalesChart />

      {/* ── Alerts Row ────────────────────────────────────────────────────── */}
      {(stalePendingOrders.length > 0 || lowStockProducts.length > 0) && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {/* Stale pending orders */}
          {stalePendingOrders.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center flex-none">
                  <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-red-800">Stale Pending Orders</p>
                  <p className="text-xs text-red-500">{stalePendingOrders.length} order{stalePendingOrders.length !== 1 ? "s" : ""} pending for 2+ days</p>
                </div>
                <Link href="/admin/orders?status=PENDING" className="text-xs font-semibold text-red-700 hover:text-red-900 flex-none transition-colors">
                  Review →
                </Link>
              </div>
              <div className="space-y-1.5">
                {stalePendingOrders.map((o) => (
                  <Link key={o.id} href={`/admin/orders/${o.id}`}
                    className="flex items-center justify-between bg-white border border-red-100 rounded-xl px-4 py-2.5 hover:border-red-300 transition-colors">
                    <div className="min-w-0">
                      <p className="text-xs font-mono font-semibold text-stone-700">{o.id.slice(0, 8).toUpperCase()}</p>
                      <p className="text-xs text-stone-400 truncate">{o.user.name}</p>
                    </div>
                    <div className="flex items-center gap-3 flex-none ms-3">
                      <span className="text-xs text-red-500 font-medium">{timeAgo(o.createdAt)}</span>
                      <span className="text-xs font-bold text-stone-800">{o.total.toFixed(0)} AED</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Low stock */}
          {lowStockProducts.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center flex-none">
                  <svg className="w-4 h-4 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-amber-800">Low Stock Warning</p>
                  <p className="text-xs text-amber-600">{lowStockProducts.length} product{lowStockProducts.length !== 1 ? "s" : ""} need restocking</p>
                </div>
                <Link href="/admin/products" className="text-xs font-semibold text-amber-700 hover:text-amber-900 flex-none transition-colors">
                  Manage →
                </Link>
              </div>
              <div className="space-y-1.5">
                {lowStockProducts.map((p) => (
                  <div key={p.id} className="flex items-center justify-between bg-white border border-amber-100 rounded-xl px-4 py-2.5">
                    <p className="text-sm font-medium text-stone-800 truncate">{parseMLText(p.name).en}</p>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full flex-none ms-3 ${p.stock === 0 ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>
                      {p.stock === 0 ? "Out of stock" : `${p.stock} left`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Orders by status + Recent orders ──────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Status breakdown */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6">
          <h2 className="text-sm font-bold text-stone-800 mb-4">Orders by Status</h2>
          <div className="space-y-3">
            {STATUS_ORDER.map((status) => {
              const count = statusMap[status] ?? 0;
              const total = Object.values(statusMap).reduce((a, b) => a + (b ?? 0), 0);
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
              return (
                <div key={status} className="flex items-center gap-3">
                  <div className="w-24 flex-none">
                    <StatusBadge status={status} />
                  </div>
                  <div className="flex-1 bg-stone-100 rounded-full h-2">
                    <div className="h-2 rounded-full bg-amber-500" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-sm font-semibold text-stone-700 w-6 text-right flex-none">{count}</span>
                </div>
              );
            })}
          </div>
          <Link href="/admin/orders" className="mt-5 flex items-center gap-1.5 text-xs font-semibold text-amber-700 hover:text-amber-900 transition-colors">
            View all orders →
          </Link>
        </div>

        {/* Recent orders */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-stone-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-stone-800">Recent Orders</h2>
            <Link href="/admin/orders" className="text-xs font-semibold text-amber-700 hover:text-amber-900 transition-colors">
              View all →
            </Link>
          </div>
          <div className="space-y-1.5">
            {recentOrders.length === 0 && (
              <p className="text-sm text-stone-400 py-6 text-center">No orders yet</p>
            )}
            {recentOrders.map((order) => (
              <Link
                key={order.id}
                href={`/admin/orders/${order.id}`}
                className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-stone-50 transition-colors group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-700 font-black text-xs flex-none">#</div>
                  <div className="min-w-0">
                    <p className="text-xs font-mono font-semibold text-stone-700">{order.id.slice(0, 8).toUpperCase()}</p>
                    <p className="text-xs text-stone-400 truncate">{order.user.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-none">
                  <StatusBadge status={order.status} />
                  <span className="text-xs text-stone-400 hidden sm:block">{timeAgo(order.createdAt)}</span>
                  <span className="text-sm font-bold text-stone-800 w-20 text-right">{order.total.toFixed(0)} AED</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ── Top Products + New Customers + Quick Actions ───────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Top Products */}
        {topProductsRaw.length > 0 && (
          <div className="xl:col-span-1 bg-white rounded-2xl border border-stone-200 p-6">
            <h2 className="text-sm font-bold text-stone-800 mb-4">Top Products</h2>
            <div className="space-y-4">
              {topProductsRaw.map((row, i) => {
                const product = productMap[row.productId];
                if (!product) return null;
                const pct = (row.revenue / maxRevenue) * 100;
                return (
                  <div key={row.productId} className="flex items-center gap-3">
                    <span className="text-xs font-black text-stone-300 w-4 flex-none">{i + 1}</span>
                    <img
                      src={product.image}
                      alt={parseMLText(product.name).en}
                      className="w-9 h-9 rounded-xl object-cover bg-stone-100 flex-none"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-stone-800 truncate leading-tight">
                        {parseMLText(product.name).en}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <div className="flex-1 bg-stone-100 rounded-full h-1.5">
                          <div className="h-1.5 rounded-full bg-amber-500" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs text-stone-400 flex-none">{Number(row.units)} sold</span>
                      </div>
                    </div>
                    <span className="text-xs font-black text-stone-800 flex-none">
                      {row.revenue.toLocaleString("en-AE", { maximumFractionDigits: 0 })} AED
                    </span>
                  </div>
                );
              })}
            </div>
            {topProductsRaw.length === 0 && (
              <p className="text-sm text-stone-400 text-center py-6">No sales data yet</p>
            )}
          </div>
        )}

        {/* New Customers */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-stone-800">New Customers</h2>
            <div className="flex items-center gap-2">
              <span className="text-xs bg-violet-50 text-violet-700 border border-violet-100 font-semibold px-2.5 py-1 rounded-full">
                +{newCustomersWeek} this week
              </span>
            </div>
          </div>

          {/* Summary pills */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-violet-50 rounded-xl p-3 text-center border border-violet-100">
              <p className="text-2xl font-black text-violet-700">{newCustomersToday}</p>
              <p className="text-xs text-violet-500 font-medium mt-0.5">Today</p>
            </div>
            <div className="bg-stone-50 rounded-xl p-3 text-center border border-stone-100">
              <p className="text-2xl font-black text-stone-700">{newCustomersWeek}</p>
              <p className="text-xs text-stone-400 font-medium mt-0.5">This week</p>
            </div>
          </div>

          {/* Recent signups */}
          <div className="space-y-2">
            {recentCustomers.map((u) => (
              <div key={u.id} className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-400 to-violet-600 flex items-center justify-center text-white text-xs font-bold flex-none">
                  {(u.name ?? u.email ?? "?").charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-stone-700 truncate">{u.name ?? "Guest"}</p>
                  <p className="text-xs text-stone-400 truncate">{u.email}</p>
                </div>
                <span className="text-xs text-stone-300 flex-none">{timeAgo(u.createdAt)}</span>
              </div>
            ))}
            {recentCustomers.length === 0 && (
              <p className="text-sm text-stone-400 text-center py-4">No customers yet</p>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <QuickActions />
      </div>
    </div>
  );
}

// ── KPI Card ─────────────────────────────────────────────────────────────────

type Accent = "emerald" | "teal" | "blue" | "amber" | "stone" | "violet";

const ACCENT_BG: Record<Accent, string> = {
  emerald: "bg-emerald-50",
  teal:    "bg-teal-50",
  blue:    "bg-blue-50",
  amber:   "bg-amber-50",
  stone:   "bg-stone-100",
  violet:  "bg-violet-50",
};
const ACCENT_TEXT: Record<Accent, string> = {
  emerald: "text-emerald-600",
  teal:    "text-teal-600",
  blue:    "text-blue-600",
  amber:   "text-amber-600",
  stone:   "text-stone-500",
  violet:  "text-violet-600",
};
const ACCENT_RING: Record<Accent, string> = {
  emerald: "ring-emerald-100",
  teal:    "ring-teal-100",
  blue:    "ring-blue-100",
  amber:   "ring-amber-100",
  stone:   "ring-stone-100",
  violet:  "ring-violet-100",
};

function KpiCard({
  label, value, sub, accent, icon, alert, subColor,
}: {
  label: string;
  value: string;
  sub: string;
  accent: Accent;
  icon: React.ReactNode;
  alert?: boolean;
  subColor?: string;
}) {
  return (
    <div className={`bg-white rounded-2xl border border-stone-200 p-5 flex items-start gap-4 ${alert ? "ring-2 ring-amber-200" : ""}`}>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-none ${ACCENT_BG[accent]} ${ACCENT_TEXT[accent]}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide">{label}</p>
        <p className="text-xl font-black text-stone-900 mt-0.5 leading-tight">{value}</p>
        <p className={`text-xs mt-1 ${subColor ?? "text-stone-400"}`}>{sub}</p>
      </div>
    </div>
  );
}

// ── Icons ─────────────────────────────────────────────────────────────────────

function RevenueIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}
function CalendarIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}
function SunIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
    </svg>
  );
}
function AovIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  );
}
function PendingIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}
function ProductIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  );
}
function CustomerIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}
function UserPlusIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
    </svg>
  );
}
