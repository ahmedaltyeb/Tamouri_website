"use client";
import { useEffect, useState, useCallback } from "react";
import AccountSidebar from "@/components/account/AccountSidebar";
import { useLanguage } from "@/contexts/LanguageContext";

interface Address {
  id: string; label: string; fullName: string; phone: string;
  line1: string; line2?: string | null; city: string; emirate: string; isDefault: boolean;
}

const EMIRATES = ["Abu Dhabi","Dubai","Sharjah","Ajman","Umm Al Quwain","Ras Al Khaimah","Fujairah"];
const EMPTY = { label:"Home", fullName:"", phone:"", line1:"", line2:"", city:"", emirate:"Abu Dhabi", isDefault:false };

export default function AddressesPage() {
  const { tr, dir } = useLanguage();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Address | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    fetch("/api/account/addresses", { credentials: "include" })
      .then((r) => r.json()).then(setAddresses).catch(() => setAddresses([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  function openNew() { setEditing(null); setForm(EMPTY); setShowForm(true); }
  function openEdit(a: Address) {
    setEditing(a);
    setForm({ label: a.label, fullName: a.fullName, phone: a.phone, line1: a.line1, line2: a.line2 ?? "", city: a.city, emirate: a.emirate, isDefault: a.isDefault });
    setShowForm(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault(); setSaving(true);
    try {
      const res = await fetch(editing ? `/api/account/addresses/${editing.id}` : "/api/account/addresses", {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form), credentials: "include",
      });
      if (res.ok) { setShowForm(false); load(); }
    } finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    if (!confirm(tr("confirmDelete"))) return;
    await fetch(`/api/account/addresses/${id}`, { method: "DELETE", credentials: "include" });
    load();
  }

  const inp = "w-full px-3 py-2 border border-stone-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brown/20 focus:border-brown transition-all";

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8" dir={dir}>
      <div className="flex flex-col md:flex-row gap-6">
        <AccountSidebar />

        <div className="flex-1 min-w-0">
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-ink">{tr("myAddresses")}</h2>
              <button onClick={openNew} className="flex items-center gap-1.5 px-4 py-2 bg-brown hover:bg-brown-dark text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
                </svg>
                {tr("addAddress")}
              </button>
            </div>

            {/* Form */}
            {showForm && (
              <form onSubmit={handleSave} className="bg-stone-50 rounded-2xl p-4 mb-6 space-y-3 border border-stone-200">
                <h3 className="font-bold text-sm text-ink">{editing ? tr("editAddress") : tr("addAddress")}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-600 mb-1">{tr("fullNameLabel")}</label>
                    <input required value={form.fullName} onChange={(e) => setForm({...form, fullName: e.target.value})} className={inp}/>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-600 mb-1">{tr("phoneInput")}</label>
                    <input required value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} className={inp}/>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-stone-600 mb-1">{tr("addressLine1")}</label>
                    <input required value={form.line1} onChange={(e) => setForm({...form, line1: e.target.value})} className={inp}/>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-stone-600 mb-1">{tr("addressLine2")}</label>
                    <input value={form.line2} onChange={(e) => setForm({...form, line2: e.target.value})} className={inp}/>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-600 mb-1">{tr("cityLabel")}</label>
                    <input required value={form.city} onChange={(e) => setForm({...form, city: e.target.value})} className={inp}/>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-600 mb-1">{tr("emirateLabel")}</label>
                    <select value={form.emirate} onChange={(e) => setForm({...form, emirate: e.target.value})} className={inp}>
                      {EMIRATES.map((em) => <option key={em}>{em}</option>)}
                    </select>
                  </div>
                </div>
                <label className="flex items-center gap-2 cursor-pointer text-sm text-stone-600">
                  <input type="checkbox" checked={form.isDefault} onChange={(e) => setForm({...form, isDefault: e.target.checked})} className="accent-brown"/>
                  {tr("setAsDefault")}
                </label>
                <div className="flex gap-2 justify-end">
                  <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-stone-600 border border-stone-200 rounded-xl hover:bg-stone-100 cursor-pointer">{tr("cancel")}</button>
                  <button type="submit" disabled={saving} className="px-4 py-2 text-sm text-white bg-brown hover:bg-brown-dark rounded-xl font-semibold cursor-pointer disabled:opacity-60">{saving ? "..." : tr("save")}</button>
                </div>
              </form>
            )}

            {/* List */}
            {loading ? (
              <div className="space-y-3">
                {[1,2].map(i => <div key={i} className="h-20 bg-stone-100 rounded-xl animate-pulse"/>)}
              </div>
            ) : addresses.length === 0 ? (
              <div className="text-center py-10 text-stone-400 text-sm">{tr("noAddresses")}</div>
            ) : (
              <div className="space-y-3">
                {addresses.map((a) => (
                  <div key={a.id} className={`border rounded-xl p-4 ${a.isDefault ? "border-brown bg-brown/5" : "border-stone-100"}`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-sm text-ink">{a.label}</p>
                          {a.isDefault && <span className="text-[10px] bg-brown text-white px-1.5 py-0.5 rounded-full font-bold">{tr("defaultAddress")}</span>}
                        </div>
                        <p className="text-sm text-stone-600">{a.fullName} · {a.phone}</p>
                        <p className="text-xs text-stone-400 mt-0.5">{a.line1}{a.line2 ? `, ${a.line2}` : ""}, {a.city}, {a.emirate}</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(a)} className="text-xs text-brown hover:underline cursor-pointer font-medium">{tr("edit")}</button>
                        <button onClick={() => handleDelete(a.id)} className="text-xs text-red-500 hover:underline cursor-pointer font-medium">{tr("deleteAddress")}</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
