"use client";
import { useEffect, useState } from "react";
import { ICON_LABELS, ICON_PATHS, type IconKey } from "@/lib/cms/icons";

interface FeatureCard {
  id: string;
  icon: string;
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  color: string;
  active: boolean;
  sortOrder: number;
}

const COLOR_OPTIONS = [
  { label: "Blue",   value: "bg-blue-50 text-blue-600 border-blue-100"   },
  { label: "Green",  value: "bg-green-50 text-green-600 border-green-100" },
  { label: "Amber",  value: "bg-amber-50 text-amber-600 border-amber-100" },
  { label: "Rose",   value: "bg-rose-50 text-rose-600 border-rose-100"    },
  { label: "Teal",   value: "bg-teal-50 text-teal-600 border-teal-100"    },
  { label: "Violet", value: "bg-violet-50 text-violet-600 border-violet-100" },
];

const EMPTY = {
  icon: "box" as IconKey,
  titleEn: "", titleAr: "",
  descriptionEn: "", descriptionAr: "",
  color: "bg-blue-50 text-blue-600 border-blue-100",
  active: true, sortOrder: 0,
};
type FormState = typeof EMPTY;

const inp = "w-full px-3 py-2 border border-stone-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-amber-300";
const lbl = "block text-xs font-semibold text-stone-600 mb-1";

const ICON_KEYS = Object.keys(ICON_LABELS) as IconKey[];

function IconPreview({ iconKey, className }: { iconKey: string; className?: string }) {
  const path = ICON_PATHS[iconKey as IconKey];
  if (!path) return <span className="text-stone-300">?</span>;
  return (
    <svg className={className ?? "w-5 h-5"} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
  );
}

export default function FeaturesPage() {
  const [items, setItems]     = useState<FeatureCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<FeatureCard | null>(null);
  const [form, setForm]       = useState<FormState>({ ...EMPTY });
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving]   = useState(false);
  const [msg, setMsg]         = useState("");

  async function load() {
    setLoading(true);
    const r = await fetch("/api/admin/cms/features");
    setItems(await r.json());
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function openNew() { setEditing(null); setForm({ ...EMPTY }); setMsg(""); setShowForm(true); }

  function openEdit(c: FeatureCard) {
    setEditing(c);
    setForm({ icon: c.icon as IconKey, titleEn: c.titleEn, titleAr: c.titleAr,
              descriptionEn: c.descriptionEn, descriptionAr: c.descriptionAr,
              color: c.color, active: c.active, sortOrder: c.sortOrder });
    setMsg(""); setShowForm(true);
  }

  const set = (k: keyof FormState, v: string | number | boolean) =>
    setForm((f) => ({ ...f, [k]: v }));

  async function save() {
    setSaving(true); setMsg("");
    const url = editing ? `/api/admin/cms/features/${editing.id}` : "/api/admin/cms/features";
    const r = await fetch(url, {
      method: editing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (!r.ok) { setMsg("❌ Save failed"); return; }
    setMsg("✅ Saved!");
    setEditing(null); setShowForm(false); setForm({ ...EMPTY }); load();
  }

  async function remove(id: string) {
    if (!confirm("Delete this card?")) return;
    await fetch(`/api/admin/cms/features/${id}`, { method: "DELETE" });
    load();
  }

  async function toggleActive(c: FeatureCard) {
    await fetch(`/api/admin/cms/features/${c.id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !c.active }),
    });
    load();
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-stone-800">Feature Cards</h1>
          <p className="text-sm text-stone-500 mt-0.5">Why choose us section on the homepage</p>
        </div>
        <button onClick={openNew}
          className="px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-sm font-semibold transition-colors">
          + Add Card
        </button>
      </div>

      {showForm && (
        <div className="bg-white border border-stone-200 rounded-2xl p-5 space-y-4">
          <h2 className="font-bold text-stone-800">{editing ? "Edit Card" : "New Card"}</h2>
          {msg && <p className="text-sm font-medium">{msg}</p>}

          <div>
            <label className={lbl}>Icon</label>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {ICON_KEYS.map((k) => (
                <button key={k} type="button" onClick={() => set("icon", k)}
                  className={`flex flex-col items-center gap-1 p-2 rounded-xl border-2 text-xs transition-all ${form.icon === k ? "border-amber-500 bg-amber-50" : "border-stone-100 hover:border-stone-300"}`}>
                  <IconPreview iconKey={k} className="w-5 h-5 text-stone-600" />
                  <span className="text-stone-500 truncate w-full text-center">{ICON_LABELS[k].en}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={lbl}>Title (English)</label>
              <input className={inp} value={form.titleEn} onChange={(e) => set("titleEn", e.target.value)} />
            </div>
            <div>
              <label className={lbl}>العنوان (عربي)</label>
              <input className={inp} dir="rtl" value={form.titleAr} onChange={(e) => set("titleAr", e.target.value)} />
            </div>
            <div>
              <label className={lbl}>Description (English)</label>
              <textarea className={inp} rows={2} value={form.descriptionEn}
                onChange={(e) => set("descriptionEn", e.target.value)} />
            </div>
            <div>
              <label className={lbl}>الوصف (عربي)</label>
              <textarea className={inp} rows={2} dir="rtl" value={form.descriptionAr}
                onChange={(e) => set("descriptionAr", e.target.value)} />
            </div>
          </div>

          <div>
            <label className={lbl}>Icon Color</label>
            <div className="flex flex-wrap gap-2">
              {COLOR_OPTIONS.map((c) => (
                <button key={c.value} type="button" onClick={() => set("color", c.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border-2 transition-all ${c.value} ${form.color === c.value ? "border-stone-800 scale-105" : "border-transparent"}`}>
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="rounded" checked={form.active}
                onChange={(e) => set("active", e.target.checked)} />
              <span className="text-sm font-medium text-stone-700">Active</span>
            </label>
            <div>
              <label className={lbl}>Sort Order</label>
              <input type="number" className="w-24 px-3 py-2 border border-stone-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-amber-300"
                value={form.sortOrder} onChange={(e) => set("sortOrder", parseInt(e.target.value) || 0)} />
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={save} disabled={saving}
              className="px-6 py-2.5 bg-amber-700 hover:bg-amber-800 disabled:opacity-50 text-white font-bold rounded-xl text-sm transition-colors">
              {saving ? "Saving…" : "Save"}
            </button>
            <button onClick={() => { setShowForm(false); setEditing(null); setForm({ ...EMPTY }); setMsg(""); }}
              className="px-6 py-2.5 border border-stone-200 hover:bg-stone-50 text-stone-700 font-semibold rounded-xl text-sm transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Live preview card */}
      {showForm && (form.titleEn || form.titleAr) && (
        <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4">
          <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-3">Preview</p>
          <div className="group bg-white rounded-2xl border border-stone-100 p-6 shadow-sm max-w-xs">
            <div className={`inline-flex w-14 h-14 rounded-2xl border items-center justify-center mb-4 ${form.color}`}>
              <IconPreview iconKey={form.icon} className="w-7 h-7" />
            </div>
            <h3 className="font-bold text-lg text-stone-800 mb-2">{form.titleEn || "(title)"}</h3>
            <p className="text-stone-500 text-sm leading-relaxed">{form.descriptionEn || "(description)"}</p>
          </div>
        </div>
      )}

      <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-stone-400 text-sm">Loading…</div>
        ) : items.length === 0 ? (
          <div className="p-8 text-center text-stone-400 text-sm">
            No cards yet. The homepage will show the default 3 cards.<br/>Click <strong>+ Add Card</strong> to override them.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-stone-100 bg-stone-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide">Card</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide hidden md:table-cell">Description</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-stone-500 uppercase tracking-wide">Order</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-stone-500 uppercase tracking-wide">Active</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-stone-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {items.map((c) => (
                <tr key={c.id} className="hover:bg-stone-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl border flex items-center justify-center flex-none ${c.color}`}>
                        <IconPreview iconKey={c.icon} className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-semibold text-stone-800">{c.titleEn}</div>
                        <div className="text-stone-400 text-xs" dir="rtl">{c.titleAr}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-stone-500 text-xs hidden md:table-cell max-w-xs truncate">
                    {c.descriptionEn}
                  </td>
                  <td className="px-4 py-3 text-center text-stone-600">{c.sortOrder}</td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => toggleActive(c)}
                      className={`w-8 h-4 rounded-full transition-colors ${c.active ? "bg-green-400" : "bg-stone-200"}`} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEdit(c)}
                        className="px-3 py-1 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors">
                        Edit
                      </button>
                      <button onClick={() => remove(c.id)}
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
