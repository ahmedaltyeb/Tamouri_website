"use client";
import { useState, useEffect, useRef } from "react";

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
}

const EMPTY: FormState = {
  nameEn: "", nameAr: "", taglineEn: "", taglineAr: "",
  logo: "", phone: "", whatsapp: "", email: "",
  addressEn: "", addressAr: "", workingHours: "",
  instagramUrl: "", twitterUrl: "", whatsappUrl: "",
  seoTitleEn: "", seoTitleAr: "", seoDescEn: "", seoDescAr: "",
};

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
      const res = await fetch("/api/admin/settings/site", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          logo: form.logo || null,
          instagramUrl: form.instagramUrl || null,
          twitterUrl: form.twitterUrl || null,
          whatsappUrl: form.whatsappUrl || null,
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

  const inp = "w-full px-3 py-2 border border-stone-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-400 transition-all bg-white";
  const label = "block text-xs font-semibold text-stone-600 mb-1";

  function Field({ id, lbl, dir }: { id: keyof FormState; lbl: string; dir?: "ltr" }) {
    return (
      <div>
        <label className={label}>{lbl}</label>
        <input
          type="text"
          value={form[id]}
          dir={dir}
          onChange={(e) => setForm({ ...form, [id]: e.target.value })}
          className={inp}
          placeholder={lbl}
        />
      </div>
    );
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
        <p className="text-sm text-stone-500 mt-1">Manage your store identity, contact info, and SEO metadata.</p>
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
            <Field id="nameEn" lbl="Store Name (English)" />
            <Field id="nameAr" lbl="Store Name (Arabic)" dir="ltr" />
            <Field id="taglineEn" lbl="Tagline (English)" />
            <Field id="taglineAr" lbl="Tagline (Arabic)" dir="ltr" />
            <div className="sm:col-span-2">
              <label className={label}>Logo</label>
              <div className="flex items-start gap-4 mt-1">
                {/* Preview */}
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
                  {/* Upload button */}
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handleLogoUpload}
                  />
                  <button
                    type="button"
                    onClick={() => logoInputRef.current?.click()}
                    disabled={logoUploading}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-amber-700 hover:bg-amber-800 disabled:opacity-60 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    {logoUploading ? (
                      <>
                        <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
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

                  {/* Manual URL fallback */}
                  <div>
                    <label className="text-[11px] text-stone-400 mb-1 block">Or paste an image URL</label>
                    <input
                      type="url"
                      value={form.logo}
                      onChange={(e) => setForm({ ...form, logo: e.target.value })}
                      className={inp}
                      placeholder="https://..."
                    />
                  </div>

                  {logoError && (
                    <p className="text-xs text-red-500">{logoError}</p>
                  )}

                  {form.logo && (
                    <button
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, logo: "" }))}
                      className="text-xs text-red-400 hover:text-red-600 transition-colors cursor-pointer"
                    >
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
            <Field id="phone" lbl="Phone" dir="ltr" />
            <Field id="whatsapp" lbl="WhatsApp" dir="ltr" />
            <Field id="email" lbl="Email" dir="ltr" />
            <Field id="workingHours" lbl="Working Hours" />
            <Field id="addressEn" lbl="Address (English)" />
            <Field id="addressAr" lbl="Address (Arabic)" dir="ltr" />
          </div>
        </section>

        {/* Social */}
        <section className="bg-white border border-stone-200 rounded-2xl p-5">
          <h2 className="text-sm font-bold text-stone-700 mb-4">Social Links</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field id="instagramUrl" lbl="Instagram URL" dir="ltr" />
            <Field id="twitterUrl" lbl="X (Twitter) URL" dir="ltr" />
            <Field id="whatsappUrl" lbl="WhatsApp URL" dir="ltr" />
          </div>
        </section>

        {/* SEO */}
        <section className="bg-white border border-stone-200 rounded-2xl p-5">
          <h2 className="text-sm font-bold text-stone-700 mb-4">SEO Metadata</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field id="seoTitleEn" lbl="SEO Title (English)" />
            <Field id="seoTitleAr" lbl="SEO Title (Arabic)" dir="ltr" />
            <div>
              <label className={label}>SEO Description (English)</label>
              <textarea
                value={form.seoDescEn}
                onChange={(e) => setForm({ ...form, seoDescEn: e.target.value })}
                rows={3}
                className={inp}
                placeholder="160 characters max"
              />
            </div>
            <div>
              <label className={label}>SEO Description (Arabic)</label>
              <textarea
                value={form.seoDescAr}
                onChange={(e) => setForm({ ...form, seoDescAr: e.target.value })}
                rows={3}
                dir="rtl"
                className={inp}
              />
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
