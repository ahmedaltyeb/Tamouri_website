"use client";
import { useState, useEffect, useRef } from "react";

interface PaymentMethod {
  id: string;
  name: string;
  image: string;
  enabled: boolean;
  sortOrder: number;
}

const EMPTY_FORM = { name: "", image: "", enabled: true, sortOrder: 0 };

// ── Shared style tokens ───────────────────────────────────────────────────────
const inp =
  "w-full px-3 py-2 border border-stone-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-400 transition-all bg-white";
const lbl = "block text-xs font-semibold text-stone-600 mb-1";

export default function PaymentMethodsCmsPage() {
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<PaymentMethod | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function load() {
    const res = await fetch("/api/admin/cms/payment-methods");
    const data = await res.json() as PaymentMethod[];
    setMethods(data);
    setLoading(false);
  }

  useEffect(() => { void load(); }, []);

  function openAdd() {
    const nextOrder = methods.length;
    setForm({ ...EMPTY_FORM, sortOrder: nextOrder });
    setEditing(null);
    setAdding(true);
  }

  function openEdit(m: PaymentMethod) {
    setForm({ name: m.name, image: m.image, enabled: m.enabled, sortOrder: m.sortOrder });
    setEditing(m);
    setAdding(false);
  }

  function cancel() {
    setEditing(null);
    setAdding(false);
    setUploadError("");
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError("");
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload?dir=payments", { method: "POST", body: fd });
      const data = await res.json() as { urls?: string[]; error?: string };
      if (!res.ok || !data.urls?.[0]) throw new Error(data.error ?? "Upload failed");
      setForm((f) => ({ ...f, image: data.urls![0] }));
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleSave() {
    if (!form.name.trim() || !form.image.trim()) return;
    setSaving(true);
    try {
      const payload = { ...form, name: form.name.trim(), image: form.image.trim() };
      if (editing) {
        await fetch(`/api/admin/cms/payment-methods/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        await fetch("/api/admin/cms/payment-methods", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
      cancel();
      await load();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    await fetch(`/api/admin/cms/payment-methods/${id}`, { method: "DELETE" });
    setDeleteId(null);
    await load();
  }

  async function toggleEnabled(m: PaymentMethod) {
    await fetch(`/api/admin/cms/payment-methods/${m.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enabled: !m.enabled }),
    });
    await load();
  }

  async function move(m: PaymentMethod, dir: -1 | 1) {
    const sorted = [...methods].sort((a, b) => a.sortOrder - b.sortOrder);
    const idx = sorted.findIndex((x) => x.id === m.id);
    const swapIdx = idx + dir;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;

    const target = sorted[swapIdx];
    await Promise.all([
      fetch(`/api/admin/cms/payment-methods/${m.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sortOrder: target.sortOrder }),
      }),
      fetch(`/api/admin/cms/payment-methods/${target.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sortOrder: m.sortOrder }),
      }),
    ]);
    await load();
  }

  const sorted = [...methods].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div className="p-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-black text-stone-800">Payment Methods</h1>
          <p className="text-sm text-stone-500 mt-0.5">
            Manage which payment icons appear in the footer. Disabled methods are hidden on the storefront.
          </p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white text-sm font-bold rounded-xl transition-colors cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add Method
        </button>
      </div>

      {/* Add / Edit form */}
      {(adding || editing) && (
        <div className="bg-white border border-stone-200 rounded-2xl p-5 mb-6">
          <h2 className="text-sm font-bold text-stone-700 mb-4">
            {editing ? "Edit Payment Method" : "New Payment Method"}
          </h2>

          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className={lbl}>Method Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className={inp}
                placeholder="e.g. Visa, Mastercard, Apple Pay"
              />
            </div>

            {/* Image */}
            <div>
              <label className={lbl}>Icon Image *</label>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleImageUpload}
              />

              <div className="flex items-center gap-3 mb-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-amber-700 hover:bg-amber-800 disabled:opacity-60 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer flex-none"
                >
                  {uploading ? (
                    <>
                      <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      Uploading…
                    </>
                  ) : (
                    <>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                      Upload from PC
                    </>
                  )}
                </button>
                <span className="text-xs text-stone-400">PNG, WebP recommended · Max 5 MB</span>
              </div>

              {uploadError && <p className="text-xs text-red-500 mb-2">{uploadError}</p>}

              <div>
                <label className="text-[11px] text-stone-400 mb-1 block">Or paste an image URL</label>
                <input
                  type="text"
                  value={form.image}
                  onChange={(e) => setForm({ ...form, image: e.target.value })}
                  className={inp}
                  placeholder="https://… or /uploads/payments/file.png"
                />
              </div>

              {form.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={form.image}
                  alt=""
                  className="mt-2 h-12 object-contain rounded border border-stone-100 bg-stone-50 px-2"
                />
              )}
            </div>

            {/* Sort order */}
            <div className="w-32">
              <label className={lbl}>Sort Order</label>
              <input
                type="number"
                min={0}
                value={form.sortOrder}
                onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
                className={inp}
              />
            </div>

            {/* Enabled */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.enabled}
                onChange={(e) => setForm({ ...form, enabled: e.target.checked })}
                className="w-4 h-4 rounded accent-amber-700"
              />
              <span className="text-sm font-medium text-stone-700">Enabled (visible in footer)</span>
            </label>
          </div>

          <div className="flex gap-3 mt-5">
            <button
              onClick={handleSave}
              disabled={saving || !form.name.trim() || !form.image.trim()}
              className="px-6 py-2 bg-amber-700 hover:bg-amber-800 text-white font-bold rounded-xl text-sm transition-colors cursor-pointer disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save"}
            </button>
            <button
              onClick={cancel}
              className="px-6 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl text-sm transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Methods list */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-stone-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <div className="text-center py-16 text-stone-400">
          <div className="w-12 h-12 bg-stone-100 rounded-xl flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-stone-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
            </svg>
          </div>
          <p className="text-sm font-medium">No payment methods yet.</p>
          <p className="text-xs mt-1">Click &quot;Add Method&quot; to get started. Until then, the footer shows default badges.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {sorted.map((m, idx) => (
            <div
              key={m.id}
              className="bg-white border border-stone-200 rounded-2xl p-4 flex items-center gap-4"
            >
              {/* Up / Down */}
              <div className="flex flex-col gap-0.5 flex-none">
                <button
                  onClick={() => move(m, -1)}
                  disabled={idx === 0}
                  className="p-1 rounded text-stone-400 hover:text-stone-700 hover:bg-stone-100 disabled:opacity-30 transition-colors cursor-pointer"
                  aria-label="Move up"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                  </svg>
                </button>
                <button
                  onClick={() => move(m, 1)}
                  disabled={idx === sorted.length - 1}
                  className="p-1 rounded text-stone-400 hover:text-stone-700 hover:bg-stone-100 disabled:opacity-30 transition-colors cursor-pointer"
                  aria-label="Move down"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </button>
              </div>

              {/* Icon preview */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={m.image}
                alt={m.name}
                className="w-14 h-9 object-contain rounded border border-stone-100 bg-stone-50 p-1 flex-none"
              />

              {/* Name + order */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-stone-800 truncate">{m.name}</p>
                <p className="text-xs text-stone-400 mt-0.5 truncate">{m.image}</p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-none">
                <button
                  onClick={() => toggleEnabled(m)}
                  className={`text-xs font-bold px-3 py-1 rounded-full transition-colors cursor-pointer ${
                    m.enabled ? "bg-green-100 text-green-700" : "bg-stone-100 text-stone-500"
                  }`}
                >
                  {m.enabled ? "Enabled" : "Disabled"}
                </button>
                <button
                  onClick={() => openEdit(m)}
                  className="text-xs font-bold px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg transition-colors cursor-pointer"
                >
                  Edit
                </button>
                {deleteId === m.id ? (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleDelete(m.id)}
                      className="text-xs font-bold px-3 py-1.5 bg-red-600 text-white rounded-lg cursor-pointer"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => setDeleteId(null)}
                      className="text-xs px-2 py-1.5 text-stone-500 cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setDeleteId(m.id)}
                    className="text-xs font-bold px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors cursor-pointer"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
