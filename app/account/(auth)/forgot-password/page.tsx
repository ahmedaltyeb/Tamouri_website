"use client";
import { useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";

export default function ForgotPasswordPage() {
  const { tr, dir } = useLanguage();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch("/api/auth/customer/forgot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setSent(true); // Always show success (prevents enumeration)
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
          <h1 className="text-2xl font-black text-ink">{tr("forgotPassword")}</h1>
          <p className="text-sm text-stone-500 mt-1">{tr("forgotPasswordDesc")}</p>
        </div>

        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6">
          {sent ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
                </svg>
              </div>
              <p className="text-sm text-stone-600">{tr("resetEmailSent")}</p>
              <Link href="/account/login" className="block text-brown font-semibold text-sm hover:underline cursor-pointer">
                {tr("backToLogin")}
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-1.5">{tr("emailLabel")}</label>
                <input
                  type="email" required value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-2.5 border border-stone-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brown/20 focus:border-brown transition-all"
                />
              </div>
              <button
                type="submit" disabled={loading}
                className="w-full py-3 bg-brown hover:bg-brown-dark text-white font-bold rounded-xl transition-colors cursor-pointer disabled:opacity-60"
              >
                {loading ? "..." : tr("sendResetLink")}
              </button>
              <p className="text-center">
                <Link href="/account/login" className="text-sm text-brown hover:underline cursor-pointer">
                  {tr("backToLogin")}
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
