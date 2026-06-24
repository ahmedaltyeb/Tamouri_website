import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import type { OrderStatus } from "@prisma/client";
import StatusBadge from "../_components/StatusBadge";
import StatusUpdateForm from "./_components/StatusUpdateForm";
import { parseMLText } from "@/lib/products";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ id: string }> };

const STATUS_RANK: Record<OrderStatus, number> = {
  PENDING: 0,
  CONFIRMED: 1,
  PAID: 2,
  SHIPPED: 3,
  DELIVERED: 4,
  CANCELLED: 99,
};

// Timeline icon colours per status
const TIMELINE_ICON: Record<
  OrderStatus,
  { dot: string; icon: string }
> = {
  PENDING: { dot: "bg-yellow-400", icon: "text-yellow-600" },
  CONFIRMED: { dot: "bg-blue-400", icon: "text-blue-600" },
  PAID: { dot: "bg-teal-400", icon: "text-teal-600" },
  SHIPPED: { dot: "bg-violet-400", icon: "text-violet-600" },
  DELIVERED: { dot: "bg-emerald-400", icon: "text-emerald-600" },
  CANCELLED: { dot: "bg-red-400", icon: "text-red-600" },
};

export default async function AdminOrderDetailPage({ params }: PageProps) {
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: true,
      items: { include: { product: true } },
      statusHistory: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!order) notFound();

  const subtotal = order.items.reduce((s, i) => s + i.price * i.quantity, 0);
  const currentRank = STATUS_RANK[order.status];

  // Build timeline: use history records; fall back to createdAt if empty
  const timelineEntries =
    order.statusHistory.length > 0
      ? order.statusHistory
      : [{ id: "init", status: order.status, note: null, createdAt: order.createdAt }];

  return (
    <div className="p-8 max-w-6xl">
      {/* Back */}
      <Link
        href="/admin/orders"
        className="inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-800 transition-colors mb-6 cursor-pointer"
      >
        <ChevronLeftIcon />
        Back to Orders
      </Link>

      {/* ── Page header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-stone-900">
              Order{" "}
              <span className="font-mono text-xl text-stone-600">
                #{order.id.slice(0, 8).toUpperCase()}
              </span>
            </h1>
            <StatusBadge status={order.status} />
          </div>
          <p className="text-sm text-stone-500 mt-1">
            Placed{" "}
            {new Date(order.createdAt).toLocaleDateString("en-AE", {
              weekday: "long",
              day: "2-digit",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>

        {/* Status controls */}
        <div className="flex-shrink-0">
          <StatusUpdateForm orderId={order.id} currentStatus={order.status} />
        </div>
      </div>

      {/* ── Summary bar ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <SummaryCard
          label="Order Total"
          value={`${order.total.toFixed(2)} AED`}
          accent="text-amber-700"
        />
        <SummaryCard label="Items" value={`${order.items.length}`} />
        <SummaryCard label="Customer" value={order.user.name} />
        <SummaryCard label="Status" value={<StatusBadge status={order.status} />} />
      </div>

      {/* ── Progress bar ────────────────────────────────────────────────────── */}
      {order.status !== "CANCELLED" && (
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm px-6 py-5 mb-8">
          <div className="flex items-center justify-between relative">
            {/* Track line */}
            <div className="absolute top-3.5 left-0 right-0 h-0.5 bg-stone-200 mx-8" />
            <div
              className="absolute top-3.5 left-0 h-0.5 bg-amber-400 mx-8 transition-all duration-500"
              style={{ width: `${(Math.min(currentRank, 4) / 4) * 100}%` }}
            />

            {(["PENDING", "CONFIRMED", "PAID", "SHIPPED", "DELIVERED"] as OrderStatus[]).map(
              (s, i) => {
                const rank = STATUS_RANK[s];
                const done = currentRank >= rank;
                const active = order.status === s;
                return (
                  <div key={s} className="relative flex flex-col items-center gap-1.5 z-10">
                    <div
                      className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-colors duration-300 ${
                        active
                          ? "bg-amber-500 border-amber-500"
                          : done
                          ? "bg-amber-400 border-amber-400"
                          : "bg-white border-stone-300"
                      }`}
                    >
                      {done ? (
                        <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-stone-300" />
                      )}
                    </div>
                    <span
                      className={`text-xs font-medium whitespace-nowrap ${
                        active ? "text-amber-700" : done ? "text-stone-600" : "text-stone-400"
                      }`}
                    >
                      {s.charAt(0) + s.slice(1).toLowerCase()}
                    </span>
                  </div>
                );
              },
            )}
          </div>
        </div>
      )}

      {/* ── Main grid ───────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: items + timeline */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order items */}
          <section className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
            <SectionHeader title={`Order Items (${order.items.length})`} />
            <div className="divide-y divide-stone-100">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center gap-4 px-5 py-4">
                  <img
                    src={item.product.image}
                    alt={parseMLText(item.product.name).en}
                    className="w-12 h-12 rounded-lg object-cover bg-stone-100 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-stone-900 leading-snug truncate">
                      {parseMLText(item.product.name).en}
                    </p>
                    <p className="text-xs text-stone-400 mt-0.5">
                      {item.price.toFixed(2)} AED × {item.quantity}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-stone-800 whitespace-nowrap">
                    {(item.price * item.quantity).toFixed(2)} AED
                  </p>
                </div>
              ))}
            </div>
            <div className="border-t border-stone-200 px-5 py-4 space-y-2 bg-stone-50">
              <div className="flex justify-between text-sm text-stone-500">
                <span>Subtotal</span>
                <span>{subtotal.toFixed(2)} AED</span>
              </div>
              <div className="flex justify-between text-base font-bold text-stone-900">
                <span>Total</span>
                <span>{order.total.toFixed(2)} AED</span>
              </div>
            </div>
          </section>

          {/* Status timeline */}
          <section className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
            <SectionHeader title="Order Timeline" />
            <div className="px-5 py-4">
              <ol className="relative border-l border-stone-200 ml-3 space-y-6">
                {timelineEntries.map((entry, i) => {
                  const isLast = i === timelineEntries.length - 1;
                  const tc = TIMELINE_ICON[entry.status];
                  return (
                    <li key={entry.id} className="ml-6">
                      <span
                        className={`absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full ring-4 ring-white ${tc.dot}`}
                      >
                        <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </span>
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className={`text-sm font-semibold ${isLast ? tc.icon : "text-stone-700"}`}>
                            {entry.status.charAt(0) + entry.status.slice(1).toLowerCase()}
                          </p>
                          {entry.note && (
                            <p className="text-xs text-stone-400 mt-0.5">{entry.note}</p>
                          )}
                        </div>
                        <time className="text-xs text-stone-400 whitespace-nowrap pt-0.5">
                          {new Date(entry.createdAt).toLocaleString("en-AE", {
                            day: "2-digit",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </time>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>
          </section>
        </div>

        {/* Right: customer + shipping + notes + meta */}
        <div className="space-y-4">
          {/* Customer */}
          <section className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
            <SectionHeader title="Customer" />
            <div className="px-5 py-4 space-y-1.5">
              <p className="text-sm font-semibold text-stone-900">{order.user.name}</p>
              <p className="text-xs text-stone-500">{order.user.email}</p>
              {order.user.phone && (
                <p className="text-xs text-stone-500">{order.user.phone}</p>
              )}
              <p className="text-xs text-stone-400 pt-1">
                Customer since{" "}
                {new Date(order.user.createdAt).toLocaleDateString("en-AE", {
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </div>
          </section>

          {/* Shipping address */}
          <section className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
            <SectionHeader title="Shipping Address" />
            <div className="px-5 py-4">
              <p className="text-sm text-stone-700 whitespace-pre-wrap leading-relaxed">
                {order.shippingAddress}
              </p>
            </div>
          </section>

          {/* Notes */}
          {order.notes && (
            <section className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
              <SectionHeader title="Order Notes" />
              <div className="px-5 py-4">
                <p className="text-sm text-stone-600 whitespace-pre-wrap leading-relaxed italic">
                  &ldquo;{order.notes}&rdquo;
                </p>
              </div>
            </section>
          )}

          {/* Meta */}
          <section className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
            <SectionHeader title="Details" />
            <div className="px-5 py-4 space-y-3 text-xs">
              <Detail
                label="Order ID"
                value={<span className="font-mono break-all">{order.id}</span>}
              />
              <Detail
                label="Placed"
                value={new Date(order.createdAt).toLocaleString("en-AE")}
              />
              <Detail
                label="Last updated"
                value={new Date(order.updatedAt).toLocaleString("en-AE")}
              />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

// ── Small components ───────────────────────────────────────────────────────────

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="px-5 py-3.5 border-b border-stone-100 bg-stone-50">
      <h2 className="text-sm font-semibold text-stone-700">{title}</h2>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: React.ReactNode;
  accent?: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-stone-200 shadow-sm px-4 py-4">
      <p className="text-xs text-stone-400 font-medium uppercase tracking-wide mb-1">{label}</p>
      <p className={`text-sm font-bold text-stone-900 ${accent ?? ""}`}>{value}</p>
    </div>
  );
}

function Detail({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex justify-between items-start gap-2">
      <span className="text-stone-400 shrink-0">{label}</span>
      <span className="text-stone-700 text-right">{value}</span>
    </div>
  );
}

function ChevronLeftIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
    </svg>
  );
}
