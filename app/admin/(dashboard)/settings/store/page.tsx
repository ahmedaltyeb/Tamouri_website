"use client";
import { useState, useEffect, useRef } from "react";
import { THEME_PRESETS, DEFAULT_THEME } from "@/lib/theme";

// ── Types ─────────────────────────────────────────────────────────────────────

interface FormState {
  nameEn: string;
  nameAr: string;
  taglineEn: string;
  taglineAr: string;
  logo: string;
  phone: string;
  whatsapp: string;
  email: string;
  addressEn: string;
  addressAr: string;
  workingHours: string;
  instagramUrl: string;
  twitterUrl: string;
  whatsappUrl: string;
  seoTitleEn: string;
  seoTitleAr: string;
  seoDescEn: string;
  seoDescAr: string;
  // Theme
  themePrimary: string;
  themeSecondary: string;
  themeAccent: string;
  themeSuccess: string;
  themeBackground: string;
  themeText: string;
}

const EMPTY: FormState = {
  nameEn: "", nameAr: "", taglineEn: "", taglineAr: "",
  logo: "", phone: "", whatsapp: "", email: "",
  addressEn: "", addressAr: "", workingHours: "",
  instagramUrl: "", twitterUrl: "", whatsappUrl: "",
  seoTitleEn: "", seoTitleAr: "", seoDescEn: "", seoDescAr: "",
  themePrimary:    DEFAULT_THEME.primary,
  themeSecondary:  DEFAULT_THEME.secondary,
  themeAccent:     DEFAULT_THEME.accent,
  themeSuccess:    DEFAULT_THEME.success,
  themeBackground: DEFAULT_THEME.background,
  themeText:       DEFAULT_THEME.text,
};

// ── Shared input styles ────────────────────────────────────────────────────────

const inp = "w-full px-3 py-2 border border-stone-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-400 transition-all bg-white";
const lbl = "block text-xs font-semibold text-stone-600 mb-1";

// ── Reusable field — defined OUTSIDE to prevent remount on parent re-render ───

function Field({
  id, label, value, dir, onChange,
}: {
  id: string;
  label: string;
  value: string;
  dir?: "ltr";
  onChange: (val: string) => void;
}) {
  return (
    <div>
      <label className={lbl}>{label}</label>
      <input
        type="text"
        value={value}
        dir={dir}
        onChange={(e) => onChange(e.target.value)}
        className={inp}
        placeholder={label}
      />
    </div>
  );
}

// ── Color picker field ─────────────────────────────────────────────────────────

function ColorField({
  label, value, onChange,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
}) {
  return (
    <div>
      <label className={lbl}>{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-10 h-9 rounded-lg border border-stone-200 cursor-pointer p-0.5 bg-white flex-none"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => {
            const v = e.target.value;
            if (/^#[0-9A-Fa-f]{0,6}$/.test(v)) onChange(v);
          }}
          className={inp}
          placeholder="#000000"
          maxLength={7}
          dir="ltr"
        />
        <span
          className="flex-none w-8 h-8 rounded-lg border border-stone-200 shadow-sm"
          style={{ backgroundColor: value }}
        />
      </div>
    </div>
  );
}

// ── Live theme preview ─────────────────────────────────────────────────────────

function ThemePreview({ form }: { form: FormState }) {
  return (
    <div
      className="rounded-2xl border border-stone-200 overflow-hidden shadow-sm"
      style={{ backgroundColor: form.themeBackground, color: form.themeText }}
    >
      {/* Header bar */}
      <div
        className="px-4 py-3 flex items-center justify-between border-b border-stone-100"
        style={{ backgroundColor: form.themeBackground }}
      >
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg" style={{ backgroundColor: form.themePrimary }} />
          <span className="font-black text-sm" style={{ color: form.themeSecondary }}>Store Name</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-3 py-1 rounded-lg text-xs font-bold text-white" style={{ backgroundColor: form.themeSecondary }}>
            Shop
          </div>
          <div className="px-3 py-1 rounded-lg text-xs font-bold text-white" style={{ backgroundColor: form.themePrimary }}>
            Cart
          </div>
        </div>
      </div>

      {/* Hero strip */}
      <div className="px-4 py-4" style={{ background: `linear-gradient(135deg, ${form.themeSecondary}dd, ${form.themePrimary}cc)` }}>
        <div className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold mb-2" style={{ backgroundColor: `${form.themePrimary}40`, color: form.themePrimary, border: `1px solid ${form.themePrimary}60` }}>
          Premium Collection
        </div>
        <div className="text-white font-black text-sm mb-1">Quality Products</div>
        <div className="text-white/70 text-[11px] mb-3">Delivered across UAE in 24 hours</div>
        <div className="flex gap-2">
          <div className="px-3 py-1.5 rounded-lg text-xs font-bold text-white" style={{ backgroundColor: form.themePrimary }}>
            Shop Now →
          </div>
          <div className="px-3 py-1.5 rounded-lg text-xs font-semibold" style={{ backgroundColor: "rgba(255,255,255,0.15)", color: "white", border: "1px solid rgba(255,255,255,0.3)" }}>
            Gift Boxes
          </div>
        </div>
      </div>

      {/* Product cards */}
      <div className="px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs font-bold" style={{ color: form.themeText }}>Featured Products</div>
          <div className="text-[10px] font-semibold" style={{ color: form.themePrimary }}>View All</div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl overflow-hidden border" style={{ backgroundColor: form.themeBackground, borderColor: "#e7e5e4" }}>
              <div className="h-12" style={{ background: `linear-gradient(135deg, ${form.themeSecondary}20, ${form.themePrimary}20)` }} />
              <div className="p-1.5">
                <div className="text-[9px] font-bold mb-0.5 truncate" style={{ color: form.themeText }}>Product Name</div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black" style={{ color: form.themeSecondary }}>45 AED</span>
                  <div className="w-5 h-5 rounded-md flex items-center justify-center text-white text-[10px]" style={{ backgroundColor: form.themeSecondary }}>+</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer strip */}
      <div className="px-4 py-2.5 text-[10px] text-white/70 flex items-center justify-between" style={{ backgroundColor: form.themeText }}>
        <span style={{ color: "rgba(255,255,255,0.7)" }}>© 2025 Store Name</span>
        <div className="flex gap-1">
          {["★", "★", "★"].map((s, i) => (
            <span key={i} style={{ color: form.themePrimary }}>{s}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function StoreSettingsPage() {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoError, setLogoError] = useState("");
  const logoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/admin/settings/site")
      .then((r) => r.json())
      .then((data: Record<string, unknown>) => {
        let theme = DEFAULT_THEME;
        if (data.themeJson && typeof data.themeJson === "string") {
          try { theme = { ...DEFAULT_THEME, ...(JSON.parse(data.themeJson) as typeof DEFAULT_THEME) }; }
          catch { /* keep default */ }
        }
        setForm({
          nameEn: String(data.nameEn ?? ""),
          nameAr: String(data.nameAr ?? ""),
          taglineEn: String(data.taglineEn ?? ""),
          taglineAr: String(data.taglineAr ?? ""),
          logo: String(data.logo ?? ""),
          phone: String(data.phone ?? ""),
          whatsapp: String(data.whatsapp ?? ""),
          email: String(data.email ?? ""),
          addressEn: String(data.addressEn ?? ""),
          addressAr: String(data.addressAr ?? ""),
          workingHours: String(data.workingHours ?? ""),
          instagramUrl: String(data.instagramUrl ?? ""),
          twitterUrl: String(data.twitterUrl ?? ""),
          whatsappUrl: String(data.whatsappUrl ?? ""),
          seoTitleEn: String(data.seoTitleEn ?? ""),
          seoTitleAr: String(data.seoTitleAr ?? ""),
          seoDescEn: String(data.seoDescEn ?? ""),
          seoDescAr: String(data.seoDescAr ?? ""),
          themePrimary:    theme.primary,
          themeSecondary:  theme.secondary,
          themeAccent:     theme.accent,
          themeSuccess:    theme.success,
          themeBackground: theme.background,
          themeText:       theme.text,
        });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoError("");
    setLogoUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json() as { urls?: string[]; error?: string };
      if (!res.ok || !data.urls?.[0]) throw new Error(data.error ?? "Upload failed");
      setForm((f) => ({ ...f, logo: data.urls![0] }));
    } catch (err) {
      setLogoError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setLogoUploading(false);
      if (logoInputRef.current) logoInputRef.current.value = "";
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const themeJson = JSON.stringify({
        primary:    form.themePrimary,
        secondary:  form.themeSecondary,
        accent:     form.themeAccent,
        success:    form.themeSuccess,
        background: form.themeBackground,
        text:       form.themeText,
      });
      const res = await fetch("/api/admin/settings/site", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nameEn: form.nameEn, nameAr: form.nameAr,
          taglineEn: form.taglineEn, taglineAr: form.taglineAr,
          logo: form.logo || null,
          phone: form.phone, whatsapp: form.whatsapp, email: form.email,
          addressEn: form.addressEn, addressAr: form.addressAr,
          workingHours: form.workingHours,
          instagramUrl: form.instagramUrl || null,
          twitterUrl:   form.twitterUrl || null,
          whatsappUrl:  form.whatsappUrl || null,
          seoTitleEn: form.seoTitleEn, seoTitleAr: form.seoTitleAr,
          seoDescEn: form.seoDescEn, seoDescAr: form.seoDescAr,
          themeJson,
        }),
      });
      if (!res.ok) throw new Error("Save failed");
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError("Failed to save settings. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  function setField(key: keyof FormState) {
    return (val: string) => setForm((f) => ({ ...f, [key]: val }));
  }

  function applyPreset(presetKey: string) {
    const preset = THEME_PRESETS[presetKey];
    if (!preset) return;
    setForm((f) => ({
      ...f,
      themePrimary:    preset.colors.primary,
      themeSecondary:  preset.colors.secondary,
      themeAccent:     preset.colors.accent,
      themeSuccess:    preset.colors.success,
      themeBackground: preset.colors.background,
      themeText:       preset.colors.text,
    }));
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="h-6 w-40 bg-stone-100 rounded animate-pulse mb-4" />
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-10 bg-stone-100 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-xl font-black text-stone-800">Store Settings</h1>
        <p className="text-sm text-stone-500 mt-1">Manage your store identity, contact info, SEO metadata, and brand theme.</p>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}
      {saved && (
        <div className="mb-4 bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-700 font-medium">
          Settings saved successfully.
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8">

        {/* Brand */}
        <section className="bg-white border border-stone-200 rounded-2xl p-5">
          <h2 className="text-sm font-bold text-stone-700 mb-4">Brand Identity</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field id="nameEn" label="Store Name (English)" value={form.nameEn} onChange={setField("nameEn")} />
            <Field id="nameAr" label="Store Name (Arabic)" value={form.nameAr} dir="ltr" onChange={setField("nameAr")} />
            <Field id="taglineEn" label="Tagline (English)" value={form.taglineEn} onChange={setField("taglineEn")} />
            <Field id="taglineAr" label="Tagline (Arabic)" value={form.taglineAr} dir="ltr" onChange={setField("taglineAr")} />
            <div className="sm:col-span-2">
              <label className={lbl}>Logo</label>
              <div className="flex items-start gap-4 mt-1">
                <div className="flex-none w-20 h-20 rounded-2xl border-2 border-dashed border-stone-200 bg-stone-50 flex items-center justify-center overflow-hidden">
                  {form.logo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={form.logo} alt="Logo" className="w-full h-full object-contain p-1" />
                  ) : (
                    <svg className="w-8 h-8 text-stone-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  )}
                </div>
                <div className="flex-1 min-w-0 space-y-2">
                  <input ref={logoInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleLogoUpload} />
                  <button
                    type="button"
                    onClick={() => logoInputRef.current?.click()}
                    disabled={logoUploading}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-amber-700 hover:bg-amber-800 disabled:opacity-60 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    {logoUploading ? (
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
                        Upload Image
                      </>
                    )}
                  </button>
                  <p className="text-[11px] text-stone-400">JPG, PNG or WebP · Max 5 MB</p>
                  <div>
                    <label className="text-[11px] text-stone-400 mb-1 block">Or paste an image URL</label>
                    <input type="text" value={form.logo} onChange={(e) => setForm({ ...form, logo: e.target.value })} className={inp} placeholder="https://… or /uploads/products/file.png" />
                  </div>
                  {logoError && <p className="text-xs text-red-500">{logoError}</p>}
                  {form.logo && (
                    <button type="button" onClick={() => setForm((f) => ({ ...f, logo: "" }))} className="text-xs text-red-400 hover:text-red-600 transition-colors cursor-pointer">
                      Remove logo
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact */}
        <section className="bg-white border border-stone-200 rounded-2xl p-5">
          <h2 className="text-sm font-bold text-stone-700 mb-4">Contact Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field id="phone" label="Phone" value={form.phone} dir="ltr" onChange={setField("phone")} />
            <Field id="whatsapp" label="WhatsApp" value={form.whatsapp} dir="ltr" onChange={setField("whatsapp")} />
            <Field id="email" label="Email" value={form.email} dir="ltr" onChange={setField("email")} />
            <Field id="workingHours" label="Working Hours" value={form.workingHours} onChange={setField("workingHours")} />
            <Field id="addressEn" label="Address (English)" value={form.addressEn} onChange={setField("addressEn")} />
            <Field id="addressAr" label="Address (Arabic)" value={form.addressAr} dir="ltr" onChange={setField("addressAr")} />
          </div>
        </section>

        {/* Social */}
        <section className="bg-white border border-stone-200 rounded-2xl p-5">
          <h2 className="text-sm font-bold text-stone-700 mb-4">Social Links</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field id="instagramUrl" label="Instagram URL" value={form.instagramUrl} dir="ltr" onChange={setField("instagramUrl")} />
            <Field id="twitterUrl" label="X (Twitter) URL" value={form.twitterUrl} dir="ltr" onChange={setField("twitterUrl")} />
            <Field id="whatsappUrl" label="WhatsApp URL" value={form.whatsappUrl} dir="ltr" onChange={setField("whatsappUrl")} />
          </div>
        </section>

        {/* SEO */}
        <section className="bg-white border border-stone-200 rounded-2xl p-5">
          <h2 className="text-sm font-bold text-stone-700 mb-4">SEO Metadata</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field id="seoTitleEn" label="SEO Title (English)" value={form.seoTitleEn} onChange={setField("seoTitleEn")} />
            <Field id="seoTitleAr" label="SEO Title (Arabic)" value={form.seoTitleAr} dir="ltr" onChange={setField("seoTitleAr")} />
            <div>
              <label className={lbl}>SEO Description (English)</label>
              <textarea value={form.seoDescEn} onChange={(e) => setForm({ ...form, seoDescEn: e.target.value })} rows={3} className={inp} placeholder="160 characters max" />
            </div>
            <div>
              <label className={lbl}>SEO Description (Arabic)</label>
              <textarea value={form.seoDescAr} onChange={(e) => setForm({ ...form, seoDescAr: e.target.value })} rows={3} dir="rtl" className={inp} />
            </div>
          </div>
        </section>

        {/* ── Theme ─────────────────────────────────────────────────────────── */}
        <section className="bg-white border border-stone-200 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-sm font-bold text-stone-700">Brand Theme</h2>
            <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-semibold">Live preview</span>
          </div>
          <p className="text-xs text-stone-400 mb-5">Changes reflect instantly in the preview. Save to apply sitewide.</p>

          {/* Preset buttons */}
          <div className="mb-6">
            <p className={lbl}>Preset Themes</p>
            <div className="flex flex-wrap gap-2 mt-1">
              {Object.entries(THEME_PRESETS).map(([key, preset]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => applyPreset(key)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-stone-200 hover:border-stone-300 bg-stone-50 hover:bg-stone-100 text-xs font-semibold text-stone-700 transition-all cursor-pointer"
                >
                  <span className="flex gap-0.5">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: preset.colors.primary }} />
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: preset.colors.secondary }} />
                  </span>
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Color pickers + live preview side by side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <ColorField label="Primary Color (badges, stars, highlights)" value={form.themePrimary} onChange={setField("themePrimary")} />
              <ColorField label="Secondary Color (buttons, links, prices)" value={form.themeSecondary} onChange={setField("themeSecondary")} />
              <ColorField label="Accent Color (hover states, light variants)" value={form.themeAccent} onChange={setField("themeAccent")} />
              <ColorField label="Success Color (confirmations, checkmarks)" value={form.themeSuccess} onChange={setField("themeSuccess")} />
              <ColorField label="Background Color (page background)" value={form.themeBackground} onChange={setField("themeBackground")} />
              <ColorField label="Text Color (body text, headings)" value={form.themeText} onChange={setField("themeText")} />
            </div>

            <div>
              <p className={`${lbl} mb-3`}>Live Preview</p>
              <ThemePreview form={form} />
              <p className="text-[10px] text-stone-400 mt-2 text-center">Preview updates as you change colors · Save to apply sitewide</p>
            </div>
          </div>
        </section>

        <button
          type="submit"
          disabled={saving}
          className="px-8 py-3 bg-amber-700 hover:bg-amber-800 text-white font-bold rounded-xl transition-colors cursor-pointer disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save Settings"}
        </button>
      </form>
    </div>
  );
}
