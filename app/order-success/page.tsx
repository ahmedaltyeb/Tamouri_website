import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import TopBar from "@/components/TopBar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartClearer from "./_components/CartClearer";
import { getLang, serverTr } from "@/lib/server-lang";
import { parseMLText } from "@/lib/products";
import { getStripe, stripeEnabled } from "@/lib/stripe";

type PageProps = { searchParams: Promise<{ id?: string; session_id?: string }> };

const PLACEHOLDER = "/placeholder.svg";

/** Verify payment status with Stripe (authoritative source — no webhook latency). */
async function getStripeStatus(
  sessionId: string,
): Promise<"paid" | "unpaid" | "expired" | "unknown"> {
  if (!stripeEnabled()) return "unknown";
  try {
    const session = await getStripe().checkout.sessions.retrieve(sessionId, {
      expand: [],
    });
    if (session.status === "expired") return "expired";
    if (session.payment_status === "paid") return "paid";
    return "unpaid";
  } catch {
    return "unknown";
  }
}

export default async function OrderSuccessPage({ searchParams }: PageProps) {
  const { id, session_id } = await searchParams;
  const lang = await getLang();
  const tr = serverTr(lang);

  const order = id
    ? await prisma.order.findUnique({
        where: { id },
        include: {
          items: {
            include: { product: { select: { name: true, image: true, images: true } } },
          },
        },
      })
    : null;

  // When coming from Stripe, verify payment status directly with Stripe.
  // This is authoritative and avoids showing "pending" due to webhook latency.
  const stripeStatus = session_id ? await getStripeStatus(session_id) : null;

  // Determine whether payment was successfully confirmed
  const paymentConfirmed =
    !session_id || // COD mode: always confirmed
    stripeStatus === "paid" ||
    order?.status === "PAID" ||
    order?.status === "CONFIRMED" ||
    order?.status === "SHIPPED" ||
    order?.status === "DELIVERED";

  const paymentExpired = stripeStatus === "expired";

  return (
    <main className="min-h-screen">
      <TopBar />
      <Header />
      {/* CartClearer only runs if payment was confirmed */}
      {paymentConfirmed && <CartClearer />}

      <div className="max-w-2xl mx-auto px-4 py-20 text-center">

        {paymentExpired ? (
          /* ── Payment link expired ─────────────────────────────────────── */
          <>
            <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
              </svg>
            </div>
            <h1 className="text-3xl font-black text-ink mb-2">
              {lang === "ar" ? "انتهت صلاحية جلسة الدفع" : "Payment Session Expired"}
            </h1>
            <p className="text-stone-500 text-sm mb-8">
              {lang === "ar"
                ? "انتهت مهلة جلسة الدفع. تمت استعادة مخزون المنتجات. يرجى المحاولة مرة أخرى."
                : "Your payment session has expired and your cart items have been restocked. Please try again."}
            </p>
            <Link
              href="/checkout"
              className="inline-flex items-center justify-center gap-2 bg-brown hover:bg-brown-dark text-white px-8 py-3 rounded-xl font-bold transition-colors cursor-pointer"
            >
              {lang === "ar" ? "العودة إلى الدفع" : "Return to Checkout"}
            </Link>
          </>
        ) : paymentConfirmed ? (
          /* ── Successful payment ───────────────────────────────────────── */
          <>
            {/* Success icon */}
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
              </svg>
            </div>

            <h1 className="text-3xl font-black text-ink mb-1">
              {tr("orderConfirmed")}
            </h1>
            <p className="text-stone-500 text-sm mb-2">
              {tr("orderConfirmedSub")}
            </p>

            {/* Show Stripe payment confirmation badge */}
            {stripeStatus === "paid" && (
              <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
                <svg className="w-3.5 h-3.5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                </svg>
                {lang === "ar" ? "تم تأكيد الدفع" : "Payment Confirmed"}
              </div>
            )}

            {order && (
              <p className="text-sm font-mono text-stone-400 mb-8">
                {tr("orderRef")} {order.id.slice(-8).toUpperCase()}
              </p>
            )}

            {order && (
              <div className="bg-white rounded-2xl border border-stone-100 shadow-sm text-start mb-8">
                <div className="px-5 py-4 border-b border-stone-100">
                  <p className="text-sm font-semibold text-stone-700">
                    {tr("orderItems")} ({order.items.length})
                  </p>
                </div>
                <div className="divide-y divide-stone-50">
                  {order.items.map((item) => {
                    const imgSrc = item.product.images?.[0] || item.product.image || PLACEHOLDER;
                    const itemName = parseMLText(item.product.name)[lang];
                    return (
                      <div key={item.id} className="flex items-center gap-4 px-5 py-3">
                        <div className="relative w-10 h-10 flex-none rounded-lg overflow-hidden bg-stone-100">
                          <Image
                            src={imgSrc} alt={itemName} fill
                            className="object-contain p-1" sizes="40px"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-ink truncate">{itemName}</p>
                          <p className="text-xs text-stone-400">
                            {item.price} {tr("aed")} × {item.quantity}
                          </p>
                        </div>
                        <p className="text-sm font-bold text-ink whitespace-nowrap">
                          {(item.price * item.quantity).toFixed(2)} {tr("aed")}
                        </p>
                      </div>
                    );
                  })}
                </div>
                <div className="px-5 py-4 border-t border-stone-100 flex justify-between font-black text-ink">
                  <span>{tr("total")}</span>
                  <span className="text-brown">{order.total.toFixed(2)} {tr("aed")}</span>
                </div>
                {order.shippingAddress && (
                  <div className="px-5 py-3 border-t border-stone-50 text-xs text-stone-400">
                    <span className="font-semibold text-stone-500">
                      {tr("shippingAddressSection")}{": "}
                    </span>
                    {order.shippingAddress}
                  </div>
                )}
              </div>
            )}

            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-8 text-sm text-amber-800">
              <p className="font-semibold mb-1">
                {tr("whatsappConfirmMsg")}
              </p>
              <p className="text-amber-700 text-xs">
                {tr("thankYouMsg")}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {order && (
                <Link
                  href="/account/orders"
                  className="inline-flex items-center justify-center gap-2 bg-stone-100 hover:bg-stone-200 text-stone-700 px-6 py-3 rounded-xl font-semibold transition-colors cursor-pointer text-sm"
                >
                  {tr("myOrders")}
                </Link>
              )}
              <Link
                href="/shop"
                className="inline-flex items-center justify-center gap-2 bg-brown hover:bg-brown-dark text-white px-8 py-3 rounded-xl font-bold transition-colors cursor-pointer"
              >
                {tr("continueShopping")}
              </Link>
            </div>
          </>
        ) : (
          /* ── Payment not yet confirmed (rare: Stripe webhook delay) ─── */
          <>
            <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <h1 className="text-3xl font-black text-ink mb-2">
              {lang === "ar" ? "جارٍ التحقق من الدفع" : "Verifying Payment"}
            </h1>
            <p className="text-stone-500 text-sm mb-8">
              {lang === "ar"
                ? "طلبك في الانتظار. سيتم تأكيده فور اكتمال الدفع."
                : "Your order is pending payment confirmation. You'll receive a confirmation once the payment is complete."}
            </p>
            {order && (
              <p className="text-sm font-mono text-stone-400 mb-8">
                {tr("orderRef")} {order.id.slice(-8).toUpperCase()}
              </p>
            )}
            <Link
              href="/shop"
              className="inline-flex items-center justify-center gap-2 bg-brown hover:bg-brown-dark text-white px-8 py-3 rounded-xl font-bold transition-colors cursor-pointer"
            >
              {tr("continueShopping")}
            </Link>
          </>
        )}
      </div>

      <Footer />
    </main>
  );
}
