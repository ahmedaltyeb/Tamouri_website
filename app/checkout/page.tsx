"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import TopBar from "@/components/TopBar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PaymentMethods from "@/components/PaymentMethods";
import { useCheckoutStart } from "@/hooks/useAnalytics";
import { useCartStore } from "@/store/cartStore";
import { useCustomerAuth } from "@/contexts/CustomerAuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { parseMLText } from "@/lib/products";

const PLACEHOLDER = "/placeholder.svg";

interface Address {
  id: string; label: string; fullName: string; phone: string;
  line1: string; line2?: string | null; city: string; emirate: string; isDefault: boolean;
}

// ── Address selector ──────────────────────────────────────────────────────────
function AddressSelector({
  addresses,
  selectedId,
  onSelect,
  onManual,
  isManual,
}: {
  addresses: Address[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onManual: () => void;
  isManual: boolean;
}) {
  const { tr, dir } = useLanguage();
  return (
    <div className="space-y-2" dir={dir}>
      {addresses.map((a) => (
        <label
          key={a.id}
          className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
            selectedId === a.id && !isManual
              ? "border-brown bg-brown/5"
              : "border-stone-200 hover:border-brown/40"
          }`}
        >
          <input
            type="radio"
            name="address"
            className="mt-1 accent-brown"
            checked={selectedId === a.id && !isManual}
            onChange={() => onSelect(a.id)}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-ink">{a.label}</p>
              {a.isDefault && (
                <span className="text-[10px] bg-brown text-white px-1.5 py-0.5 rounded-full font-bold">
                  {tr("defaultAddress")}
                </span>
              )}
            </div>
            <p className="text-xs text-stone-500 mt-0.5">{a.fullName} · {a.phone}</p>
            <p className="text-xs text-stone-400">
              {a.line1}{a.line2 ? `, ${a.line2}` : ""}, {a.city}, {a.emirate}
            </p>
          </div>
        </label>
      ))}
      <label
        className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
          isManual ? "border-brown bg-brown/5" : "border-stone-200 hover:border-brown/40"
        }`}
      >
        <input
          type="radio" name="address"
          className="accent-brown"
          checked={isManual}
          onChange={onManual}
        />
        <span className="text-sm font-medium text-stone-600">{tr("enterAddressManually")}</span>
      </label>
    </div>
  );
}

// ── Main checkout form ────────────────────────────────────────────────────────
function CheckoutForm() {
  const { user } = useCustomerAuth();
  const { items, getTotalPrice, _hydrated, clearCart } = useCartStore();
  const { tr, lang, dir } = useLanguage();
  const router = useRouter();
  const params = useSearchParams();
  const coupon = params.get("coupon") ?? "";

  // Track checkout start once per mount
  useCheckoutStart();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [isManualAddress, setIsManualAddress] = useState(false);

  const [form, setForm] = useState({
    name: "", email: "", phone: "", address: "", notes: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  // Fetch saved addresses for logged-in user
  useEffect(() => {
    if (!user) return;
    fetch("/api/account/addresses", { credentials: "include" })
      .then((r) => r.json())
      .then((data: Address[]) => {
        setAddresses(data);
        const def = data.find((a) => a.isDefault) ?? data[0];
        if (def) {
          setSelectedAddressId(def.id);
          setIsManualAddress(false);
        } else {
          setIsManualAddress(true);
        }
      })
      .catch(() => setIsManualAddress(true));
  }, [user?.id]);

  // Pre-fill from user profile
  useEffect(() => {
    if (user) {
      setForm((f) => ({ ...f, name: user.name, email: user.email, phone: user.phone ?? "" }));
    }
  }, [user?.id]);

  // Redirect if cart empty after hydration
  useEffect(() => {
    if (_hydrated && items.length === 0) router.replace("/cart");
  }, [_hydrated, items.length, router]);

  if (!_hydrated) return null;

  const subtotal = getTotalPrice();
  const shipping = subtotal > 200 ? 0 : 15;
  const grandTotal = subtotal + shipping;

  function validateForm(): boolean {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = tr("fieldRequired");
    if (!user) {
      if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
        e.email = tr("invalidEmail");
      if (!form.phone.trim()) e.phone = tr("fieldRequired");
    } else if (!form.phone.trim()) {
      e.phone = tr("fieldRequired");
    }
    if (isManualAddress && !form.address.trim()) e.address = tr("fieldRequired");
    if (!isManualAddress && !selectedAddressId) e.address = tr("selectAddress");
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validateForm()) return;
    setSubmitting(true);

    try {
      const payload: Record<string, unknown> = {
        name: form.name.trim(),
        phone: form.phone.trim(),
        notes: form.notes.trim() || undefined,
        coupon: coupon || undefined,
        items: items.map((i) => ({ id: i.id, quantity: i.quantity })),
      };

      if (!user) {
        payload.email = form.email.trim().toLowerCase();
      }

      if (isManualAddress) {
        payload.address = form.address.trim();
      } else {
        payload.addressId = selectedAddressId;
      }

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await res.json() as { orderId?: string; error?: string; errors?: string[] };

      if (!res.ok) {
        setErrors({ general: data.errors?.join(", ") ?? data.error ?? "Something went wrong" });
        return;
      }

      // Clear local cart then navigate to success
      clearCart();
      router.push(`/order-success?id=${data.orderId}`);
    } finally {
      setSubmitting(false);
    }
  }

  const inp = "w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-brown/20 focus:border-brown transition-all";
  const inpErr = "w-full bg-stone-50 border border-red-300 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition-all";

  return (
    <main className="min-h-screen">
      <TopBar />
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10" dir={dir}>
        {/* Back */}
        <Link
          href="/cart"
          className="inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-800 transition-colors mb-8 cursor-pointer"
        >
          <svg className={`w-4 h-4 ${lang === "ar" ? "" : "rotate-180"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
          </svg>
          {tr("backToCart")}
        </Link>

        <h1 className="text-2xl font-black text-ink mb-8">{tr("checkoutTitle")}</h1>

        {/* Login prompt for guests */}
        {!user && (
          <div className="mb-6 flex items-center gap-3 bg-brown/5 border border-brown/20 rounded-2xl px-5 py-4">
            <svg className="w-5 h-5 text-brown flex-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
            </svg>
            <p className="text-sm text-stone-600">{tr("loginForFasterCheckout")}</p>
            <Link href={`/account/login?from=/checkout`} className="ms-auto text-sm font-bold text-brown hover:underline cursor-pointer flex-none">
              {tr("signIn")}
            </Link>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* ── Left: form ── */}
            <div className="lg:col-span-2 space-y-6">
              {errors.general && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
                  {errors.general}
                </div>
              )}

              {/* Customer info */}
              <section className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6">
                <h2 className="text-base font-bold text-ink mb-5">{tr("customerInfoSection")}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-600 mb-1.5">
                      {tr("nameLabel")} <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text" required value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className={errors.name ? inpErr : inp}
                    />
                    {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-600 mb-1.5">
                      {tr("emailLabel")} {!user && <span className="text-red-400">*</span>}
                    </label>
                    <input
                      type="email" required={!user}
                      value={form.email} disabled={!!user}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className={`${errors.email ? inpErr : inp} ${user ? "opacity-60 cursor-not-allowed" : ""}`}
                    />
                    {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-600 mb-1.5">
                      {tr("phoneInput")} <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="tel" required value={form.phone}
                      placeholder="+971 50 000 0000"
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className={errors.phone ? inpErr : inp}
                    />
                    {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
                  </div>
                </div>
              </section>

              {/* Shipping address */}
              <section className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6">
                <h2 className="text-base font-bold text-ink mb-5">{tr("shippingAddressSection")}</h2>

                {user && addresses.length > 0 && (
                  <>
                    <p className="text-xs font-semibold text-stone-500 mb-3">{tr("savedAddresses")}</p>
                    <AddressSelector
                      addresses={addresses}
                      selectedId={selectedAddressId}
                      onSelect={(id) => { setSelectedAddressId(id); setIsManualAddress(false); }}
                      onManual={() => { setIsManualAddress(true); setSelectedAddressId(null); }}
                      isManual={isManualAddress}
                    />
                    {errors.address && <p className="text-xs text-red-500 mt-2">{errors.address}</p>}
                  </>
                )}

                {(isManualAddress || !user || addresses.length === 0) && (
                  <div className={user && addresses.length > 0 ? "mt-4" : ""}>
                    <label className="block text-xs font-semibold text-stone-600 mb-1.5">
                      {lang === "ar" ? "العنوان الكامل" : "Full Address"} <span className="text-red-400">*</span>
                    </label>
                    <textarea
                      rows={3} required={isManualAddress || !user}
                      value={form.address}
                      onChange={(e) => setForm({ ...form, address: e.target.value })}
                      placeholder={lang === "ar" ? "الإمارة، المدينة، المنطقة، الشارع، رقم المبنى…" : "Emirate, City, District, Street, Building…"}
                      className={errors.address ? inpErr : inp}
                    />
                    {errors.address && <p className="text-xs text-red-500 mt-1">{errors.address}</p>}
                  </div>
                )}
              </section>

              {/* Notes */}
              <section className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6">
                <h2 className="text-base font-bold text-ink mb-5">{tr("orderNotesSection")}</h2>
                <textarea
                  rows={3} value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder={tr("orderNotesPlaceholder")}
                  className={inp}
                />
              </section>
            </div>

            {/* ── Right: order summary ── */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6 sticky top-24">
                <h2 className="font-bold text-lg text-ink mb-5">{tr("orderSummary")}</h2>

                {/* Items mini-list */}
                <div className="space-y-3 mb-5">
                  {items.map((item) => {
                    const imgSrc = item.images?.[0] || item.image || PLACEHOLDER;
                    const itemName = parseMLText(item.name)[lang];
                    return (
                      <div key={item.id} className="flex items-center gap-3">
                        <div className="relative w-10 h-10 flex-none rounded-lg overflow-hidden bg-stone-100">
                          <Image
                            src={imgSrc} alt={itemName} fill
                            className="object-contain p-1" sizes="40px"
                            onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER; }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-ink truncate">{itemName}</p>
                          <p className="text-xs text-stone-400">{item.price} {tr("aed")} × {item.quantity}</p>
                        </div>
                        <p className="text-sm font-semibold text-ink whitespace-nowrap">
                          {(item.price * item.quantity).toFixed(2)} {tr("aed")}
                        </p>
                      </div>
                    );
                  })}
                </div>

                <div className="border-t border-stone-100 pt-4 space-y-2 mb-6">
                  <div className="flex justify-between text-sm text-stone-500">
                    <span>{tr("subtotal")}</span>
                    <span>{subtotal.toFixed(2)} {tr("aed")}</span>
                  </div>
                  <div className="flex justify-between text-sm text-stone-500">
                    <span>{tr("shipping")}</span>
                    <span className={shipping === 0 ? "text-green-600 font-semibold" : ""}>
                      {shipping === 0 ? tr("freeShipping") : `${shipping} ${tr("aed")}`}
                    </span>
                  </div>
                  {coupon && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>{lang === "ar" ? "كوبون" : "Coupon"}: {coupon}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-black text-base text-ink pt-2 border-t border-stone-100">
                    <span>{tr("total")}</span>
                    <span className="text-brown">{grandTotal.toFixed(2)} {tr("aed")}</span>
                  </div>
                </div>

                <button
                  type="submit" disabled={submitting}
                  className="w-full bg-gold hover:bg-gold-dark disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold text-base transition-colors duration-200 cursor-pointer"
                >
                  {submitting ? tr("placingOrder") : tr("placeOrder")}
                </button>

                <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-stone-400">
                  <svg className="w-3.5 h-3.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                  </svg>
                  {tr("securePayment")}
                </div>

                <div className="mt-5 pt-4 border-t border-stone-100">
                  <p className="text-xs text-stone-400 mb-2 text-center">
                    {lang === "ar" ? "وسائل الدفع المقبولة" : "Accepted payment methods"}
                  </p>
                  <PaymentMethods className="justify-center" />
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>

      <Footer />
    </main>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={null}>
      <CheckoutForm />
    </Suspense>
  );
}
