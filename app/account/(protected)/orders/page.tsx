"use client";
import { useEffect, useState } from "react";
import AccountSidebar from "@/components/account/AccountSidebar";
import { useLanguage } from "@/contexts/LanguageContext";
import Image from "next/image";
import Link from "next/link";

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: { name: string; image?: string | null; images: string[] };
}

interface Order {
  id: string;
  createdAt: string;
  status: string;
  total: number;
  items: OrderItem[];
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  PROCESSING: "bg-blue-100 text-blue-700",
  SHIPPED: "bg-indigo-100 text-indigo-700",
  DELIVERED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
};

export default function OrdersPage() {
  const { tr, dir, lang } = useLanguage();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/account/orders", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setOrders(d))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8" dir={dir}>
      <div className="flex flex-col md:flex-row gap-6">
        <AccountSidebar />

        <div className="flex-1 min-w-0">
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6">
            <h2 className="text-lg font-bold text-ink mb-5">{tr("myOrders")}</h2>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-24 bg-stone-100 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-12 h-12 text-stone-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
                </svg>
                <p className="text-stone-500 text-sm">{tr("noOrders")}</p>
                <Link href="/shop" className="inline-block mt-3 text-brown text-sm font-semibold hover:underline cursor-pointer">
                  {tr("continueShopping")}
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="border border-stone-100 rounded-xl p-4 hover:border-brown/30 transition-colors">
                    <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                      <div>
                        <p className="text-xs text-stone-400 font-mono">#{order.id.slice(-8).toUpperCase()}</p>
                        <p className="text-xs text-stone-500 mt-0.5">
                          {new Date(order.createdAt).toLocaleDateString(lang === "ar" ? "ar-AE" : "en-AE")}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_COLORS[order.status] ?? "bg-stone-100 text-stone-600"}`}>
                          {tr(order.status.toLowerCase() as Parameters<typeof tr>[0]) || order.status}
                        </span>
                        <span className="text-sm font-bold text-ink">AED {order.total.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="flex gap-2 flex-wrap">
                      {order.items.slice(0, 4).map((item) => {
                        const img = item.product.images?.[0] || item.product.image || "/placeholder.svg";
                        return (
                          <div key={item.id} className="relative w-12 h-12 rounded-lg overflow-hidden border border-stone-100 bg-stone-50">
                            <Image src={img} alt={item.product.name} fill className="object-contain p-1" sizes="48px"
                              onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.svg"; }}
                            />
                          </div>
                        );
                      })}
                      {order.items.length > 4 && (
                        <div className="w-12 h-12 rounded-lg bg-stone-100 flex items-center justify-center text-xs text-stone-500 font-medium">
                          +{order.items.length - 4}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
