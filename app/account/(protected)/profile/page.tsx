"use client";
import { useState } from "react";
import AccountSidebar from "@/components/account/AccountSidebar";
import { useCustomerAuth } from "@/contexts/CustomerAuthContext";
import { useLanguage } from "@/contexts/LanguageContext";

export default function ProfilePage() {
  const { user, refresh } = useCustomerAuth();
  const { tr, dir } = useLanguage();

  const [form, setForm] = useState({
    name: user?.name ?? "",
    phone: user?.phone ?? "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setSuccess("");

    if (form.newPassword && form.newPassword !== form.confirmPassword) {
      setError(tr("passwordsNoMatch")); return;
    }

    setLoading(true);
    try {
      const body: Record<string, string> = { name: form.name, phone: form.phone };
      if (form.newPassword) {
        body.currentPassword = form.currentPassword;
        body.newPassword = form.newPassword;
      }

      const res = await fetch("/api/account/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        credentials: "include",
      });
      const data = await res.json() as { error?: string };
      if (!res.ok) { setError(data.error ?? "error"); return; }

      await refresh();
      setSuccess(tr("profileUpdated"));
      setForm((f) => ({ ...f, currentPassword: "", newPassword: "", confirmPassword: "" }));
    } finally {
      setLoading(false);
    }
  }

  const inp = "w-full px-4 py-2.5 border border-stone-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brown/20 focus:border-brown transition-all";

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8" dir={dir}>
      <div className="flex flex-col md:flex-row gap-6">
        <AccountSidebar />

        <div className="flex-1 min-w-0 space-y-6">
          {/* Profile info */}
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6">
            <h2 className="text-lg font-bold text-ink mb-5">{tr("personalInfo")}</h2>

            {success && (
              <div className="mb-4 bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-700 font-medium">
                {success}
              </div>
            )}
            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600 font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-stone-700 mb-1.5">{tr("nameLabel")}</label>
                  <input
                    type="text" required value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className={inp}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-stone-700 mb-1.5">{tr("emailLabel")}</label>
                  <input
                    type="email" value={user?.email ?? ""} disabled
                    className={`${inp} bg-stone-50 cursor-not-allowed opacity-70`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-stone-700 mb-1.5">{tr("phoneInput")}</label>
                  <input
                    type="tel" value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className={inp}
                  />
                </div>
              </div>

              <hr className="border-stone-100 my-2"/>
              <p className="text-sm font-semibold text-stone-600">{tr("changePassword")} <span className="font-normal text-stone-400">({tr("optional")})</span></p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { key: "currentPassword", label: "currentPasswordLabel" },
                  { key: "newPassword", label: "newPasswordLabel" },
                  { key: "confirmPassword", label: "confirmPasswordLabel" },
                ].map(({ key, label }) => (
                  <div key={key}>
                    <label className="block text-sm font-semibold text-stone-700 mb-1.5">{tr(label as Parameters<typeof tr>[0])}</label>
                    <input
                      type="password" autoComplete={key === "currentPassword" ? "current-password" : "new-password"}
                      value={form[key as keyof typeof form]}
                      onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                      className={inp}
                    />
                  </div>
                ))}
              </div>

              <div className="flex justify-end">
                <button
                  type="submit" disabled={loading}
                  className="px-6 py-2.5 bg-brown hover:bg-brown-dark text-white font-bold rounded-xl transition-colors cursor-pointer disabled:opacity-60"
                >
                  {loading ? "..." : tr("saveChanges")}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
