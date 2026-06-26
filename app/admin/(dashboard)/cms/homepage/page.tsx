"use client";
import { useEffect, useState } from "react";

interface SectionData {
  id?: string;
  key: string;
  badgeEn: string;
  badgeAr: string;
  titleEn: string;
  titleAr: string;
  subtitleEn: string;
  subtitleAr: string;
}

// The five homepage section keys and their display names
const SECTIONS: { key: string; labelEn: string; labelAr: string; defaults: Omit<SectionData, "key" | "id"> }[] = [
  {
    key: "shop_categories",
    labelEn: "Shop by Category",
    labelAr: "تسوق حسب الفئة",
    defaults: { badgeEn: "", badgeAr: "", titleEn: "Shop by Category", titleAr: "تسوق حسب الفئة", subtitleEn: "", subtitleAr: "" },
  },
  {
    key: "featured_products",
    labelEn: "Featured Products",
    labelAr: "المنتجات المميزة",
    defaults: { badgeEn: "Top Picks", badgeAr: "أفضل اختيار", titleEn: "Discover Our Best Sellers", titleAr: "اكتشف أبرز منتجاتنا", subtitleEn: "Handpicked premium products loved by our customers", subtitleAr: "منتجات فاخرة مختارة بعناية ويحبها عملاؤنا" },
  },
  {
    key: "why_us",
    labelEn: "Why Choose Us",
    labelAr: "لماذا تختارنا",
    defaults: { badgeEn: "Our Advantages", badgeAr: "مزايانا", titleEn: "Why Choose Tamouri?", titleAr: "لماذا تختار تمـوري؟", subtitleEn: "We're committed to quality, authenticity, and your satisfaction", subtitleAr: "ملتزمون بالجودة والأصالة ورضاكم التام" },
  },
  {
    key: "testimonials",
    labelEn: "Testimonials",
    labelAr: "آراء العملاء",
    defaults: { badgeEn: "Customer Reviews", badgeAr: "آراء العملاء", titleEn: "What Our Customers Say", titleAr: "ماذا يقول عملاؤنا", subtitleEn: "Real experiences from satisfied customers across the UAE", subtitleAr: "تجارب حقيقية من عملاء راضين في جميع أنحاء الإمارات" },
  },
  {
    key: "latest_products",
    labelEn: "Latest Products",
    labelAr: "أحدث المنتجات",
    defaults: { badgeEn: "New Arrivals", badgeAr: "وصل حديثاً", titleEn: "Latest Arrivals", titleAr: "أحدث الوافدين", subtitleEn: "Fresh products added to our collection", subtitleAr: "منتجات جديدة أضفناها لمجموعتنا" },
  },
];

type FormsMap = Record<string, SectionData>;

const inp = "w-full px-3 py-2 border border-stone-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-amber-300";
const lbl = "block text-xs font-semibold text-stone-600 mb-1";

export default function HomepageSectionsPage() {
  const [forms, setForms] = useState<FormsMap>(() => {
    const m: FormsMap = {};
    SECTIONS.forEach((s) => { m[s.key] = { key: s.key, ...s.defaults }; });
    return m;
  });
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState<string | null>(null);
  const [messages, setMessages]   = useState<Record<string, string>>({});

  useEffect(() => {
    fetch("/api/admin/cms/homepage")
      .then((r) => r.json())
      .then((data: Record<string, SectionData>) => {
        setForms((prev) => {
          const next = { ...prev };
          Object.entries(data).forEach(([key, val]) => {
            if (next[key]) {
              next[key] = {
                key,
                badgeEn:    val.badgeEn    ?? next[key].badgeEn,
                badgeAr:    val.badgeAr    ?? next[key].badgeAr,
                titleEn:    val.titleEn    ?? next[key].titleEn,
                titleAr:    val.titleAr    ?? next[key].titleAr,
                subtitleEn: val.subtitleEn ?? next[key].subtitleEn,
                subtitleAr: val.subtitleAr ?? next[key].subtitleAr,
              };
            }
          });
          return next;
        });
        setLoading(false);
      });
  }, []);

  function setField(key: string, field: keyof SectionData, value: string) {
    setForms((f) => ({ ...f, [key]: { ...f[key], [field]: value } }));
  }

  async function saveSection(key: string) {
    setSaving(key);
    const r = await fetch("/api/admin/cms/homepage", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(forms[key]),
    });
    setSaving(null);
    setMessages((m) => ({ ...m, [key]: r.ok ? "✅ Saved!" : "❌ Save failed" }));
    setTimeout(() => setMessages((m) => ({ ...m, [key]: "" })), 3000);
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-stone-800">Homepage Section Headers</h1>
        <p className="text-sm text-stone-500 mt-0.5">
          Edit badge, title, and subtitle for each homepage section. Leave empty to use the default translations.
        </p>
      </div>

      {loading ? (
        <div className="bg-white border border-stone-200 rounded-2xl p-8 text-center text-stone-400 text-sm">Loading…</div>
      ) : (
        SECTIONS.map((s) => (
          <div key={s.key} className="bg-white border border-stone-200 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-bold text-stone-800">{s.labelEn}</h2>
                <p className="text-xs text-stone-400">{s.labelAr} · key: <code className="bg-stone-100 px-1 rounded text-stone-600">{s.key}</code></p>
              </div>
              <div className="flex items-center gap-3">
                {messages[s.key] && <span className="text-sm">{messages[s.key]}</span>}
                <button
                  onClick={() => saveSection(s.key)}
                  disabled={saving === s.key}
                  className="px-5 py-2 bg-amber-700 hover:bg-amber-800 disabled:opacity-50 text-white font-bold rounded-xl text-sm transition-colors">
                  {saving === s.key ? "Saving…" : "Save"}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Badge (English)</label>
                <input className={inp} value={forms[s.key]?.badgeEn ?? ""} placeholder={s.defaults.badgeEn || "optional"}
                  onChange={(e) => setField(s.key, "badgeEn", e.target.value)} />
              </div>
              <div>
                <label className={lbl}>الشارة (عربي)</label>
                <input className={inp} dir="rtl" value={forms[s.key]?.badgeAr ?? ""} placeholder={s.defaults.badgeAr || "اختياري"}
                  onChange={(e) => setField(s.key, "badgeAr", e.target.value)} />
              </div>
              <div>
                <label className={lbl}>Title (English)</label>
                <input className={inp} value={forms[s.key]?.titleEn ?? ""} placeholder={s.defaults.titleEn}
                  onChange={(e) => setField(s.key, "titleEn", e.target.value)} />
              </div>
              <div>
                <label className={lbl}>العنوان (عربي)</label>
                <input className={inp} dir="rtl" value={forms[s.key]?.titleAr ?? ""} placeholder={s.defaults.titleAr}
                  onChange={(e) => setField(s.key, "titleAr", e.target.value)} />
              </div>
              <div>
                <label className={lbl}>Subtitle (English)</label>
                <textarea className={inp} rows={2} value={forms[s.key]?.subtitleEn ?? ""} placeholder={s.defaults.subtitleEn || "optional"}
                  onChange={(e) => setField(s.key, "subtitleEn", e.target.value)} />
              </div>
              <div>
                <label className={lbl}>العنوان الفرعي (عربي)</label>
                <textarea className={inp} rows={2} dir="rtl" value={forms[s.key]?.subtitleAr ?? ""} placeholder={s.defaults.subtitleAr || "اختياري"}
                  onChange={(e) => setField(s.key, "subtitleAr", e.target.value)} />
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
