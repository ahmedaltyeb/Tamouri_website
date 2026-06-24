"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCustomerAuth } from "@/contexts/CustomerAuthContext";
import { useLanguage } from "@/contexts/LanguageContext";

type FieldErrors = Record<string, string>;

export default function RegisterPage() {
  const { refresh } = useCustomerAuth();
  const { tr, dir } = useLanguage();
  const router = useRouter();

  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "", phone: "" });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  function validate(): boolean {
    const errs: FieldErrors = {};
    if (!form.name.trim()) errs.name = tr("fieldRequired");
    if (!form.email.trim()) errs.email = tr("fieldRequired");
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = tr("invalidEmail");
    if (!form.password) errs.password = tr("fieldRequired");
    else if (form.password.length < 8) errs.password = tr("passwordTooShort");
    if (form.password !== form.confirm) errs.confirm = tr("passwordsNoMatch");
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError("");
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/auth/customer/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, email: form.email, password: form.password, phone: form.phone }),
        credentials: "include",
      });
      const data = await res.json() as { field?: string; error?: string };
      if (!res.ok) {
        if (data.field) setFieldErrors({ [data.field]: tr(data.error as Parameters<typeof tr>[0]) });
        else setServerError(data.error ?? "error");
        return;
      }
      await refresh();
      router.push("/account/profile");
    } finally {
      setLoading(false);
    }
  }

  const inp = "w-full px-4 py-2.5 border border-stone-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brown/20 focus:border-brown transition-all";

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12" dir={dir}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-gradient-to-br from-brown to-gold rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-md mx-auto mb-3">
            م
          </div>
          <h1 className="text-2xl font-black text-ink">{tr("register")}</h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6 space-y-4">
          {serverError && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600 font-medium">
              {serverError}
            </div>
          )}

          {(["name", "email", "password", "confirm", "phone"] as const).map((field) => (
            <div key={field}>
              <label className="block text-sm font-semibold text-stone-700 mb-1.5">
                {tr(field === "confirm" ? "confirmPasswordLabel"
                  : field === "phone" ? "phoneInput"
                  : field === "password" ? "passwordLabel"
                  : field === "email" ? "emailLabel"
                  : "nameLabel")}
              </label>
              <input
                type={field === "password" || field === "confirm" ? "password" : field === "email" ? "email" : "text"}
                required={field !== "phone"}
                autoComplete={field === "confirm" ? "new-password" : field === "password" ? "new-password" : field}
                value={form[field]}
                onChange={(e) => {
                  setForm({ ...form, [field]: e.target.value });
                  if (fieldErrors[field]) setFieldErrors({ ...fieldErrors, [field]: "" });
                }}
                className={`${inp} ${fieldErrors[field] ? "border-red-300 focus:ring-red-200 focus:border-red-400" : ""}`}
              />
              {fieldErrors[field] && (
                <p className="text-xs text-red-500 mt-1">{fieldErrors[field]}</p>
              )}
            </div>
          ))}

          <button
            type="submit" disabled={loading}
            className="w-full py-3 bg-brown hover:bg-brown-dark text-white font-bold rounded-xl transition-colors cursor-pointer disabled:opacity-60"
          >
            {loading ? "..." : tr("createAccountBtn")}
          </button>
        </form>

        <p className="text-center text-sm text-stone-500 mt-4">
          {tr("haveAccount")}{" "}
          <Link href="/account/login" className="text-brown font-semibold hover:underline cursor-pointer">
            {tr("signIn")}
          </Link>
        </p>
      </div>
    </div>
  );
}
