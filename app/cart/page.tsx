"use client";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import TopBar from "@/components/TopBar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useCartStore } from "@/store/cartStore";
import { useLanguage } from "@/contexts/LanguageContext";
import { parseMLText } from "@/lib/products";

const VALID_COUPONS: Record<string, number> = {
  TAMOURI10: 10,
  WELCOME5: 5,
  UAE15: 15,
};

const PLACEHOLDER = "/placeholder.svg";

export default function CartPage() {
  const { items, updateQuantity, removeFromCart, getTotalPrice, clearCart } = useCartStore();
  const { tr, lang, dir } = useLanguage();
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponMsg, setCouponMsg] = useState<{ text: string; ok: boolean } | null>(null);

  const subtotal = getTotalPrice();
  const discountAmount = Math.round(subtotal * (discount / 100) * 100) / 100;
  const afterDiscount = subtotal - discountAmount;
  const shipping = afterDiscount > 200 ? 0 : 15;
  const grandTotal = afterDiscount + shipping;

  const handleApplyCoupon = () => {
    const code = couponCode.trim().toUpperCase();
    const pct = VALID_COUPONS[code];
    if (pct) {
      setDiscount(pct);
      setCouponMsg({ text: `${tr("couponApplied")} (${pct}% off)`, ok: true });
    } else {
      setDiscount(0);
      setCouponMsg({ text: tr("couponInvalid"), ok: false });
    }
    setTimeout(() => setCouponMsg(null), 3000);
  };

  if (items.length === 0) {
    return (
      <main className="min-h-screen">
        <TopBar />
        <Header />
        <div className="max-w-2xl mx-auto px-4 py-24 text-center" dir={dir}>
          <div className="w-24 h-24 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-stone-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
            </svg>
          </div>
          <h1 className="text-2xl font-black text-ink mb-2">{tr("emptyCart")}</h1>
          <p className="text-stone-500 text-sm mb-8">{tr("emptyCartSub")}</p>
          <Link href="/shop" className="inline-flex items-center gap-2 bg-brown text-white px-8 py-3.5 rounded-xl font-bold hover:bg-brown-dark transition-colors cursor-pointer">
            {tr("heroShopNow")}
          </Link>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <TopBar />
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8" dir={dir}>
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-black text-ink">
            {tr("cartTitle")}
            <span className="ms-2 text-stone-400 font-normal text-base">({items.length})</span>
          </h1>
          <button
            onClick={clearCart}
            className="text-xs text-red-400 hover:text-red-600 transition-colors cursor-pointer flex items-center gap-1"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
            </svg>
            {tr("clearCart")}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ── Cart items ── */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => {
              const imgSrc = item.images?.[0] || item.image || PLACEHOLDER;
              const itemName = parseMLText(item.name)[lang];
              return (
                <div key={item.id} className="bg-white rounded-2xl border border-stone-100 p-4 shadow-sm flex gap-4">
                  {/* Product image */}
                  <Link href={`/product/${item.id}`} className="relative w-20 h-20 md:w-24 md:h-24 flex-none rounded-xl overflow-hidden bg-stone-50 cursor-pointer block">
                    <Image
                      src={imgSrc} alt={itemName} fill
                      className="object-contain p-2"
                      sizes="96px"
                      onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER; }}
                    />
                  </Link>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <Link href={`/product/${item.id}`} className="font-bold text-sm text-ink hover:text-brown transition-colors cursor-pointer line-clamp-2 leading-snug">
                          {itemName}
                        </Link>
                        <p className="text-gold text-xs font-semibold mt-0.5">{item.category}</p>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-stone-300 hover:text-red-400 transition-colors cursor-pointer flex-none"
                        aria-label="remove"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      {/* Quantity stepper */}
                      <div className="flex items-center border border-stone-200 rounded-lg overflow-hidden">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center text-stone-500 hover:bg-stone-50 transition-colors cursor-pointer text-sm"
                        >
                          −
                        </button>
                        <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={(item.stock ?? 999) <= item.quantity}
                          className="w-8 h-8 flex items-center justify-center text-stone-500 hover:bg-stone-50 transition-colors cursor-pointer text-sm disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          +
                        </button>
                      </div>

                      {/* Line total */}
                      <div className="text-end">
                        <div className="font-black text-brown text-base">
                          {(item.price * item.quantity).toFixed(2)} {tr("aed")}
                        </div>
                        {item.quantity > 1 && (
                          <div className="text-stone-400 text-xs">{item.price} × {item.quantity}</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            <Link href="/shop" className="inline-flex items-center gap-2 text-sm text-brown hover:text-brown-dark font-semibold transition-colors cursor-pointer mt-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={lang === "ar" ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"}/>
              </svg>
              {tr("continueShopping")}
            </Link>
          </div>

          {/* ── Order summary ── */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6 sticky top-24">
              <h2 className="font-bold text-lg text-ink mb-5">{tr("orderSummary")}</h2>

              <div className="space-y-3 mb-5">
                <div className="flex justify-between text-sm text-stone-600">
                  <span>{tr("subtotal")}</span>
                  <span className="font-semibold">{subtotal.toFixed(2)} {tr("aed")}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>{lang === "ar" ? `خصم ${discount}%` : `Discount ${discount}%`}</span>
                    <span className="font-semibold">− {discountAmount.toFixed(2)} {tr("aed")}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm text-stone-600">
                  <span>{tr("shipping")}</span>
                  <span className={`font-semibold ${shipping === 0 ? "text-green-600" : ""}`}>
                    {shipping === 0 ? tr("freeShipping") : `${shipping} ${tr("aed")}`}
                  </span>
                </div>
                {shipping > 0 && (
                  <p className="text-xs text-stone-400 bg-amber-50 border border-amber-100 px-3 py-2 rounded-lg">
                    {tr("freeShippingHint").replace("{amount}", String(Math.ceil(200 - afterDiscount)))}
                  </p>
                )}
                <div className="border-t border-stone-100 pt-3 flex justify-between font-black text-lg">
                  <span>{tr("total")}</span>
                  <span className="text-brown">{grandTotal.toFixed(2)} {tr("aed")}</span>
                </div>
              </div>

              {/* Coupon */}
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  placeholder={tr("couponPlaceholder")}
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
                  className="flex-1 bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brown/20 uppercase"
                />
                <button
                  onClick={handleApplyCoupon}
                  className="bg-stone-100 hover:bg-stone-200 text-stone-700 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer"
                >
                  {tr("apply")}
                </button>
              </div>
              {couponMsg && (
                <p className={`text-xs mb-3 px-3 py-2 rounded-lg ${couponMsg.ok ? "bg-green-50 text-green-700 border border-green-100" : "bg-red-50 text-red-600 border border-red-100"}`}>
                  {couponMsg.text}
                </p>
              )}
              <p className="text-xs text-stone-400 mb-4">
                {lang === "ar" ? "جرّب: TAMOURI10, WELCOME5, UAE15" : "Try: TAMOURI10, WELCOME5, UAE15"}
              </p>

              {/* Checkout button — pass coupon in query string */}
              <Link
                href={`/checkout${discount > 0 ? `?coupon=${couponCode.trim().toUpperCase()}` : ""}`}
                className="block w-full bg-gold hover:bg-gold-dark text-white py-4 rounded-xl font-bold text-base transition-all duration-200 cursor-pointer shadow-md shadow-gold/20 text-center"
              >
                {tr("checkout")}
              </Link>

              <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-stone-400">
                <svg className="w-3.5 h-3.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                </svg>
                {tr("securePayment")}
              </div>

              <div className="mt-3 flex gap-2 justify-center">
                {["Visa", "Mastercard", "Apple Pay"].map((m) => (
                  <div key={m} className="bg-stone-50 border border-stone-200 rounded px-2.5 py-1 text-xs font-bold text-stone-600">{m}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
