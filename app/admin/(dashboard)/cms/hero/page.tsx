"use client";
import { useState, useEffect } from "react";

interface HeroSlide {
  id: string;
  order: number;
  image: string;
  titleEn: string | null;
  titleAr: string | null;
  subtitleEn: string | null;
  subtitleAr: string | null;
  ctaLabelEn: string | null;
  ctaLabelAr: string | null;
  ctaUrl: string | null;
  active: boolean;
}

const EMPTY_SLIDE = {
  image: "", titleEn: "", titleAr: "", subtitleEn: "", subtitleAr: "",
  ctaLabelEn: "", ctaLabelAr: "", ctaUrl: "", active: true,
};

export default function HeroCmsPage() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<HeroSlide | null>(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState(EMPTY_SLIDE);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  async function loadSlides() {
    const res = await fetch("/api/admin/cms/hero");
    const data = await res.json() as HeroSlide[];
    setSlides(data);
    setLoading(false);
  }

  useEffect(() => { void loadSlides(); }, []);

  function openAdd() {
    setForm(EMPTY_SLIDE);
    setEditing(null);
    setAdding(true);
  }

  function openEdit(s: HeroSlide) {
    setForm({
      image: s.image,
      titleEn: s.titleEn ?? "",
      titleAr: s.titleAr ?? "",
      subtitleEn: s.subtitleEn ?? "",
      subtitleAr: s.subtitleAr ?? "",
      ctaLabelEn: s.ctaLabelEn ?? "",
      ctaLabelAr: s.ctaLabelAr ?? "",
      ctaUrl: s.ctaUrl ?? "",
      active: s.active,
    });
    setEditing(s);
    setAdding(false);
  }

  async function handleSave() {
    if (!form.image.trim()) return;
    setSaving(true);
    try {
      const payload = {
        ...form,
        titleEn: form.titleEn || null,
        titleAr: form.titleAr || null,
        subtitleEn: form.subtitleEn || null,
        subtitleAr: form.subtitleAr || null,
        ctaLabelEn: form.ctaLabelEn || null,
        ctaLabelAr: form.ctaLabelAr || null,
        ctaUrl: form.ctaUrl || null,
      };
      if (editing) {
        await fetch(`/api/admin/cms/hero/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        await fetch("/api/admin/cms/hero", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
      setEditing(null);
      setAdding(false);
      await loadSlides();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    await fetch(`/api/admin/cms/hero/${id}`, { method: "DELETE" });
    setDeleteId(null);
    await loadSlides();
  }

  async function toggleActive(s: HeroSlide) {
    await fetch(`/api/admin/cms/hero/${s.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !s.active }),
    });
    await loadSlides();
  }

  const inp = "w-full px-3 py-2 border border-stone-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-400 transition-all bg-white";
  const lbl = "block text-xs font-semibold text-stone-600 mb-1";

  return (
    <div className="p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-black text-stone-800">Hero Slides</h1>
          <p className="text-sm text-stone-500 mt-0.5">Manage homepage hero slider images and text.</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white text-sm font-bold rounded-xl transition-colors cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add Slide
        </button>
      </div>

      {/* Form panel */}
      {(adding || editing) && (
        <div className="bg-white border border-stone-200 rounded-2xl p-5 mb-6">
          <h2 className="text-sm font-bold text-stone-700 mb-4">
            {editing ? "Edit Slide" : "New Slide"}
          </h2>
          <div className="space-y-4">
            <div>
              <label className={lbl}>Image URL *</label>
              <input
                type="text"
                value={form.image}
                onChange={(e) => setForm({ ...form, image: e.target.value })}
                className={inp}
                placeholder="https://... or /assets/slider/slide-1.webp"
              />
              {form.image && (
                <img src={form.image} alt="" className="mt-2 h-24 w-full object-cover rounded-lg border border-stone-100" />
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Title (English)</label>
                <input type="text" value={form.titleEn} onChange={(e) => setForm({ ...form, titleEn: e.target.value })} className={inp} />
              </div>
              <div>
                <label className={lbl}>Title (Arabic)</label>
                <input type="text" dir="rtl" value={form.titleAr} onChange={(e) => setForm({ ...form, titleAr: e.target.value })} className={inp} />
              </div>
              <div>
                <label className={lbl}>Subtitle (English)</label>
                <input type="text" value={form.subtitleEn} onChange={(e) => setForm({ ...form, subtitleEn: e.target.value })} className={inp} />
              </div>
              <div>
                <label className={lbl}>Subtitle (Arabic)</label>
                <input type="text" dir="rtl" value={form.subtitleAr} onChange={(e) => setForm({ ...form, subtitleAr: e.target.value })} className={inp} />
              </div>
              <div>
                <label className={lbl}>CTA Label (English)</label>
                <input type="text" value={form.ctaLabelEn} onChange={(e) => setForm({ ...form, ctaLabelEn: e.target.value })} className={inp} />
              </div>
              <div>
                <label className={lbl}>CTA Label (Arabic)</label>
                <input type="text" dir="rtl" value={form.ctaLabelAr} onChange={(e) => setForm({ ...form, ctaLabelAr: e.target.value })} className={inp} />
              </div>
              <div className="sm:col-span-2">
                <label className={lbl}>CTA URL</label>
                <input type="text" value={form.ctaUrl} onChange={(e) => setForm({ ...form, ctaUrl: e.target.value })} className={inp} placeholder="/shop" />
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) => setForm({ ...form, active: e.target.checked })}
                className="w-4 h-4 rounded accent-amber-700"
              />
              <span className="text-sm font-medium text-stone-700">Active (visible on site)</span>
            </label>
          </div>
          <div className="flex gap-3 mt-5">
            <button
              onClick={handleSave}
              disabled={saving || !form.image.trim()}
              className="px-6 py-2 bg-amber-700 hover:bg-amber-800 text-white font-bold rounded-xl text-sm transition-colors cursor-pointer disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save Slide"}
            </button>
            <button
              onClick={() => { setEditing(null); setAdding(false); }}
              className="px-6 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl text-sm transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Slides list */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-24 bg-stone-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : slides.length === 0 ? (
        <div className="text-center py-16 text-stone-400">
          <p className="text-sm">No slides yet. Click &quot;Add Slide&quot; to create the first one.</p>
          <p className="text-xs mt-1">Until you add slides, the site uses static images from <code>/assets/slider/</code>.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {slides.map((s) => (
            <div key={s.id} className="bg-white border border-stone-200 rounded-2xl p-4 flex items-center gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={s.image} alt="" className="w-20 h-12 object-cover rounded-lg border border-stone-100 flex-none" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-stone-800 truncate">{s.titleEn || s.image}</p>
                {s.titleAr && <p className="text-xs text-stone-500 truncate" dir="rtl">{s.titleAr}</p>}
                <p className="text-xs text-stone-400 mt-0.5">Order: {s.order}</p>
              </div>
              <div className="flex items-center gap-2 flex-none">
                <button
                  onClick={() => toggleActive(s)}
                  className={`text-xs font-bold px-3 py-1 rounded-full transition-colors cursor-pointer ${
                    s.active ? "bg-green-100 text-green-700" : "bg-stone-100 text-stone-500"
                  }`}
                >
                  {s.active ? "Active" : "Hidden"}
                </button>
                <button
                  onClick={() => openEdit(s)}
                  className="text-xs font-bold px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg transition-colors cursor-pointer"
                >
                  Edit
                </button>
                {deleteId === s.id ? (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleDelete(s.id)}
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
                    onClick={() => setDeleteId(s.id)}
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
