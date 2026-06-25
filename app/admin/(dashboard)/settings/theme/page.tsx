"use client";
import { useState, useEffect, useCallback } from "react";
import {
  THEME_PRESETS, FONT_OPTIONS, DEFAULT_THEME,
  type ThemeColors, type FontFamily,
} from "@/lib/theme";

// ── Shared styles ─────────────────────────────────────────────────────────────
const lbl = "block text-xs font-semibold text-stone-600 mb-1";

// ── Color picker field ─────────────────────────────────────────────────────────
function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className={lbl}>{label}</label>
      <div className="flex gap-2 items-center">
        <input
          type="color"
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-10 h-10 rounded-lg border border-stone-200 p-0.5 cursor-pointer bg-white"
        />
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          className="flex-1 px-3 py-2 border border-stone-200 rounded-lg text-sm font-mono outline-none focus:ring-2 focus:ring-amber-300 uppercase bg-white"
          maxLength={7}
          placeholder="#000000"
        />
        <div className="w-8 h-8 rounded-lg border border-stone-200 flex-shrink-0" style={{ backgroundColor: value }} />
      </div>
    </div>
  );
}

// ── Live preview ───────────────────────────────────────────────────────────────
function ThemePreview({ form }: { form: ThemeColors }) {
  const fontStack = FONT_OPTIONS[form.fontFamily]?.cssStack ?? "'Cairo', sans-serif";
  return (
    <div className="rounded-2xl overflow-hidden border border-stone-200 shadow-sm" style={{ fontFamily: fontStack, backgroundColor: form.background, color: form.text }}>
      {/* Nav */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-stone-100" style={{ backgroundColor: form.background }}>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg" style={{ backgroundColor: form.primary }} />
          <span className="font-black text-sm" style={{ color: form.secondary }}>Store Name</span>
        </div>
        <div className="flex gap-1.5">
          <div className="px-3 py-1 rounded-lg text-xs font-bold text-white" style={{ backgroundColor: form.secondary }}>Cart</div>
          <div className="px-3 py-1 rounded-lg text-xs font-bold text-white" style={{ backgroundColor: form.primary }}>Shop</div>
        </div>
      </div>
      {/* Hero */}
      <div className="px-4 py-5" style={{ background: `linear-gradient(135deg, ${form.secondary}dd, ${form.primary}cc)` }}>
        <div className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold mb-2" style={{ backgroundColor: `${form.primary}40`, color: form.primary, border: `1px solid ${form.primary}60` }}>
          Premium Store
        </div>
        <div className="text-white font-black text-base leading-tight mb-1">
          {FONT_OPTIONS[form.fontFamily]?.label ?? "Cairo"} Font
        </div>
        <div className="text-white/70 text-[11px] mb-3">Your brand theme preview</div>
        <div className="px-3 py-1.5 rounded-lg text-xs font-bold text-white inline-block" style={{ backgroundColor: form.primary }}>Shop Now</div>
      </div>
      {/* Products */}
      <div className="px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs font-bold" style={{ color: form.text }}>Featured Products</div>
          <div className="text-[10px] font-semibold" style={{ color: form.primary }}>View All</div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="rounded-xl overflow-hidden border" style={{ backgroundColor: form.background, borderColor: "#e7e5e4" }}>
              <div className="h-12" style={{ background: `linear-gradient(135deg, ${form.secondary}20, ${form.primary}20)` }} />
              <div className="p-1.5">
                <div className="text-[9px] font-bold mb-0.5 truncate" style={{ color: form.text }}>Product {i}</div>
                <div className="text-[10px] font-black" style={{ color: form.primary }}>120 AED</div>
                <div className="mt-1 h-4 rounded text-[8px] font-bold text-white flex items-center justify-center" style={{ backgroundColor: form.secondary }}>Add</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Stars */}
      <div className="px-4 pb-3 flex gap-0.5">
        {"★★★★★".split("").map((s, i) => (
          <span key={i} style={{ color: form.primary }}>{s}</span>
        ))}
        <span className="text-[10px] ms-1" style={{ color: form.text }}>5.0 · 48 reviews</span>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function ThemePage() {
  const [form, setForm] = useState<ThemeColors>(DEFAULT_THEME);
  const [saving, setSaving]   = useState(false);
  const [saved, setSaved]     = useState(false);
  const [loading, setLoading] = useState(true);

  const setField = useCallback(
    (key: keyof ThemeColors) => (value: string) =>
      setForm(f => ({ ...f, [key]: value })),
    [],
  );

  useEffect(() => {
    fetch("/api/admin/settings/site")
      .then(r => r.json())
      .then((data: { themeJson?: string | null }) => {
        if (data.themeJson) {
          try {
            const parsed = JSON.parse(data.themeJson) as Partial<ThemeColors>;
            setForm({ ...DEFAULT_THEME, ...parsed });
          } catch { /* keep defaults */ }
        }
      })
      .finally(() => setLoading(false));
  }, []);

  function applyPreset(key: string) {
    const preset = THEME_PRESETS[key];
    if (preset) setForm(preset.colors);
  }

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    await fetch("/api/admin/settings/site", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ themeJson: JSON.stringify(form) }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-4">
        {[200, 120, 300].map(h => (
          <div key={h} className={`h-${h} bg-stone-100 rounded-2xl animate-pulse`} style={{ height: h }} />
        ))}
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-stone-800">Brand Theme</h1>
          <p className="text-xs text-stone-400 mt-0.5">Colors and typography applied sitewide</p>
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-amber-700 hover:bg-amber-800 disabled:opacity-60 text-white font-bold text-sm rounded-xl transition-colors cursor-pointer"
        >
          {saving ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              Saving…
            </>
          ) : saved ? (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Saved!
            </>
          ) : "Save Theme"}
        </button>
      </div>

      {saved && (
        <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-xl px-4 py-3 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Theme saved — changes are live on the storefront.
        </div>
      )}

      {/* Presets */}
      <section className="bg-white border border-stone-200 rounded-2xl p-5">
        <h2 className="text-sm font-bold text-stone-700 mb-1">Preset Themes</h2>
        <p className="text-xs text-stone-400 mb-4">Click to apply — then customize or save as-is.</p>
        <div className="flex flex-wrap gap-2">
          {Object.entries(THEME_PRESETS).map(([key, preset]) => (
            <button
              key={key}
              type="button"
              onClick={() => applyPreset(key)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl border border-stone-200 hover:border-amber-300 bg-stone-50 hover:bg-amber-50 text-xs font-semibold text-stone-700 transition-all cursor-pointer"
            >
              <span className="flex gap-0.5">
                <span className="w-4 h-4 rounded-full border border-white/50 shadow-sm" style={{ backgroundColor: preset.colors.primary }} />
                <span className="w-4 h-4 rounded-full border border-white/50 shadow-sm -ml-1" style={{ backgroundColor: preset.colors.secondary }} />
              </span>
              {preset.label}
              <span className="text-stone-400 font-normal" dir="rtl">{preset.labelAr}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Colors + preview side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Colors */}
        <section className="bg-white border border-stone-200 rounded-2xl p-5 space-y-4">
          <h2 className="text-sm font-bold text-stone-700">Color Tokens</h2>
          <ColorField label="Primary — badges, stars, gold accents" value={form.primary}    onChange={setField("primary")} />
          <ColorField label="Secondary — buttons, prices, headings"  value={form.secondary}  onChange={setField("secondary")} />
          <ColorField label="Accent — hover states, light tints"     value={form.accent}     onChange={setField("accent")} />
          <ColorField label="Success — confirmations, checkmarks"    value={form.success}    onChange={setField("success")} />
          <ColorField label="Background — page background"           value={form.background} onChange={setField("background")} />
          <ColorField label="Text — body text and headings"          value={form.text}       onChange={setField("text")} />
        </section>

        {/* Preview */}
        <div className="space-y-4">
          <section className="bg-white border border-stone-200 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-stone-700">Live Preview</h2>
              <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">Updates instantly</span>
            </div>
            <ThemePreview form={form} />
          </section>
        </div>
      </div>

      {/* Typography */}
      <section className="bg-white border border-stone-200 rounded-2xl p-5">
        <h2 className="text-sm font-bold text-stone-700 mb-1">Typography</h2>
        <p className="text-xs text-stone-400 mb-4">Choose the Arabic/Latin typeface loaded for the entire storefront.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {(Object.entries(FONT_OPTIONS) as [FontFamily, typeof FONT_OPTIONS[FontFamily]][]).map(([key, font]) => (
            <button
              key={key}
              type="button"
              onClick={() => setForm(f => ({ ...f, fontFamily: key }))}
              className={`p-4 rounded-xl border-2 text-left transition-all cursor-pointer ${
                form.fontFamily === key
                  ? "border-amber-400 bg-amber-50"
                  : "border-stone-200 hover:border-stone-300 bg-white"
              }`}
            >
              <div className="text-sm font-bold text-stone-800 mb-0.5">{font.label}</div>
              <div className="text-xs text-stone-400 mb-2" dir="rtl">{font.labelAr}</div>
              <div
                className="text-base font-semibold text-stone-600 leading-snug"
                style={{ fontFamily: font.cssStack }}
              >
                أبجد هوز
              </div>
              <div
                className="text-xs text-stone-400 mt-0.5"
                style={{ fontFamily: font.cssStack }}
              >
                Arabic & Latin
              </div>
              {form.fontFamily === key && (
                <div className="mt-2 flex items-center gap-1 text-[10px] text-amber-700 font-bold">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Active
                </div>
              )}
            </button>
          ))}
        </div>
      </section>

      {/* Save footer */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="px-8 py-3 bg-amber-700 hover:bg-amber-800 disabled:opacity-60 text-white font-bold rounded-xl transition-colors cursor-pointer"
        >
          {saving ? "Saving…" : "Save Theme"}
        </button>
      </div>
    </div>
  );
}
