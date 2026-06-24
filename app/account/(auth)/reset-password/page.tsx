"use client";
import { Suspense } from "react";
import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useCustomerAuth } from "@/contexts/CustomerAuthContext";
import { useLanguage } from "@/contexts/LanguageContext";

function ResetPasswordForm() {
  const { refresh } = useCustomerAuth();
  const { tr, dir } = useLanguage();
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get("token") ?? "";

  const [form, setForm] = useState({ password: "", confirm: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (form.password.length < 8) { setError(tr("passwordTooShort")); return; }
    if (form.password !== form.confirm) { setError(tr("passwordsNoMatch")); return; }
    if (!token) { setError(tr("invalidToken")); return; }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/customer/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password: form.password }),
        credentials: "include",
      });
      const data = await res.json() as { error?: string };
      if (!res.ok) { setError(data.error ?? "error"); return; }
      await refresh();
      router.push("/account/profile");
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
          <h1 className="text-2xl font-black text-ink">{tr("resetPassword")}</h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600 font-medium">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-1.5">{tr("newPasswordLabel")}</label>
            <input
              type="password" required autoComplete="new-password"
              value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 border border-stone-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brown/20 focus:border-brown transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-1.5">{tr("confirmPasswordLabel")}</label>
            <input
              type="password" required autoComplete="new-password"
              value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 border border-stone-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brown/20 focus:border-brown transition-all"
            />
          </div>

          <button
            type="submit" disabled={loading || !token}
            className="w-full py-3 bg-brown hover:bg-brown-dark text-white font-bold rounded-xl transition-colors cursor-pointer disabled:opacity-60"
          >
            {loading ? "..." : tr("resetPasswordBtn")}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-[70vh] flex items-center justify-center"><div className="w-8 h-8 border-2 border-brown border-t-transparent rounded-full animate-spin"/></div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
