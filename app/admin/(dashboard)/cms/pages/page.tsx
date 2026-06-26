"use client";
import { useEffect, useState } from "react";

interface Page {
  id: string;
  slug: string;
  titleEn: string;
  titleAr: string;
  contentEn: string;
  contentAr: string;
  seoTitleEn: string | null;
  seoTitleAr: string | null;
  seoDescEn: string | null;
  seoDescAr: string | null;
  published: boolean;
  updatedAt: string;
}

const EMPTY: Omit<Page, "id" | "updatedAt"> = {
  slug: "", titleEn: "", titleAr: "", contentEn: "", contentAr: "",
  seoTitleEn: "", seoTitleAr: "", seoDescEn: "", seoDescAr: "", published: true,
};

type FormState = typeof EMPTY;

const inp = "w-full px-3 py-2 border border-stone-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-amber-300";
const lbl = "block text-xs font-semibold text-stone-600 mb-1";

export default function PagesPage() {
  const [items, setItems]     = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Page | null>(null);
  const [form, setForm]       = useState<FormState>({ ...EMPTY });
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving]   = useState(false);
  const [msg, setMsg]         = useState("");
  const [tab, setTab]         = useState<"content" | "seo">("content");

  async function load(autoSeed = false) {
    setLoading(true);
    const r = await fetch("/api/admin/cms/pages");
    const data: Page[] = await r.json();
    if (autoSeed && data.length === 0) {
      // Seed starter pages on first visit
      await fetch("/api/admin/cms/pages/seed", { method: "POST" });
      const r2 = await fetch("/api/admin/cms/pages");
      setItems(await r2.json());
    } else {
      setItems(data);
    }
    setLoading(false);
  }

  async function seed() {
    setSaving(true);
    await fetch("/api/admin/cms/pages/seed", { method: "POST" });
    setSaving(false);
    load();
  }

  useEffect(() => { load(true); }, []);

  function openNew() { setEditing(null); setForm({ ...EMPTY }); setMsg(""); setShowForm(true); setTab("content"); }

  function openEdit(p: Page) {
    setEditing(p);
    setForm({
      slug: p.slug, titleEn: p.titleEn, titleAr: p.titleAr,
      contentEn: p.contentEn, contentAr: p.contentAr,
      seoTitleEn: p.seoTitleEn ?? "", seoTitleAr: p.seoTitleAr ?? "",
      seoDescEn:  p.seoDescEn  ?? "", seoDescAr:  p.seoDescAr  ?? "",
      published: p.published,
    });
    setMsg(""); setShowForm(true); setTab("content");
  }

  const set = (k: keyof FormState, v: string | boolean) =>
    setForm((f) => ({ ...f, [k]: v }));

  async function save() {
    setSaving(true); setMsg("");
    const payload = {
      ...form,
      seoTitleEn: form.seoTitleEn || null,
      seoTitleAr: form.seoTitleAr || null,
      seoDescEn:  form.seoDescEn  || null,
      seoDescAr:  form.seoDescAr  || null,
    };
    const url = editing ? `/api/admin/cms/pages/${editing.id}` : "/api/admin/cms/pages";
    const r = await fetch(url, {
      method: editing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setSaving(false);
    if (!r.ok) {
      const err = await r.json().catch(() => ({ error: "Save failed" }));
      setMsg("❌ " + (err.error ?? "Save failed"));
      return;
    }
    setMsg("✅ Saved!");
    setEditing(null); setShowForm(false); setForm({ ...EMPTY }); load();
  }

  async function remove(id: string) {
    if (!confirm("Delete this page? This cannot be undone.")) return;
    await fetch(`/api/admin/cms/pages/${id}`, { method: "DELETE" });
    load();
  }

  async function togglePublished(p: Page) {
    await fetch(`/api/admin/cms/pages/${p.id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: !p.published }),
    });
    load();
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-stone-800">Pages CMS</h1>
          <p className="text-sm text-stone-500 mt-0.5">Create and manage content pages accessible at <code className="bg-stone-100 px-1 rounded">/pages/[slug]</code></p>
        </div>
        <div className="flex gap-2">
          <button onClick={seed} disabled={saving}
            className="px-4 py-2 border border-stone-200 hover:bg-stone-50 text-stone-600 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50">
            {saving ? "Seeding…" : "Seed Starter Pages"}
          </button>
          <button onClick={openNew}
            className="px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-sm font-semibold transition-colors">
            + New Page
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white border border-stone-200 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-stone-800">{editing ? `Edit: ${editing.titleEn}` : "New Page"}</h2>
            <div className="flex gap-2">
              <button onClick={() => setTab("content")}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${tab === "content" ? "bg-amber-700 text-white" : "text-stone-600 hover:bg-stone-100"}`}>
                Content
              </button>
              <button onClick={() => setTab("seo")}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${tab === "seo" ? "bg-amber-700 text-white" : "text-stone-600 hover:bg-stone-100"}`}>
                SEO
              </button>
            </div>
          </div>

          {msg && <p className="text-sm font-medium">{msg}</p>}

          {tab === "content" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className={lbl}>Slug (URL path)</label>
                  <input className={inp} value={form.slug} placeholder="about-us"
                    onChange={(e) => set("slug", e.target.value.toLowerCase().replace(/\s+/g, "-"))} />
                  <p className="text-xs text-stone-400 mt-1">Available at: /pages/{form.slug || "slug"}</p>
                </div>
                <div>
                  <label className={lbl}>Title (English)</label>
                  <input className={inp} value={form.titleEn} onChange={(e) => set("titleEn", e.target.value)} />
                </div>
                <div>
                  <label className={lbl}>العنوان (عربي)</label>
                  <input className={inp} dir="rtl" value={form.titleAr} onChange={(e) => set("titleAr", e.target.value)} />
                </div>
              </div>

              <div>
                <label className={lbl}>Content (English) — supports HTML</label>
                <textarea className={inp} rows={8} value={form.contentEn}
                  onChange={(e) => set("contentEn", e.target.value)}
                  placeholder="<p>Write your page content here. HTML is supported.</p>" />
              </div>
              <div>
                <label className={lbl}>المحتوى (عربي) — يدعم HTML</label>
                <textarea className={inp} rows={8} dir="rtl" value={form.contentAr}
                  onChange={(e) => set("contentAr", e.target.value)}
                  placeholder="<p>اكتب محتوى الصفحة هنا. يدعم HTML.</p>" />
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded" checked={form.published}
                  onChange={(e) => set("published", e.target.checked)} />
                <span className="text-sm font-medium text-stone-700">Published (visible at /pages/slug)</span>
              </label>
            </div>
          )}

          {tab === "seo" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={lbl}>SEO Title (English)</label>
                  <input className={inp} value={form.seoTitleEn ?? ""} onChange={(e) => set("seoTitleEn", e.target.value)} />
                </div>
                <div>
                  <label className={lbl}>عنوان SEO (عربي)</label>
                  <input className={inp} dir="rtl" value={form.seoTitleAr ?? ""} onChange={(e) => set("seoTitleAr", e.target.value)} />
                </div>
                <div>
                  <label className={lbl}>Meta Description (English)</label>
                  <textarea className={inp} rows={3} value={form.seoDescEn ?? ""}
                    onChange={(e) => set("seoDescEn", e.target.value)} maxLength={160}/>
                  <p className="text-xs text-stone-400 mt-1">{(form.seoDescEn ?? "").length}/160 chars</p>
                </div>
                <div>
                  <label className={lbl}>وصف Meta (عربي)</label>
                  <textarea className={inp} rows={3} dir="rtl" value={form.seoDescAr ?? ""}
                    onChange={(e) => set("seoDescAr", e.target.value)} maxLength={160}/>
                  <p className="text-xs text-stone-400 mt-1">{(form.seoDescAr ?? "").length}/160 chars</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button onClick={save} disabled={saving}
              className="px-6 py-2.5 bg-amber-700 hover:bg-amber-800 disabled:opacity-50 text-white font-bold rounded-xl text-sm transition-colors">
              {saving ? "Saving…" : "Save Page"}
            </button>
            <button onClick={() => { setShowForm(false); setEditing(null); setForm({ ...EMPTY }); setMsg(""); }}
              className="px-6 py-2.5 border border-stone-200 hover:bg-stone-50 text-stone-700 font-semibold rounded-xl text-sm transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-stone-400 text-sm">Loading…</div>
        ) : items.length === 0 ? (
          <div className="p-8 text-center text-stone-400 text-sm">
            No pages yet. Click <strong>+ New Page</strong> to create one.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-stone-100 bg-stone-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide">Title</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide hidden md:table-cell">Slug</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-stone-500 uppercase tracking-wide">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide hidden md:table-cell">Updated</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-stone-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {items.map((p) => (
                <tr key={p.id} className="hover:bg-stone-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-stone-800">{p.titleEn}</div>
                    <div className="text-stone-400 text-xs" dir="rtl">{p.titleAr}</div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <code className="bg-stone-100 px-2 py-0.5 rounded text-stone-600 text-xs">/pages/{p.slug}</code>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => togglePublished(p)}
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${p.published ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-stone-100 text-stone-500 hover:bg-stone-200"}`}>
                      {p.published ? "Published" : "Draft"}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-stone-400 text-xs hidden md:table-cell">
                    {new Date(p.updatedAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <a href={`/pages/${p.slug}`} target="_blank" rel="noopener"
                        className="px-3 py-1 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                        View
                      </a>
                      <button onClick={() => openEdit(p)}
                        className="px-3 py-1 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors">
                        Edit
                      </button>
                      <button onClick={() => remove(p.id)}
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
