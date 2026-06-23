"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/admin/products";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Invalid email or password.");
      setLoading(false);
    } else {
      router.push(callbackUrl);
      router.refresh();
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      dir="ltr"
      style={{ backgroundColor: "#FAF8F5" }}
    >
      <div className="w-full max-w-sm">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-brown to-gold rounded-2xl flex items-center justify-center text-white font-black text-3xl shadow-md mx-auto mb-3">
            م
          </div>
          <p className="text-lg font-black text-brown leading-tight">مربع الغربية للتمور</p>
          <p className="text-xs font-semibold tracking-widest uppercase text-stone-400 mt-1">
            Admin Panel
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-8">
          <h1 className="text-lg font-bold text-stone-800 mb-6">Sign in to continue</h1>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3 mb-5">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-stone-700 mb-1.5"
              >
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@tamouri.com"
                className="w-full px-3 py-2.5 text-sm border border-stone-200 rounded-lg bg-white text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-400 transition-colors"
                autoComplete="email"
                required
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-stone-700 mb-1.5"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2.5 text-sm border border-stone-200 rounded-lg bg-white text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-400 transition-colors"
                autoComplete="current-password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 mt-2 text-sm font-semibold text-white rounded-lg transition-colors duration-150 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ backgroundColor: loading ? "#d97706" : "#d97706" }}
              onMouseEnter={(e) => {
                if (!loading) (e.currentTarget.style.backgroundColor = "#b45309");
              }}
              onMouseLeave={(e) => {
                (e.currentTarget.style.backgroundColor = "#d97706");
              }}
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-stone-400 mt-6">
          <a href="/" className="hover:text-stone-600 transition-colors">
            ← Back to store
          </a>
        </p>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
