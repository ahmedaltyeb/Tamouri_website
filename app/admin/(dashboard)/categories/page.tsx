"use client";
import { useState, useEffect, useRef } from "react";

interface Category {
  id: string;
  name: string;
  slug: string;
  nameEn: string | null;
  nameAr: string | null;
  image: string | null;
  sortOrder: number;
  active: boolean;
  _count?: { products: number };
}

// ── Shared styles ─────────────────────────────────────────────────────────────
const inp = "w-full px-3 py-2 border border-stone-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-400 transition-all bg-white";
const lbl = "block text-xs font-semibold text-stone-600 mb-1";

// ── Category row ──────────────────────────────────────────────────────────────
function CategoryRow({
  cat,
  onSave,
  onToggle,
}: {
  cat: Category;
  onSave: (id: string, data: Partial<Category>) => Promise<void>;
  onToggle: (id: string, active: boolean) => Promise<void>;
}) {
  const [open, setOpen]       = useState(false);
  const [saving, setSaving]   = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadErr, setUploadErr] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    nameEn: cat.nameEn ?? "",
    nameAr: cat.nameAr ?? "",
    image:  cat.image  ?? "",
    sortOrder: cat.sortOrder,
  });

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadErr("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload?dir=products", { method: "POST", body: fd });
      const data = await res.json() as { urls?: string[]; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Upload failed");
      setForm(f => ({ ...f, image: data.urls?.[0] ?? "" }));
    } catch (err) {
      setUploadErr(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function handleSave() {
    setSaving(true);
    await onSave(cat.id, form);
    setSaving(false);
    setOpen(false);
  }

  return (
    <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden">
      {/* Header row */}
      <div className="flex items-center gap-4 p-4">
        {/* Category image */}
        <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-stone-100 flex-shrink-0 bg-stone-100">
          {cat.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={cat.image} alt={cat.nameEn ?? cat.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-stone-300">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-sm text-stone-800">{cat.nameEn ?? cat.name}</span>
            {cat.nameAr && (
              <span className="text-sm text-stone-400" dir="rtl">{cat.nameAr}</span>
            )}
            <span className="text-[10px] bg-stone-100 text-stone-500 px-2 py-0.5 rounded-full font-mono">{cat.slug}</span>
          </div>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-xs text-stone-400">{cat._count?.products ?? 0} products</span>
            {!cat.image && (
              <span className="text-[10px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full font-semibold">No image</span>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Active toggle */}
          <button
            type="button"
            onClick={() => onToggle(cat.id, !cat.active)}
            className={`relative w-10 h-6 rounded-full transition-colors cursor-pointer ${cat.active ? "bg-green-500" : "bg-stone-200"}`}
          >
            <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${cat.active ? "left-5" : "left-1"}`} />
          </button>

          {/* Edit button */}
          <button
            type="button"
            onClick={() => setOpen(o => !o)}
            className="px-3 py-1.5 text-xs font-semibold text-stone-600 border border-stone-200 rounded-lg hover:bg-stone-50 transition-colors cursor-pointer"
          >
            {open ? "Close" : "Edit"}
          </button>
        </div>
      </div>

      {/* Expanded editor */}
      {open && (
        <div className="border-t border-stone-100 px-4 pb-4 pt-4 bg-stone-50 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={lbl}>Name (English)</label>
              <input value={form.nameEn} onChange={e => setForm(f => ({ ...f, nameEn: e.target.value }))} className={inp} placeholder="e.g. Dates" />
            </div>
            <div>
              <label className={lbl}>Name (Arabic)</label>
              <input value={form.nameAr} onChange={e => setForm(f => ({ ...f, nameAr: e.target.value }))} className={inp} dir="rtl" placeholder="مثال: التمر" />
            </div>
          </div>

          {/* Image */}
          <div>
            <label className={lbl}>Category Image</label>
            <div className="flex gap-3 items-start">
              {/* Preview */}
              <div className="w-16 h-16 rounded-xl overflow-hidden border border-stone-200 bg-stone-100 flex-shrink-0">
                {form.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={form.image} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-stone-300">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="flex-1 space-y-2">
                <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleUpload} />
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-700 hover:bg-amber-800 disabled:opacity-60 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                >
                  {uploading ? "Uploading…" : "Upload Image"}
                </button>
                <div>
                  <input
                    type="text"
                    value={form.image}
                    onChange={e => setForm(f => ({ ...f, image: e.target.value }))}
                    className={inp}
                    placeholder="https://… or paste URL"
                  />
                </div>
                {uploadErr && <p className="text-xs text-red-500">{uploadErr}</p>}
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center pt-2">
            <div className="flex items-center gap-2">
              <label className={lbl + " mb-0"}>Sort Order</label>
              <input
                type="number"
                value={form.sortOrder}
                onChange={e => setForm(f => ({ ...f, sortOrder: Number(e.target.value) }))}
                className="w-20 px-3 py-1.5 border border-stone-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-amber-300"
              />
            </div>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2 bg-amber-700 hover:bg-amber-800 disabled:opacity-60 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading]       = useState(true);
  const [seeding, setSeeding]       = useState(false);
  const [seedMsg, setSeedMsg]       = useState("");

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/categories");
    const data = await res.json() as Category[];
    setCategories(data);
    setLoading(false);
  }

  useEffect(() => { void load(); }, []);

  async function handleSave(id: string, data: Partial<Category>) {
    await fetch(`/api/admin/categories/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    await load();
  }

  async function handleToggle(id: string, active: boolean) {
    await fetch(`/api/admin/categories/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active }),
    });
    setCategories(cs => cs.map(c => c.id === id ? { ...c, active } : c));
  }

  async function handleSeed() {
    setSeeding(true);
    setSeedMsg("");
    const res = await fetch("/api/admin/categories/seed", { method: "POST" });
    const data = await res.json() as { results?: string[] };
    setSeedMsg((data.results ?? []).join(" · "));
    await load();
    setSeeding(false);
  }

  const missing = categories.filter(c => !c.image).length;

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-stone-800">Categories</h1>
          <p className="text-xs text-stone-400 mt-0.5">
            Manage category images and names shown on the storefront
          </p>
        </div>
        {missing > 0 && (
          <button
            type="button"
            onClick={handleSeed}
            disabled={seeding}
            className="flex items-center gap-2 px-4 py-2 bg-amber-100 hover:bg-amber-200 text-amber-800 text-xs font-bold rounded-xl transition-colors cursor-pointer disabled:opacity-60"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {seeding ? "Seeding…" : `Fill ${missing} missing images`}
          </button>
        )}
      </div>

      {seedMsg && (
        <div className="text-xs text-green-700 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
          {seedMsg}
        </div>
      )}

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total", value: categories.length },
          { label: "Active", value: categories.filter(c => c.active).length },
          { label: "No Image", value: missing },
        ].map(s => (
          <div key={s.label} className="bg-white border border-stone-200 rounded-xl px-4 py-3 text-center">
            <p className="text-xl font-black text-stone-800">{s.value}</p>
            <p className="text-xs text-stone-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-24 bg-stone-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {categories.map(cat => (
            <CategoryRow
              key={cat.id}
              cat={cat}
              onSave={handleSave}
              onToggle={handleToggle}
            />
          ))}
          {categories.length === 0 && (
            <p className="text-center text-stone-400 py-12 text-sm">
              No categories found. Add products first to create categories.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
