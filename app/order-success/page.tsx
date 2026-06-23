import Link from "next/link";
import { prisma } from "@/lib/prisma";
import TopBar from "@/components/TopBar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartClearer from "./_components/CartClearer";

type PageProps = { searchParams: Promise<{ id?: string }> };

export default async function OrderSuccessPage({ searchParams }: PageProps) {
  const { id } = await searchParams;

  const order = id
    ? await prisma.order.findUnique({
        where: { id },
        include: { items: { include: { product: true } } },
      })
    : null;

  return (
    <main className="min-h-screen">
      <TopBar />
      <Header />

      <CartClearer />
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        {/* Success icon */}
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-10 h-10 text-emerald-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        <h1 className="text-3xl font-black text-stone-900 mb-2">
          تم تأكيد طلبك!
        </h1>
        <p className="text-stone-500 mb-2">Order confirmed successfully</p>

        {order && (
          <p className="text-sm font-mono text-stone-400 mb-8">
            #{order.id.slice(0, 8).toUpperCase()}
          </p>
        )}

        {order && (
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm text-right mb-8">
            <div className="px-5 py-4 border-b border-stone-100">
              <p className="text-sm font-semibold text-stone-700">
                Order Items ({order.items.length})
              </p>
            </div>
            <div className="divide-y divide-stone-50">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center gap-4 px-5 py-3">
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-10 h-10 rounded-lg object-cover bg-stone-100 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0 text-right">
                    <p className="text-sm font-medium text-stone-800 truncate">
                      {item.product.name}
                    </p>
                    <p className="text-xs text-stone-400">
                      {item.price} AED × {item.quantity}
                    </p>
                  </div>
                  <p className="text-sm font-bold text-stone-800 whitespace-nowrap">
                    {(item.price * item.quantity).toFixed(2)} AED
                  </p>
                </div>
              ))}
            </div>
            <div className="px-5 py-4 border-t border-stone-100 flex justify-between font-black text-stone-900">
              <span>المجموع / Total</span>
              <span>{order.total.toFixed(2)} AED</span>
            </div>
          </div>
        )}

        <p className="text-sm text-stone-400 mb-8">
          شكراً لتسوقك من مربع الغربية للتمور — سنتواصل معك عبر الواتساب لتأكيد التوصيل
          <br />
          <span className="text-xs">
            Thank you! We'll reach out on WhatsApp to confirm delivery.
          </span>
        </p>

        <Link
          href="/shop"
          className="inline-flex items-center gap-2 bg-amber-600 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-amber-700 transition-colors cursor-pointer"
        >
          متابعة التسوق — Continue Shopping
        </Link>
      </div>

      <Footer />
    </main>
  );
}
