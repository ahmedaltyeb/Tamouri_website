"use client";

import { useEffect, useState, useCallback } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Coupon {
  id: string;
  code: string;
  type: "percentage" | "fixed";
  discount: number;
  minOrderAmount: number | null;
  maxUses: number | null;
  usedCount: number;
  active: boolean;
  expiresAt: string | null;
  description: string | null;
  createdAt: string;
}

type FormState = {
  code: string;
  type: "percentage" | "fixed";
  discount: string;
  minOrderAmount: string;
  maxUses: string;
  active: boolean;
  expiresAt: string;
  description: string;
};

const EMPTY_FORM: FormState = {
  code: "",
  type: "percentage",
  discount: "",
  minOrderAmount: "",
  maxUses: "",
  active: true,
  expiresAt: "",
  description: "",
};

// ─── Page ────────────────────────────────────────────────────────────────────

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [toast, setToast] = useState("");

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/coupons");
      if (!res.ok) throw new Error("Failed to load");
      setCoupons(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  function openCreate() {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setError("");
    setShowForm(true);
  }

  function openEdit(c: Coupon) {
    setForm({
      code: c.code,
      type: c.type,
      discount: String(c.discount),
      minOrderAmount: c.minOrderAmount !== null ? String(c.minOrderAmount) : "",
      maxUses: c.maxUses !== null ? String(c.maxUses) : "",
      active: c.active,
      expiresAt: c.expiresAt ? c.expiresAt.slice(0, 10) : "",
      description: c.description ?? "",
    });
    setEditingId(c.id);
    setError("");
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setError("");
  }

  function f(key: keyof FormState, val: string | boolean) {
    setForm((prev) => ({ ...prev, [key]: val }));
    setError("");
  }

  async function handleSave() {
    if (!form.code.trim()) { setError("Code is required"); return; }
    const discount = parseFloat(form.discount);
    if (isNaN(discount) || discount <= 0) { setError("Enter a valid discount value"); return; }
    if (form.type === "percentage" && discount > 100) { setError("Percentage cannot exceed 100"); return; }

    setSaving(true);
    setError("");

    const body = {
      code: form.code.trim().toUpperCase(),
      type: form.type,
      discount,
      minOrderAmount: form.minOrderAmount ? parseFloat(form.minOrderAmount) : null,
      maxUses: form.maxUses ? parseInt(form.maxUses, 10) : null,
      active: form.active,
      expiresAt: form.expiresAt || null,
      description: form.description.trim() || null,
    };

    try {
      const url = editingId ? `/api/admin/coupons/${editingId}` : "/api/admin/coupons";
      const method = editingId ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Failed to save"); return; }
      showToast(editingId ? "Coupon updated" : "Coupon created");
      closeForm();
      void load();
    } catch {
      setError("Network error — please try again");
    } finally {
      setSaving(false);
    }
  }

  async function handleToggle(c: Coupon) {
    const res = await fetch(`/api/admin/coupons/${c.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !c.active }),
    });
    if (res.ok) {
      showToast(c.active ? "Coupon deactivated" : "Coupon activated");
      void load();
    }
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/admin/coupons/${id}`, { method: "DELETE" });
    if (res.ok || res.status === 204) {
      showToast("Coupon deleted");
      setDeleteConfirm(null);
      void load();
    }
  }

  // ── Computed stats ───────────────────────────────────────────────────────────
  const totalActive = coupons.filter((c) => c.active).length;
  const totalUses = coupons.reduce((s, c) => s + c.usedCount, 0);

  return (
    <div className="p-6 max-w-6xl mx-auto">

      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-green-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-lg">
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-stone-900">Coupons</h1>
          <p className="text-sm text-stone-400 mt-0.5">Create and manage discount codes</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Create Coupon
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Total Coupons", value: coupons.length },
          { label: "Active", value: totalActive },
          { label: "Total Uses", value: totalUses },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-stone-200 p-4">
            <p className="text-xs text-stone-400 font-semibold uppercase tracking-wider mb-1">{s.label}</p>
            <p className="text-2xl font-black text-stone-800">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Create / Edit Form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-amber-200 p-5 mb-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-stone-800">{editingId ? "Edit Coupon" : "New Coupon"}</h2>
            <button onClick={closeForm} className="text-stone-400 hover:text-stone-600 cursor-pointer">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Code */}
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1.5">
                Coupon Code <span className="text-red-400">*</span>
              </label>
              <input
                value={form.code}
                onChange={(e) => f("code", e.target.value.toUpperCase())}
                placeholder="SUMMER20"
                className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-300 uppercase tracking-widest font-mono"
              />
            </div>

            {/* Type */}
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1.5">Type</label>
              <div className="flex rounded-lg border border-stone-200 overflow-hidden">
                {(["percentage", "fixed"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => f("type", t)}
                    className={`flex-1 py-2 text-sm font-semibold transition-colors cursor-pointer ${
                      form.type === t
                        ? "bg-amber-100 text-amber-800"
                        : "text-stone-500 hover:bg-stone-50"
                    }`}
                  >
                    {t === "percentage" ? "% Percentage" : "AED Fixed"}
                  </button>
                ))}
              </div>
            </div>

            {/* Discount value */}
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1.5">
                Discount {form.type === "percentage" ? "(%)" : "(AED)"} <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                min="0.01"
                max={form.type === "percentage" ? "100" : undefined}
                step="0.01"
                value={form.discount}
                onChange={(e) => f("discount", e.target.value)}
                placeholder={form.type === "percentage" ? "10" : "50"}
                className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-300"
              />
            </div>

            {/* Minimum order */}
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1.5">
                Min. Order (AED) <span className="text-stone-300">optional</span>
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.minOrderAmount}
                onChange={(e) => f("minOrderAmount", e.target.value)}
                placeholder="100"
                className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-300"
              />
            </div>

            {/* Max uses */}
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1.5">
                Max Uses <span className="text-stone-300">leave blank for unlimited</span>
              </label>
              <input
                type="number"
                min="1"
                step="1"
                value={form.maxUses}
                onChange={(e) => f("maxUses", e.target.value)}
                placeholder="100"
                className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-300"
              />
            </div>

            {/* Expires at */}
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1.5">
                Expires On <span className="text-stone-300">leave blank = never</span>
              </label>
              <input
                type="date"
                value={form.expiresAt}
                onChange={(e) => f("expiresAt", e.target.value)}
                className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-300"
              />
            </div>

            {/* Description */}
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-stone-600 mb-1.5">
                Internal Note <span className="text-stone-300">optional</span>
              </label>
              <input
                value={form.description}
                onChange={(e) => f("description", e.target.value)}
                placeholder="e.g. Welcome offer for new customers"
                className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-300"
              />
            </div>

            {/* Active toggle */}
            <div className="col-span-2 flex items-center gap-3">
              <button
                type="button"
                onClick={() => f("active", !form.active)}
                className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                  form.active ? "bg-green-500" : "bg-stone-200"
                }`}
              >
                <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform duration-200 ${form.active ? "translate-x-4" : "translate-x-0"}`} />
              </button>
              <span className="text-sm text-stone-600 font-medium">
                {form.active ? "Active — customers can use this code" : "Inactive — code is disabled"}
              </span>
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-600 mt-3 font-medium">{error}</p>
          )}

          <div className="flex gap-3 mt-4 pt-4 border-t border-stone-100">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors cursor-pointer"
            >
              {saving ? "Saving…" : editingId ? "Save Changes" : "Create Coupon"}
            </button>
            <button
              onClick={closeForm}
              className="border border-stone-200 text-stone-600 hover:bg-stone-50 text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-stone-400 text-sm">Loading coupons…</div>
        ) : coupons.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-stone-400 text-sm mb-2">No coupons yet</p>
            <button
              onClick={openCreate}
              className="text-amber-600 font-semibold text-sm hover:underline cursor-pointer"
            >
              Create your first coupon
            </button>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-100">
                {["Code", "Discount", "Min Order", "Uses", "Expires", "Status", ""].map((h) => (
                  <th key={h} className="text-left text-xs font-bold text-stone-400 uppercase tracking-wider px-4 py-3">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {coupons.map((c) => {
                const isExpired = c.expiresAt ? new Date(c.expiresAt) < new Date() : false;
                const isMaxed = c.maxUses !== null && c.usedCount >= c.maxUses;
                const effectivelyActive = c.active && !isExpired && !isMaxed;

                return (
                  <tr key={c.id} className="hover:bg-stone-50 transition-colors">
                    {/* Code */}
                    <td className="px-4 py-3">
                      <div>
                        <span className="font-mono font-bold text-stone-800 tracking-widest">{c.code}</span>
                        {c.description && (
                          <p className="text-xs text-stone-400 mt-0.5 truncate max-w-[180px]">{c.description}</p>
                        )}
                      </div>
                    </td>

                    {/* Discount */}
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${
                        c.type === "percentage"
                          ? "bg-blue-50 text-blue-700"
                          : "bg-purple-50 text-purple-700"
                      }`}>
                        {c.type === "percentage" ? `${c.discount}%` : `${c.discount} AED`}
                      </span>
                    </td>

                    {/* Min order */}
                    <td className="px-4 py-3 text-stone-500">
                      {c.minOrderAmount !== null ? `${c.minOrderAmount} AED` : "—"}
                    </td>

                    {/* Uses */}
                    <td className="px-4 py-3">
                      <span className={isMaxed ? "text-red-600 font-semibold" : "text-stone-600"}>
                        {c.usedCount}
                        {c.maxUses !== null && (
                          <span className="text-stone-400"> / {c.maxUses}</span>
                        )}
                      </span>
                    </td>

                    {/* Expires */}
                    <td className="px-4 py-3">
                      {c.expiresAt ? (
                        <span className={isExpired ? "text-red-500 font-semibold" : "text-stone-600"}>
                          {new Date(c.expiresAt).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                          {isExpired && <span className="ml-1 text-xs">(expired)</span>}
                        </span>
                      ) : (
                        <span className="text-stone-400">Never</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <button
                        onClick={() => void handleToggle(c)}
                        title={c.active ? "Click to deactivate" : "Click to activate"}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-colors cursor-pointer ${
                          effectivelyActive
                            ? "bg-green-50 text-green-700 hover:bg-green-100"
                            : "bg-stone-100 text-stone-500 hover:bg-stone-200"
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${effectivelyActive ? "bg-green-500" : "bg-stone-400"}`} />
                        {effectivelyActive ? "Active" : "Inactive"}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEdit(c)}
                          className="p-1.5 text-stone-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                          title="Edit"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
                          </svg>
                        </button>

                        {deleteConfirm === c.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => void handleDelete(c.id)}
                              className="text-xs font-bold text-white bg-red-500 hover:bg-red-600 px-2 py-1 rounded-lg cursor-pointer"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(null)}
                              className="text-xs text-stone-500 hover:text-stone-700 px-1 cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirm(c.id)}
                            className="p-1.5 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
