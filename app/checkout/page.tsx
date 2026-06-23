"use client";
import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import TopBar from "@/components/TopBar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useCartStore } from "@/store/cartStore";

type Field = "name" | "email" | "phone" | "address" | "notes";

type FormState = Record<Field, string>;

const EMPTY: FormState = { name: "", email: "", phone: "", address: "", notes: "" };

export default function CheckoutPage() {
  const { items, getTotalPrice, _hydrated } = useCartStore();
  const router = useRouter();
  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Partial<FormState> & { general?: string }>({});
  const [isPending, startTransition] = useTransition();

  // Redirect to cart if empty (after hydration)
  useEffect(() => {
    if (_hydrated && items.length === 0) {
      router.replace("/cart");
    }
  }, [_hydrated, items.length, router]);

  const subtotal = getTotalPrice();
  const shipping = subtotal > 200 ? 0 : 15;
  const total = subtotal + shipping;

  function set(field: Field, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function validate(): boolean {
    const e: typeof errors = {};
    if (!form.name.trim()) e.name = "الاسم مطلوب / Name required";
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "البريد الإلكتروني غير صحيح / Invalid email";
    if (!form.phone.trim()) e.phone = "رقم الهاتف مطلوب / Phone required";
    if (!form.address.trim()) e.address = "العنوان مطلوب / Address required";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    startTransition(async () => {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim().toLowerCase(),
          phone: form.phone.trim(),
          address: form.address.trim(),
          notes: form.notes.trim() || undefined,
          items: items.map((i) => ({ id: i.id, quantity: i.quantity })),
        }),
      });

      const data = (await res.json()) as {
        orderId?: string;
        error?: string;
        errors?: string[];
      };

      if (!res.ok) {
        setErrors({
          general:
            data.errors?.join(", ") ?? data.error ?? "Something went wrong",
        });
        return;
      }

      // Create Stripe Checkout Session and redirect to Stripe
      const sessionRes = await fetch("/api/checkout/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: data.orderId }),
      });
      const sessionData = (await sessionRes.json()) as {
        url?: string;
        error?: string;
      };
      if (!sessionRes.ok || !sessionData.url) {
        setErrors({ general: sessionData.error ?? "Failed to start payment" });
        return;
      }
      // Cart is cleared on /order-success after Stripe redirects back
      window.location.href = sessionData.url;
    });
  }

  // Show nothing until hydrated (avoids flash of empty cart)
  if (!_hydrated) return null;

  return (
    <main className="min-h-screen">
      <TopBar />
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        {/* Back */}
        <Link
          href="/cart"
          className="inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-800 transition-colors mb-8 cursor-pointer"
        >
          <ChevronRightIcon />
          العودة إلى السلة — Back to Cart
        </Link>

        <h1 className="text-2xl font-black text-stone-900 mb-8">
          إتمام الطلب — Checkout
        </h1>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* ── Customer form ─────────────────────────────────────────────── */}
            <div className="lg:col-span-2 space-y-6">
              {errors.general && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
                  {errors.general}
                </div>
              )}

              <section className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6">
                <h2 className="text-base font-bold text-stone-800 mb-5">
                  معلومات العميل — Customer Information
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field
                    label="الاسم الكامل / Full Name"
                    id="name"
                    value={form.name}
                    onChange={(v) => set("name", v)}
                    error={errors.name}
                    placeholder="محمد عبدالله / Mohammed Abdullah"
                    required
                  />
                  <Field
                    label="البريد الإلكتروني / Email"
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(v) => set("email", v)}
                    error={errors.email}
                    placeholder="you@example.com"
                    required
                  />
                  <Field
                    label="رقم الهاتف / Phone"
                    id="phone"
                    type="tel"
                    value={form.phone}
                    onChange={(v) => set("phone", v)}
                    error={errors.phone}
                    placeholder="+971 50 000 0000"
                    required
                  />
                </div>
              </section>

              <section className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6">
                <h2 className="text-base font-bold text-stone-800 mb-5">
                  عنوان التوصيل — Shipping Address
                </h2>
                <Field
                  label="العنوان الكامل / Full Address"
                  id="address"
                  value={form.address}
                  onChange={(v) => set("address", v)}
                  error={errors.address}
                  placeholder="المدينة، المنطقة، الشارع، رقم المبنى…"
                  required
                  multiline
                />
              </section>

              <section className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6">
                <h2 className="text-base font-bold text-stone-800 mb-5">
                  ملاحظات — Notes (Optional)
                </h2>
                <Field
                  label="ملاحظات للطلب / Order Notes"
                  id="notes"
                  value={form.notes}
                  onChange={(v) => set("notes", v)}
                  placeholder="أي تعليمات أو طلبات خاصة…"
                  multiline
                />
              </section>
            </div>

            {/* ── Order summary ──────────────────────────────────────────────── */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6 sticky top-24">
                <h2 className="font-bold text-lg text-stone-900 mb-5">
                  ملخص الطلب — Summary
                </h2>

                <div className="space-y-3 mb-5">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-10 h-10 rounded-lg object-cover bg-stone-100 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-stone-800 truncate">
                          {item.name}
                        </p>
                        <p className="text-xs text-stone-400">
                          {item.price} AED × {item.quantity}
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-stone-800 whitespace-nowrap">
                        {(item.price * item.quantity).toFixed(2)} AED
                      </p>
                    </div>
                  ))}
                </div>

                <div className="border-t border-stone-100 pt-4 space-y-2 mb-6">
                  <div className="flex justify-between text-sm text-stone-500">
                    <span>المجموع / Subtotal</span>
                    <span>{subtotal.toFixed(2)} AED</span>
                  </div>
                  <div className="flex justify-between text-sm text-stone-500">
                    <span>الشحن / Shipping</span>
                    <span className={shipping === 0 ? "text-emerald-600 font-semibold" : ""}>
                      {shipping === 0 ? "مجاني / Free" : `${shipping} AED`}
                    </span>
                  </div>
                  {shipping > 0 && (
                    <p className="text-xs text-stone-400 bg-amber-50 border border-amber-100 px-3 py-2 rounded-lg">
                      أضف {(200 - subtotal).toFixed(0)} AED للشحن المجاني
                    </p>
                  )}
                  <div className="flex justify-between font-black text-base text-stone-900 pt-2 border-t border-stone-100">
                    <span>الإجمالي / Total</span>
                    <span className="text-amber-700">{total.toFixed(2)} AED</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full bg-amber-600 hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold text-base transition-colors duration-200 cursor-pointer"
                >
                  {isPending ? "جاري إرسال الطلب…" : "تأكيد الطلب — Place Order"}
                </button>

                <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-stone-400">
                  <LockIcon />
                  الدفع آمن — Secure checkout
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

// ── Field component ────────────────────────────────────────────────────────────

function Field({
  label,
  id,
  type = "text",
  value,
  onChange,
  error,
  placeholder,
  required,
  multiline,
}: {
  label: string;
  id: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  placeholder?: string;
  required?: boolean;
  multiline?: boolean;
}) {
  const base =
    "w-full bg-stone-50 border rounded-xl px-4 py-3 text-sm outline-none transition-all focus:ring-2 focus:ring-amber-300/50 focus:border-amber-400";
  const cls = error
    ? `${base} border-red-300 focus:border-red-400 focus:ring-red-200/50`
    : `${base} border-stone-200`;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-xs font-semibold text-stone-600">
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {multiline ? (
        <textarea
          id={id}
          rows={3}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cls}
        />
      ) : (
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cls}
        />
      )}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

function ChevronRightIcon() {
  return (
    <svg className="w-4 h-4 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
    </svg>
  );
}
