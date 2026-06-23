"use client";
import { useState, useTransition } from "react";
import Link from "next/link";
import TopBar from "@/components/TopBar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PAID"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

interface HistoryEntry {
  id: string;
  status: OrderStatus;
  note: string | null;
  createdAt: string;
}

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: { name: string; image: string };
}

interface Order {
  id: string;
  status: OrderStatus;
  total: number;
  shippingAddress: string;
  notes: string | null;
  createdAt: string;
  items: OrderItem[];
  statusHistory: HistoryEntry[];
}

interface TrackResult {
  customerName?: string;
  orders: Order[];
  error?: string;
}

const STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING: "قيد الانتظار / Pending",
  CONFIRMED: "تم التأكيد / Confirmed",
  PAID: "تم الدفع / Paid",
  SHIPPED: "تم الشحن / Shipped",
  DELIVERED: "تم التوصيل / Delivered",
  CANCELLED: "ملغى / Cancelled",
};

const STATUS_STYLE: Record<OrderStatus, string> = {
  PENDING: "bg-yellow-50 text-yellow-700 border-yellow-200",
  CONFIRMED: "bg-blue-50 text-blue-700 border-blue-200",
  PAID: "bg-teal-50 text-teal-700 border-teal-200",
  SHIPPED: "bg-violet-50 text-violet-700 border-violet-200",
  DELIVERED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  CANCELLED: "bg-red-50 text-red-600 border-red-200",
};

const STATUS_DOT: Record<OrderStatus, string> = {
  PENDING: "bg-yellow-400",
  CONFIRMED: "bg-blue-500",
  PAID: "bg-teal-500",
  SHIPPED: "bg-violet-500",
  DELIVERED: "bg-emerald-500",
  CANCELLED: "bg-red-400",
};

const STEPS: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "PAID",
  "SHIPPED",
  "DELIVERED",
];

const STEP_RANK: Record<OrderStatus, number> = {
  PENDING: 0,
  CONFIRMED: 1,
  PAID: 2,
  SHIPPED: 3,
  DELIVERED: 4,
  CANCELLED: -1,
};

export default function TrackOrderPage() {
  const [email, setEmail] = useState("");
  const [result, setResult] = useState<TrackResult | null>(null);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError("Please enter a valid email address.");
      return;
    }
    setError("");
    startTransition(async () => {
      const res = await fetch(
        `/api/track-order?email=${encodeURIComponent(trimmed)}`
      );
      const data = (await res.json()) as TrackResult;
      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        return;
      }
      setResult(data);
    });
  }

  return (
    <main className="min-h-screen">
      <TopBar />
      <Header />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-14">
        {/* Title */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-amber-50 rounded-2xl mb-4">
            <svg
              className="w-7 h-7 text-amber-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-black text-stone-900">
            تتبع طلبك / Track Your Order
          </h1>
          <p className="text-stone-500 text-sm mt-2">
            Enter the email address you used at checkout to view your orders.
          </p>
        </div>

        {/* Search form */}
        <form
          onSubmit={handleSubmit}
          className="flex gap-2 mb-10"
          dir="ltr"
        >
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="flex-1 px-4 py-3 rounded-xl border border-stone-200 bg-white text-sm outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-400 transition-colors"
            required
          />
          <button
            type="submit"
            disabled={isPending}
            className="px-6 py-3 bg-amber-600 hover:bg-amber-700 disabled:opacity-60 text-white font-bold rounded-xl text-sm transition-colors cursor-pointer"
          >
            {isPending ? "Searching…" : "Track"}
          </button>
        </form>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-6">
            {error}
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-6">
            {result.orders.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-stone-500 text-sm">
                  No orders found for{" "}
                  <span className="font-semibold">{email}</span>.
                </p>
                <Link
                  href="/shop"
                  className="inline-block mt-4 text-sm font-semibold text-amber-700 hover:text-amber-900 transition-colors"
                >
                  Browse our products →
                </Link>
              </div>
            ) : (
              <>
                <p className="text-sm text-stone-500">
                  Showing{" "}
                  <span className="font-semibold text-stone-800">
                    {result.orders.length}
                  </span>{" "}
                  order{result.orders.length !== 1 ? "s" : ""} for{" "}
                  <span className="font-semibold text-stone-800">
                    {result.customerName}
                  </span>
                </p>

                {result.orders.map((order) => (
                  <OrderCard key={order.id} order={order} />
                ))}
              </>
            )}
          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}

function OrderCard({ order }: { order: Order }) {
  const rank = STEP_RANK[order.status];
  const isCancelled = order.status === "CANCELLED";

  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs text-stone-400 font-mono">
            #{order.id.slice(0, 8).toUpperCase()}
          </p>
          <p className="text-xs text-stone-400 mt-0.5">
            {new Date(order.createdAt).toLocaleDateString("en-AE", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-black text-stone-800">
            {order.total.toFixed(2)} AED
          </span>
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${STATUS_STYLE[order.status]}`}
          >
            {STATUS_LABEL[order.status]}
          </span>
        </div>
      </div>

      {/* Progress stepper */}
      {!isCancelled && (
        <div className="px-5 py-5 border-b border-stone-100">
          <div className="flex items-center">
            {STEPS.map((step, i) => {
              const done = rank >= STEP_RANK[step];
              const current = rank === STEP_RANK[step];
              return (
                <div key={step} className="flex items-center flex-1 last:flex-none">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-colors ${
                        done
                          ? "bg-amber-500 border-amber-500 text-white"
                          : "bg-white border-stone-200 text-stone-300"
                      } ${current ? "ring-2 ring-amber-200 ring-offset-1" : ""}`}
                    >
                      {done && !current ? (
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        i + 1
                      )}
                    </div>
                    <p className="text-[10px] text-stone-400 mt-1 text-center w-14 leading-tight hidden sm:block">
                      {step.charAt(0) + step.slice(1).toLowerCase()}
                    </p>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div
                      className={`flex-1 h-0.5 mx-1 mb-4 sm:mb-0 ${rank > STEP_RANK[step] ? "bg-amber-500" : "bg-stone-200"}`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Items */}
      <div className="divide-y divide-stone-50">
        {order.items.map((item) => (
          <div key={item.id} className="flex items-center gap-3 px-5 py-3">
            <img
              src={item.product.image}
              alt={item.product.name}
              className="w-10 h-10 rounded-lg object-cover bg-stone-100 flex-none"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-stone-800 truncate">
                {item.product.name}
              </p>
              <p className="text-xs text-stone-400">
                {item.price.toFixed(2)} AED × {item.quantity}
              </p>
            </div>
            <p className="text-sm font-bold text-stone-800 flex-none">
              {(item.price * item.quantity).toFixed(2)} AED
            </p>
          </div>
        ))}
      </div>

      {/* Timeline */}
      {order.statusHistory.length > 0 && (
        <div className="px-5 py-4 border-t border-stone-100 bg-stone-50">
          <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-3">
            Status History
          </p>
          <div className="space-y-2">
            {order.statusHistory.map((h) => (
              <div key={h.id} className="flex items-start gap-2.5">
                <div
                  className={`w-2 h-2 rounded-full mt-1.5 flex-none ${STATUS_DOT[h.status]}`}
                />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-stone-700">
                    {STATUS_LABEL[h.status]}
                  </p>
                  {h.note && (
                    <p className="text-xs text-stone-400 truncate">{h.note}</p>
                  )}
                  <p className="text-[10px] text-stone-300 mt-0.5">
                    {new Date(h.createdAt).toLocaleString("en-AE")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
