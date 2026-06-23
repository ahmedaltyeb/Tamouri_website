import Link from "next/link";
import { prisma } from "@/lib/prisma";
import type { OrderStatus } from "@prisma/client";
import StatusBadge from "./orders/_components/StatusBadge";

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
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    totalRevenue,
    monthRevenue,
    todayCount,
    pendingCount,
    productCount,
    customerCount,
    statusGroups,
    recentOrders,
    topProductsRaw,
  ] = await Promise.all([
    prisma.order.aggregate({
      _sum: { total: true },
      where: { status: { in: ["PAID", "DELIVERED"] } },
    }),
    prisma.order.aggregate({
      _sum: { total: true },
      where: {
        status: { in: ["PAID", "DELIVERED"] },
        createdAt: { gte: startOfMonth },
      },
    }),
    prisma.order.count({ where: { createdAt: { gte: startOfToday } } }),
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.product.count(),
    prisma.user.count(),
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

  const maxRevenue = topProductsRaw[0]?.revenue ?? 1;

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
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

      {/* KPI cards */}
      <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
        <KpiCard
          label="Total Revenue"
          value={`${totalRev.toLocaleString("en-AE", { minimumFractionDigits: 0, maximumFractionDigits: 0 })} AED`}
          sub="Paid & delivered orders"
          accent="emerald"
          icon={<RevenueIcon />}
        />
        <KpiCard
          label="This Month"
          value={`${monthRev.toLocaleString("en-AE", { minimumFractionDigits: 0, maximumFractionDigits: 0 })} AED`}
          sub="Revenue in current month"
          accent="teal"
          icon={<CalendarIcon />}
        />
        <KpiCard
          label="Orders Today"
          value={String(todayCount)}
          sub="New orders since midnight"
          accent="blue"
          icon={<OrderIcon />}
        />
        <KpiCard
          label="Pending Orders"
          value={String(pendingCount)}
          sub={pendingCount > 0 ? "Needs attention" : "All clear"}
          accent={pendingCount > 0 ? "amber" : "stone"}
          icon={<PendingIcon />}
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
      </div>

      {/* Orders by status + Recent orders */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Status breakdown */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6">
          <h2 className="text-sm font-bold text-stone-800 mb-4">
            Orders by Status
          </h2>
          <div className="space-y-3">
            {STATUS_ORDER.map((status) => {
              const count = statusMap[status] ?? 0;
              const total = Object.values(statusMap).reduce(
                (a, b) => a + (b ?? 0),
                0
              );
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
              return (
                <div key={status} className="flex items-center gap-3">
                  <div className="w-24 flex-none">
                    <StatusBadge status={status} />
                  </div>
                  <div className="flex-1 bg-stone-100 rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-amber-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-stone-700 w-6 text-right flex-none">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
          <Link
            href="/admin/orders"
            className="mt-5 flex items-center gap-1.5 text-xs font-semibold text-amber-700 hover:text-amber-900 transition-colors"
          >
            View all orders →
          </Link>
        </div>

        {/* Recent orders */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-stone-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-stone-800">Recent Orders</h2>
            <Link
              href="/admin/orders"
              className="text-xs font-semibold text-amber-700 hover:text-amber-900 transition-colors"
            >
              View all →
            </Link>
          </div>
          <div className="space-y-2">
            {recentOrders.length === 0 && (
              <p className="text-sm text-stone-400 py-4 text-center">
                No orders yet
              </p>
            )}
            {recentOrders.map((order) => (
              <Link
                key={order.id}
                href={`/admin/orders/${order.id}`}
                className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-stone-50 transition-colors group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-700 font-black text-xs flex-none">
                    #
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-mono font-semibold text-stone-700">
                      {order.id.slice(0, 8).toUpperCase()}
                    </p>
                    <p className="text-xs text-stone-400 truncate">
                      {order.user.name}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-none">
                  <StatusBadge status={order.status} />
                  <span className="text-sm font-bold text-stone-800 w-20 text-right">
                    {order.total.toFixed(0)} AED
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Top products */}
      {topProductsRaw.length > 0 && (
        <div className="bg-white rounded-2xl border border-stone-200 p-6">
          <h2 className="text-sm font-bold text-stone-800 mb-4">
            Top Products by Revenue
          </h2>
          <div className="space-y-4">
            {topProductsRaw.map((row, i) => {
              const product = productMap[row.productId];
              if (!product) return null;
              const pct = (row.revenue / maxRevenue) * 100;
              return (
                <div key={row.productId} className="flex items-center gap-4">
                  <span className="text-xs font-bold text-stone-400 w-4 flex-none">
                    {i + 1}
                  </span>
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-9 h-9 rounded-lg object-cover bg-stone-100 flex-none"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-stone-800 truncate">
                      {product.name}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 bg-stone-100 rounded-full h-1.5">
                        <div
                          className="h-1.5 rounded-full bg-amber-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-xs text-stone-400 flex-none">
                        {Number(row.units)} sold
                      </span>
                    </div>
                  </div>
                  <span className="text-sm font-black text-stone-800 w-24 text-right flex-none">
                    {row.revenue.toLocaleString("en-AE", {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    })}{" "}
                    AED
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ── KPI Card ─────────────────────────────────────────────────────────────────

type Accent = "emerald" | "teal" | "blue" | "amber" | "stone" | "violet";

const ACCENT_BG: Record<Accent, string> = {
  emerald: "bg-emerald-50",
  teal: "bg-teal-50",
  blue: "bg-blue-50",
  amber: "bg-amber-50",
  stone: "bg-stone-100",
  violet: "bg-violet-50",
};
const ACCENT_TEXT: Record<Accent, string> = {
  emerald: "text-emerald-600",
  teal: "text-teal-600",
  blue: "text-blue-600",
  amber: "text-amber-600",
  stone: "text-stone-500",
  violet: "text-violet-600",
};

function KpiCard({
  label,
  value,
  sub,
  accent,
  icon,
}: {
  label: string;
  value: string;
  sub: string;
  accent: Accent;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-5 flex items-start gap-4">
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center flex-none ${ACCENT_BG[accent]} ${ACCENT_TEXT[accent]}`}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide">
          {label}
        </p>
        <p className="text-2xl font-black text-stone-900 mt-0.5 leading-none">
          {value}
        </p>
        <p className="text-xs text-stone-400 mt-1">{sub}</p>
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
function OrderIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
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
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
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
