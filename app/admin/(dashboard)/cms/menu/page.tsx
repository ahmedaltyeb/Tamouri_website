"use client";
import { useState, useEffect } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────

interface MenuItem {
  id: string;
  titleEn: string;
  titleAr: string;
  type: string;
  url: string | null;
  targetId: string | null;
  icon: string | null;
  image: string | null;
  badge: string | null;
  sortOrder: number;
  active: boolean;
  openInNewTab: boolean;
}

interface Category { id: string; slug: string; nameEn: string | null; name: string }
interface Page     { id: string; slug: string; titleEn: string }

const EMPTY: Omit<MenuItem, "id" | "sortOrder"> = {
  titleEn: "", titleAr: "", type: "url", url: "", targetId: null,
  icon: "", image: "", badge: "", active: true, openInNewTab: false,
};

const TYPES = [
  { value: "url",      label: "Internal URL" },
  { value: "category", label: "Category" },
  { value: "page",     label: "CMS Page" },
  { value: "external", label: "External URL" },
];

const ICONS = [
  { value: "",        label: "Default arrow" },
  { value: "home",    label: "Home" },
  { value: "shop",    label: "Shop / Store" },
  { value: "gift",    label: "Gift" },
  { value: "deals",   label: "Deals / Tag" },
  { value: "contact", label: "Contact / Mail" },
  { value: "about",   label: "About / Info" },
  { value: "external",label: "External link" },
];

const inp  = "w-full px-3 py-2 border border-stone-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-amber-300";
const lbl  = "block text-xs font-semibold text-stone-600 mb-1";
const half = "grid grid-cols-1 md:grid-cols-2 gap-3";

// ── Component ─────────────────────────────────────────────────────────────────

export default function MenuCmsPage() {
  const [items,      setItems]      = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [pages,      setPages]      = useState<Page[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [showForm,   setShowForm]   = useState(false);
  const [editing,    setEditing]    = useState<MenuItem | null>(null);
  const [form,       setForm]       = useState(EMPTY);
  const [saving,     setSaving]     = useState(false);
  const [msg,        setMsg]        = useState("");
  const [reordering, setReordering] = useState(false);

  // ── Data loading ──────────────────────────────────────────────────────────

  async function load() {
    const [menuRes, catRes, pageRes] = await Promise.all([
      fetch("/api/admin/menu"),
      fetch("/api/admin/categories"),
      fetch("/api/admin/cms/pages"),
    ]);
    const menuData = await menuRes.json() as MenuItem[];
    const catData  = await catRes.json()  as Category[];
    const pageData = await pageRes.json() as Page[];

    setItems(menuData);
    setCategories(Array.isArray(catData) ? catData : []);
    setPages(Array.isArray(pageData) ? pageData : []);
    setLoading(false);
  }

  useEffect(() => { void load(); }, []);

  // ── Form helpers ──────────────────────────────────────────────────────────

  function set<K extends keyof typeof EMPTY>(k: K, v: (typeof EMPTY)[K]) {
    setForm(f => ({ ...f, [k]: v }));
  }

  function flash(m: string) {
    setMsg(m);
    setTimeout(() => setMsg(""), 3000);
  }

  function openAdd() {
    setEditing(null);
    setForm(EMPTY);
    setShowForm(true);
  }

  function openEdit(item: MenuItem) {
    setEditing(item);
    setForm({
      titleEn:     item.titleEn,
      titleAr:     item.titleAr,
      type:        item.type,
      url:         item.url ?? "",
      targetId:    item.targetId,
      icon:        item.icon ?? "",
      image:       item.image ?? "",
      badge:       item.badge ?? "",
      active:      item.active,
      openInNewTab: item.openInNewTab,
    });
    setShowForm(true);
  }

  function closeForm() { setShowForm(false); setEditing(null); }

  // ── Save (create / update) ────────────────────────────────────────────────

  async function handleSave() {
    if (!form.titleEn.trim() || !form.titleAr.trim()) {
      flash("❌ Both English and Arabic titles are required.");
      return;
    }
    setSaving(true);
    const payload = {
      ...form,
      url:      form.type === "url" || form.type === "external" ? form.url  : null,
      targetId: form.type === "category" || form.type === "page" ? form.targetId : null,
    };
    const url    = editing ? `/api/admin/menu/${editing.id}` : "/api/admin/menu";
    const method = editing ? "PUT" : "POST";
    const res    = await fetch(url, {
      method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
    });
    setSaving(false);
    if (res.ok) {
      flash(editing ? "✅ Updated!" : "✅ Created!");
      closeForm();
      void load();
    } else {
      const err = await res.json() as { error?: string };
      flash(`❌ ${err.error ?? "Failed"}`);
    }
  }

  // ── Delete ────────────────────────────────────────────────────────────────

  async function handleDelete(id: string, titleEn: string) {
    if (!confirm(`Delete "${titleEn}"?`)) return;
    await fetch(`/api/admin/menu/${id}`, { method: "DELETE" });
    void load();
  }

  // ── Toggle active ─────────────────────────────────────────────────────────

  async function toggleActive(item: MenuItem) {
    await fetch(`/api/admin/menu/${item.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !item.active }),
    });
    void load();
  }

  // ── Reorder (move up / down) ──────────────────────────────────────────────

  async function move(index: number, dir: -1 | 1) {
    const next = [...items];
    const swap = index + dir;
    if (swap < 0 || swap >= next.length) return;
    [next[index], next[swap]] = [next[swap], next[index]];
    setItems(next);
    setReordering(true);
    await fetch("/api/admin/menu/reorder", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: next.map(i => i.id) }),
    });
    setReordering(false);
  }

  // ── Image upload ──────────────────────────────────────────────────────────

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("file", file);
    const res  = await fetch("/api/admin/upload?dir=pages", { method: "POST", body: fd });
    const data = await res.json() as { urls?: string[]; error?: string };
    if (res.ok && data.urls?.[0]) set("image", data.urls[0]);
    else flash("❌ Image upload failed");
    e.target.value = "";
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-5">

      {/* Page title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-stone-800">Menu CMS</h1>
          <p className="text-sm text-stone-500 mt-0.5">
            Manage the slide-out navigation menu. Active items appear on the storefront.
          </p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white font-bold rounded-xl text-sm transition-colors cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/>
          </svg>
          Add Item
        </button>
      </div>

      {/* Flash message */}
      {msg && (
        <div className="bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm text-stone-700">
          {msg}
        </div>
      )}

      {/* Add / Edit form */}
      {showForm && (
        <div className="bg-white border border-stone-200 rounded-2xl p-5 space-y-4">
          <h2 className="font-bold text-stone-800 text-sm">
            {editing ? `Editing: ${editing.titleEn}` : "New Menu Item"}
          </h2>

          {/* Titles */}
          <div className={half}>
            <div>
              <label className={lbl}>Title (English) *</label>
              <input className={inp} value={form.titleEn} onChange={e => set("titleEn", e.target.value)} placeholder="e.g. Gift Boxes" />
            </div>
            <div>
              <label className={lbl}>العنوان (عربي) *</label>
              <input className={inp} dir="rtl" value={form.titleAr} onChange={e => set("titleAr", e.target.value)} placeholder="مثال: صناديق الهدايا" />
            </div>
          </div>

          {/* Type + Badge */}
          <div className={half}>
            <div>
              <label className={lbl}>Link Type</label>
              <select
                className={inp}
                value={form.type}
                onChange={e => { set("type", e.target.value); set("targetId", null); set("url", ""); }}
              >
                {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className={lbl}>Badge (optional)</label>
              <input className={inp} value={form.badge ?? ""} onChange={e => set("badge", e.target.value)} placeholder="New / Hot / Sale" />
            </div>
          </div>

          {/* Dynamic URL / target field */}
          {(form.type === "url" || form.type === "external") && (
            <div>
              <label className={lbl}>{form.type === "external" ? "External URL" : "Internal URL"}</label>
              <input className={inp} value={form.url ?? ""} onChange={e => set("url", e.target.value)}
                placeholder={form.type === "external" ? "https://example.com" : "/shop"} />
            </div>
          )}

          {form.type === "category" && (
            <div>
              <label className={lbl}>Category</label>
              <select className={inp} value={form.targetId ?? ""} onChange={e => set("targetId", e.target.value)}>
                <option value="">— select category —</option>
                {categories.map(c => (
                  <option key={c.id} value={c.slug}>{c.nameEn ?? c.name}</option>
                ))}
              </select>
            </div>
          )}

          {form.type === "page" && (
            <div>
              <label className={lbl}>CMS Page</label>
              <select className={inp} value={form.targetId ?? ""} onChange={e => set("targetId", e.target.value)}>
                <option value="">— select page —</option>
                {pages.map(p => (
                  <option key={p.id} value={p.slug}>{p.titleEn} ({p.slug})</option>
                ))}
              </select>
            </div>
          )}

          {/* Icon + Open in new tab */}
          <div className={half}>
            <div>
              <label className={lbl}>Icon</label>
              <select className={inp} value={form.icon ?? ""} onChange={e => set("icon", e.target.value)}>
                {ICONS.map(i => <option key={i.value} value={i.value}>{i.label}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-3 pt-5">
              <label className="flex items-center gap-2 text-sm text-stone-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={form.openInNewTab}
                  onChange={e => set("openInNewTab", e.target.checked)}
                  className="accent-amber-700 w-4 h-4"
                />
                Open in new tab
              </label>
              <label className="flex items-center gap-2 text-sm text-stone-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={e => set("active", e.target.checked)}
                  className="accent-amber-700 w-4 h-4"
                />
                Active
              </label>
            </div>
          </div>

          {/* Thumbnail image */}
          <div>
            <label className={lbl}>Thumbnail Image (optional)</label>
            <div className="flex items-center gap-3">
              {form.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={form.image} alt="" className="w-12 h-12 rounded-lg object-cover border border-stone-200 flex-none" />
              )}
              <div className="flex flex-col gap-1.5">
                <label className="inline-flex items-center gap-2 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-sm font-medium rounded-lg cursor-pointer transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                  </svg>
                  Upload image
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="sr-only" />
                </label>
                {form.image && (
                  <button onClick={() => set("image", "")} className="text-xs text-stone-400 hover:text-red-500 text-left cursor-pointer">
                    Remove image
                  </button>
                )}
              </div>
              <div className="flex-1">
                <input className={inp} value={form.image ?? ""} onChange={e => set("image", e.target.value)} placeholder="or paste image URL" />
              </div>
            </div>
          </div>

          {/* Form actions */}
          <div className="flex items-center justify-end gap-3 pt-1">
            <button onClick={closeForm} className="px-4 py-2 text-sm text-stone-500 hover:text-stone-800 transition-colors cursor-pointer">
              Cancel
            </button>
            <button
              onClick={() => void handleSave()}
              disabled={saving}
              className="px-5 py-2 bg-amber-700 hover:bg-amber-800 disabled:opacity-50 text-white font-bold rounded-xl text-sm transition-colors cursor-pointer"
            >
              {saving ? "Saving…" : editing ? "Update" : "Create"}
            </button>
          </div>
        </div>
      )}

      {/* Items list */}
      {loading ? (
        <div className="bg-white border border-stone-200 rounded-2xl p-8 text-center text-stone-400 text-sm">
          Loading…
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white border border-stone-200 rounded-2xl p-10 text-center">
          <p className="text-stone-400 text-sm">No menu items yet. Click "Add Item" to get started.</p>
        </div>
      ) : (
        <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden">
          {reordering && (
            <div className="bg-amber-50 border-b border-amber-100 px-5 py-2 text-xs text-amber-700 font-medium">
              Saving order…
            </div>
          )}
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-100 bg-stone-50">
                <th className="px-4 py-3 text-start text-xs font-bold text-stone-400 uppercase tracking-wide w-16">Order</th>
                <th className="px-4 py-3 text-start text-xs font-bold text-stone-400 uppercase tracking-wide">Title</th>
                <th className="px-4 py-3 text-start text-xs font-bold text-stone-400 uppercase tracking-wide hidden sm:table-cell">Type</th>
                <th className="px-4 py-3 text-start text-xs font-bold text-stone-400 uppercase tracking-wide hidden md:table-cell">Badge</th>
                <th className="px-4 py-3 text-start text-xs font-bold text-stone-400 uppercase tracking-wide">Status</th>
                <th className="px-4 py-3 text-end text-xs font-bold text-stone-400 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => (
                <tr key={item.id} className="border-b border-stone-50 hover:bg-stone-50 transition-colors">
                  {/* Order controls */}
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-0.5">
                      <button
                        onClick={() => void move(i, -1)}
                        disabled={i === 0}
                        aria-label="Move up"
                        className="p-1 rounded text-stone-300 hover:text-stone-600 disabled:opacity-20 transition-colors cursor-pointer"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7"/>
                        </svg>
                      </button>
                      <button
                        onClick={() => void move(i, 1)}
                        disabled={i === items.length - 1}
                        aria-label="Move down"
                        className="p-1 rounded text-stone-300 hover:text-stone-600 disabled:opacity-20 transition-colors cursor-pointer"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
                        </svg>
                      </button>
                    </div>
                  </td>

                  {/* Title */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      {item.image && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.image} alt="" className="w-7 h-7 rounded-md object-cover border border-stone-100 flex-none" />
                      )}
                      <div className="min-w-0">
                        <p className="font-semibold text-stone-800 truncate">{item.titleEn}</p>
                        <p className="text-xs text-stone-400 truncate" dir="rtl">{item.titleAr}</p>
                      </div>
                    </div>
                  </td>

                  {/* Type */}
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className="inline-block text-xs bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full font-medium capitalize">
                      {item.type}
                    </span>
                    {item.openInNewTab && (
                      <span className="ms-1 text-[10px] text-stone-400">↗</span>
                    )}
                  </td>

                  {/* Badge */}
                  <td className="px-4 py-3 hidden md:table-cell">
                    {item.badge ? (
                      <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                        {item.badge}
                      </span>
                    ) : (
                      <span className="text-stone-300 text-xs">—</span>
                    )}
                  </td>

                  {/* Status toggle */}
                  <td className="px-4 py-3">
                    <button
                      onClick={() => void toggleActive(item)}
                      className={`text-xs font-bold px-2.5 py-1 rounded-full transition-colors cursor-pointer ${
                        item.active
                          ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                          : "bg-stone-100 text-stone-500 hover:bg-stone-200"
                      }`}
                    >
                      {item.active ? "Active" : "Inactive"}
                    </button>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEdit(item)}
                        className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
                        aria-label={`Edit ${item.titleEn}`}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                        </svg>
                      </button>
                      <button
                        onClick={() => void handleDelete(item.id, item.titleEn)}
                        className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                        aria-label={`Delete ${item.titleEn}`}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Live preview note */}
      {items.length > 0 && (
        <p className="text-xs text-stone-400 text-center">
          Changes are reflected on the storefront immediately. Open the hamburger menu on the website to preview.
        </p>
      )}
    </div>
  );
}
