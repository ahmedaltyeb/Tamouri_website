"use client";
import { useEffect, useState } from "react";

interface Testimonial {
  id: string;
  nameEn: string;
  nameAr: string;
  locationEn: string | null;
  locationAr: string | null;
  reviewEn: string;
  reviewAr: string;
  productEn: string | null;
  productAr: string | null;
  avatar: string | null;
  color: string;
  rating: number;
  active: boolean;
  featured: boolean;
  sortOrder: number;
}

const COLOR_OPTIONS = [
  { label: "Amber", value: "bg-amber-100 text-amber-700" },
  { label: "Rose",  value: "bg-rose-100 text-rose-700"   },
  { label: "Blue",  value: "bg-blue-100 text-blue-700"   },
  { label: "Green", value: "bg-green-100 text-green-700" },
  { label: "Teal",  value: "bg-teal-100 text-teal-700"   },
  { label: "Violet",value: "bg-violet-100 text-violet-700"},
];

const EMPTY: Omit<Testimonial, "id" | "createdAt" | "updatedAt"> = {
  nameEn: "", nameAr: "", locationEn: "", locationAr: "",
  reviewEn: "", reviewAr: "", productEn: "", productAr: "",
  avatar: "", color: "bg-amber-100 text-amber-700", rating: 5,
  active: true, featured: false, sortOrder: 0,
};

type FormState = typeof EMPTY;

const inp = "w-full px-3 py-2 border border-stone-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-amber-300";
const lbl = "block text-xs font-semibold text-stone-600 mb-1";

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <button key={s} type="button" onClick={() => onChange(s)}
          className={`text-xl ${s <= value ? "text-amber-400" : "text-stone-200"} hover:text-amber-400 transition-colors`}>
          ★
        </button>
      ))}
    </div>
  );
}

export default function TestimonialsPage() {
  const [items, setItems]   = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [form, setForm]     = useState<FormState>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg]       = useState("");

  async function load() {
    setLoading(true);
    const r = await fetch("/api/admin/cms/testimonials");
    setItems(await r.json());
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function openNew() {
    setEditing(null);
    setForm({ ...EMPTY });
    setMsg("");
  }

  function openEdit(t: Testimonial) {
    setEditing(t);
    setForm({
      nameEn: t.nameEn, nameAr: t.nameAr,
      locationEn: t.locationEn ?? "", locationAr: t.locationAr ?? "",
      reviewEn: t.reviewEn, reviewAr: t.reviewAr,
      productEn: t.productEn ?? "", productAr: t.productAr ?? "",
      avatar: t.avatar ?? "", color: t.color, rating: t.rating,
      active: t.active, featured: t.featured, sortOrder: t.sortOrder,
    });
    setMsg("");
  }

  const set = (k: keyof FormState, v: string | number | boolean) =>
    setForm((f) => ({ ...f, [k]: v }));

  async function save() {
    setSaving(true);
    setMsg("");
    const payload = {
      ...form,
      locationEn: form.locationEn || null,
      locationAr: form.locationAr || null,
      productEn:  form.productEn  || null,
      productAr:  form.productAr  || null,
      avatar:     form.avatar     || null,
    };
    const url = editing ? `/api/admin/cms/testimonials/${editing.id}` : "/api/admin/cms/testimonials";
    const method = editing ? "PUT" : "POST";
    const r = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    setSaving(false);
    if (!r.ok) { setMsg("❌ Save failed"); return; }
    setMsg("✅ Saved!");
    setEditing(null);
    setForm({ ...EMPTY });
    load();
  }

  async function remove(id: string) {
    if (!confirm("Delete this testimonial?")) return;
    await fetch(`/api/admin/cms/testimonials/${id}`, { method: "DELETE" });
    load();
  }

  async function toggle(t: Testimonial, field: "active" | "featured") {
    await fetch(`/api/admin/cms/testimonials/${t.id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: !t[field] }),
    });
    load();
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-stone-800">Testimonials</h1>
          <p className="text-sm text-stone-500 mt-0.5">Customer reviews shown on the homepage</p>
        </div>
        <button onClick={openNew}
          className="px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-sm font-semibold transition-colors">
          + Add Testimonial
        </button>
      </div>

      {/* Form */}
      {(editing !== null || form.nameEn !== "" || form.nameAr !== "") && (
        <div className="bg-white border border-stone-200 rounded-2xl p-5 space-y-4">
          <h2 className="font-bold text-stone-800">{editing ? "Edit Testimonial" : "New Testimonial"}</h2>
          {msg && <p className="text-sm font-medium text-stone-700">{msg}</p>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={lbl}>Name (English)</label>
              <input className={inp} value={form.nameEn} onChange={(e) => set("nameEn", e.target.value)} />
            </div>
            <div>
              <label className={lbl}>الاسم (عربي)</label>
              <input className={inp} dir="rtl" value={form.nameAr} onChange={(e) => set("nameAr", e.target.value)} />
            </div>
            <div>
              <label className={lbl}>Location (English)</label>
              <input className={inp} value={form.locationEn ?? ""} onChange={(e) => set("locationEn", e.target.value)} placeholder="e.g. Dubai" />
            </div>
            <div>
              <label className={lbl}>الموقع (عربي)</label>
              <input className={inp} dir="rtl" value={form.locationAr ?? ""} onChange={(e) => set("locationAr", e.target.value)} placeholder="دبي" />
            </div>
            <div>
              <label className={lbl}>Product (English)</label>
              <input className={inp} value={form.productEn ?? ""} onChange={(e) => set("productEn", e.target.value)} placeholder="e.g. Premium Medjool Dates" />
            </div>
            <div>
              <label className={lbl}>المنتج (عربي)</label>
              <input className={inp} dir="rtl" value={form.productAr ?? ""} onChange={(e) => set("productAr", e.target.value)} placeholder="تمر مجدول فاخر" />
            </div>
            <div>
              <label className={lbl}>Avatar (initials or image URL)</label>
              <input className={inp} value={form.avatar ?? ""} onChange={(e) => set("avatar", e.target.value)} placeholder="ف or https://..." />
            </div>
            <div>
              <label className={lbl}>Sort Order</label>
              <input type="number" className={inp} value={form.sortOrder}
                onChange={(e) => set("sortOrder", parseInt(e.target.value) || 0)} />
            </div>
          </div>

          <div>
            <label className={lbl}>Review (English)</label>
            <textarea className={inp} rows={3} value={form.reviewEn}
              onChange={(e) => set("reviewEn", e.target.value)} />
          </div>
          <div>
            <label className={lbl}>التقييم (عربي)</label>
            <textarea className={inp} rows={3} dir="rtl" value={form.reviewAr}
              onChange={(e) => set("reviewAr", e.target.value)} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={lbl}>Rating</label>
              <StarRating value={form.rating} onChange={(v) => set("rating", v)} />
            </div>
            <div>
              <label className={lbl}>Badge Color</label>
              <div className="flex flex-wrap gap-2">
                {COLOR_OPTIONS.map((c) => (
                  <button key={c.value} type="button"
                    onClick={() => set("color", c.value)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold border-2 transition-all ${c.value} ${form.color === c.value ? "border-stone-800 scale-105" : "border-transparent"}`}>
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="rounded" checked={form.active}
                onChange={(e) => set("active", e.target.checked)} />
              <span className="text-sm font-medium text-stone-700">Active</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="rounded" checked={form.featured}
                onChange={(e) => set("featured", e.target.checked)} />
              <span className="text-sm font-medium text-stone-700">Featured (show first)</span>
            </label>
          </div>

          <div className="flex gap-3">
            <button onClick={save} disabled={saving}
              className="px-6 py-2.5 bg-amber-700 hover:bg-amber-800 disabled:opacity-50 text-white font-bold rounded-xl text-sm transition-colors">
              {saving ? "Saving…" : "Save"}
            </button>
            <button onClick={() => { setEditing(null); setForm({ ...EMPTY }); setMsg(""); }}
              className="px-6 py-2.5 border border-stone-200 hover:bg-stone-50 text-stone-700 font-semibold rounded-xl text-sm transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* List */}
      <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-stone-400 text-sm">Loading…</div>
        ) : items.length === 0 ? (
          <div className="p-8 text-center text-stone-400 text-sm">
            No testimonials yet. Click <strong>+ Add Testimonial</strong> to create one.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-stone-100 bg-stone-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide">Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide hidden md:table-cell">Location</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-stone-500 uppercase tracking-wide">Rating</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-stone-500 uppercase tracking-wide">Active</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-stone-500 uppercase tracking-wide">Featured</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-stone-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {items.map((t) => (
                <tr key={t.id} className="hover:bg-stone-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-none ${t.color}`}>
                        {t.avatar?.length === 1 ? t.avatar : t.nameAr.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-stone-800">{t.nameEn}</div>
                        <div className="text-stone-400 text-xs" dir="rtl">{t.nameAr}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-stone-600 hidden md:table-cell">{t.locationEn ?? "—"}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-amber-400">{"★".repeat(t.rating)}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => toggle(t, "active")}
                      className={`w-8 h-4 rounded-full transition-colors ${t.active ? "bg-green-400" : "bg-stone-200"}`} />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => toggle(t, "featured")}
                      className={`text-lg transition-colors ${t.featured ? "text-amber-400" : "text-stone-200 hover:text-amber-300"}`}>★</button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEdit(t)}
                        className="px-3 py-1 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors">
                        Edit
                      </button>
                      <button onClick={() => remove(t.id)}
                        className="px-3 py-1 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
