"use client";
import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCustomerAuth } from "@/contexts/CustomerAuthContext";
import { useLanguage } from "@/contexts/LanguageContext";

function LoginForm() {
  const { refresh } = useCustomerAuth();
  const { tr, dir } = useLanguage();
  const router = useRouter();
  const params = useSearchParams();
  const from = params.get("from") ?? "/account/profile";

  const [form, setForm] = useState({ email: "", password: "", remember: false });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/customer/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
        credentials: "include",
      });
      const data = await res.json() as { error?: string };
      if (!res.ok) { setError(data.error ?? "invalidCredentials"); return; }
      await refresh();
      router.push(from);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12" dir={dir}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-gradient-to-br from-brown to-gold rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-md mx-auto mb-3">
            م
          </div>
          <h1 className="text-2xl font-black text-ink">{tr("signIn")}</h1>
          <p className="text-sm text-stone-500 mt-1">{tr("welcomeBack")}</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600 font-medium">
              {tr(error as Parameters<typeof tr>[0]) || error}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-1.5">{tr("emailLabel")}</label>
            <input
              type="email" required autoComplete="email"
              value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="you@example.com"
              className="w-full px-4 py-2.5 border border-stone-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brown/20 focus:border-brown transition-all"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-semibold text-stone-700">{tr("passwordLabel")}</label>
              <Link href="/account/forgot-password" className="text-xs text-brown hover:underline cursor-pointer">
                {tr("forgotPasswordLink")}
              </Link>
            </div>
            <input
              type="password" required autoComplete="current-password"
              value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 border border-stone-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brown/20 focus:border-brown transition-all"
            />
          </div>

          <label className="flex items-center gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox" checked={form.remember}
              onChange={(e) => setForm({ ...form, remember: e.target.checked })}
              className="w-4 h-4 rounded border-stone-300 accent-brown cursor-pointer"
            />
            <span className="text-sm text-stone-600">{tr("rememberMe")}</span>
          </label>

          <button
            type="submit" disabled={loading}
            className="w-full py-3 bg-brown hover:bg-brown-dark text-white font-bold rounded-xl transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "..." : tr("signInBtn")}
          </button>
        </form>

        <p className="text-center text-sm text-stone-500 mt-4">
          {tr("noAccount")}{" "}
          <Link href="/account/register" className="text-brown font-semibold hover:underline cursor-pointer">
            {tr("register")}
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-[70vh] flex items-center justify-center"><div className="w-8 h-8 border-2 border-brown border-t-transparent rounded-full animate-spin"/></div>}>
      <LoginForm />
    </Suspense>
  );
}
