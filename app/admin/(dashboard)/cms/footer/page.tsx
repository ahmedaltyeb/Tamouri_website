"use client";
import { useState, useEffect } from "react";
import type { FooterLinkData } from "@/lib/site-settings";

interface FooterSection {
  id: string;
  order: number;
  titleEn: string;
  titleAr: string;
  links: string;
  active: boolean;
}

const EMPTY_SECTION = { titleEn: "", titleAr: "", links: "[]", active: true };
const EMPTY_LINK: FooterLinkData = { labelEn: "", labelAr: "", url: "" };

export default function FooterCmsPage() {
  const [sections, setSections] = useState<FooterSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<FooterSection | null>(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState(EMPTY_SECTION);
  const [formLinks, setFormLinks] = useState<FooterLinkData[]>([]);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  async function loadSections() {
    const res = await fetch("/api/admin/cms/footer");
    const data = await res.json() as FooterSection[];
    setSections(data);
    setLoading(false);
  }

  useEffect(() => { void loadSections(); }, []);

  function parseLinks(raw: string): FooterLinkData[] {
    try { return JSON.parse(raw) as FooterLinkData[]; } catch { return []; }
  }

  function openAdd() {
    setForm(EMPTY_SECTION);
    setFormLinks([]);
    setEditing(null);
    setAdding(true);
  }

  function openEdit(s: FooterSection) {
    setForm({ titleEn: s.titleEn, titleAr: s.titleAr, links: s.links, active: s.active });
    setFormLinks(parseLinks(s.links));
    setEditing(s);
    setAdding(false);
  }

  function updateLink(i: number, field: keyof FooterLinkData, value: string) {
    const updated = formLinks.map((l, idx) => idx === i ? { ...l, [field]: value } : l);
    setFormLinks(updated);
  }

  function addLink() {
    setFormLinks([...formLinks, { ...EMPTY_LINK }]);
  }

  function removeLink(i: number) {
    setFormLinks(formLinks.filter((_, idx) => idx !== i));
  }

  async function handleSave() {
    if (!form.titleEn.trim()) return;
    setSaving(true);
    try {
      const payload = {
        titleEn: form.titleEn.trim(),
        titleAr: form.titleAr.trim() || form.titleEn.trim(),
        links: formLinks.filter((l) => l.labelEn || l.url),
        active: form.active,
      };
      if (editing) {
        await fetch(`/api/admin/cms/footer/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        await fetch("/api/admin/cms/footer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
      setEditing(null);
      setAdding(false);
      await loadSections();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    await fetch(`/api/admin/cms/footer/${id}`, { method: "DELETE" });
    setDeleteId(null);
    await loadSections();
  }

  async function toggleActive(s: FooterSection) {
    await fetch(`/api/admin/cms/footer/${s.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !s.active }),
    });
    await loadSections();
  }

  const inp = "w-full px-3 py-2 border border-stone-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-400 transition-all bg-white";
  const lbl = "block text-xs font-semibold text-stone-600 mb-1";

  return (
    <div className="p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-black text-stone-800">Footer Sections</h1>
          <p className="text-sm text-stone-500 mt-0.5">Manage footer link groups displayed in the storefront footer.</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white text-sm font-bold rounded-xl transition-colors cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add Section
        </button>
      </div>

      {/* Edit/Add panel */}
      {(adding || editing) && (
        <div className="bg-white border border-stone-200 rounded-2xl p-5 mb-6">
          <h2 className="text-sm font-bold text-stone-700 mb-4">
            {editing ? "Edit Section" : "New Section"}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
            <div>
              <label className={lbl}>Title (English) *</label>
              <input type="text" value={form.titleEn} onChange={(e) => setForm({ ...form, titleEn: e.target.value })} className={inp} />
            </div>
            <div>
              <label className={lbl}>Title (Arabic)</label>
              <input type="text" dir="rtl" value={form.titleAr} onChange={(e) => setForm({ ...form, titleAr: e.target.value })} className={inp} />
            </div>
          </div>

          {/* Links */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold text-stone-600">Links</p>
              <button
                onClick={addLink}
                className="text-xs font-bold text-amber-700 hover:text-amber-800 cursor-pointer"
              >
                + Add Link
              </button>
            </div>
            <div className="space-y-2">
              {formLinks.map((link, i) => (
                <div key={i} className="grid grid-cols-3 gap-2 items-center">
                  <input
                    type="text"
                    placeholder="Label (EN)"
                    value={link.labelEn}
                    onChange={(e) => updateLink(i, "labelEn", e.target.value)}
                    className={inp}
                  />
                  <input
                    type="text"
                    placeholder="Label (AR)"
                    value={link.labelAr}
                    dir="rtl"
                    onChange={(e) => updateLink(i, "labelAr", e.target.value)}
                    className={inp}
                  />
                  <div className="flex gap-1">
                    <input
                      type="text"
                      placeholder="URL"
                      value={link.url}
                      onChange={(e) => updateLink(i, "url", e.target.value)}
                      className={inp}
                    />
                    <button
                      onClick={() => removeLink(i)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer flex-none"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
              {formLinks.length === 0 && (
                <p className="text-xs text-stone-400 py-2">No links yet. Click &quot;+ Add Link&quot; to add one.</p>
              )}
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer mb-5">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => setForm({ ...form, active: e.target.checked })}
              className="w-4 h-4 rounded accent-amber-700"
            />
            <span className="text-sm font-medium text-stone-700">Active (visible on site)</span>
          </label>

          <div className="flex gap-3">
            <button
              onClick={handleSave}
              disabled={saving || !form.titleEn.trim()}
              className="px-6 py-2 bg-amber-700 hover:bg-amber-800 text-white font-bold rounded-xl text-sm transition-colors cursor-pointer disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save Section"}
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

      {/* Sections list */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => <div key={i} className="h-16 bg-stone-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : sections.length === 0 ? (
        <div className="text-center py-16 text-stone-400">
          <p className="text-sm">No footer sections yet. Click &quot;Add Section&quot; to create the first one.</p>
          <p className="text-xs mt-1">Until you add sections, the footer shows built-in static links.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sections.map((s) => {
            const links = parseLinks(s.links);
            return (
              <div key={s.id} className="bg-white border border-stone-200 rounded-2xl p-4 flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-bold text-stone-800">{s.titleEn}</p>
                    {s.titleAr && <p className="text-xs text-stone-500" dir="rtl">{s.titleAr}</p>}
                  </div>
                  <p className="text-xs text-stone-400">{links.length} link{links.length !== 1 ? "s" : ""}</p>
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
                      <button onClick={() => setDeleteId(null)} className="text-xs px-2 py-1.5 text-stone-500 cursor-pointer">
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
            );
          })}
        </div>
      )}
    </div>
  );
}
