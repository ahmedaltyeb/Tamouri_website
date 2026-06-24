"use client";
import { useState, useTransition, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ImportModal from "./ImportModal";
import ExportModal from "./ExportModal";

export type Product = {
  id: string;
  sku: string | null;
  name: { en: string; ar: string };
  description: { en: string; ar: string };
  price: number;
  originalPrice: number | null;
  category: string;
  categorySlug: string;
  image: string;
  badge: string | null;
  rating: number;
  reviews: number;
  inStock: boolean;
  stock: number;
  createdAt: Date;
};

interface Props {
  products: Product[];
  categories: string[]; // distinct categorySlug values
}

type BulkAction = "delete" | "changeStatus" | "updateStock" | "markFeatured" | "unmarkFeatured";

export default function ProductsClient({ products, categories }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showImport, setShowImport] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [bulkAction, setBulkAction] = useState<BulkAction | "">("");
  const [bulkData, setBulkData] = useState<{ stock?: string; category?: string; categorySlug?: string }>({});
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkMsg, setBulkMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");

  // ── Selection ─────────────────────────────────────────────────
  const allIds = products.map((p) => p.id);
  const allSelected = allIds.length > 0 && allIds.every((id) => selected.has(id));

  const toggleAll = () => {
    setSelected(allSelected ? new Set() : new Set(allIds));
  };
  const toggleOne = (id: string) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };

  // ── Filtering ─────────────────────────────────────────────────
  const filtered = products.filter((p) => {
    const q = searchQuery.toLowerCase();
    if (q) {
      const searchIn = [p.name.en, p.name.ar, p.description.en, p.description.ar].join(" ").toLowerCase();
      if (!searchIn.includes(q)) return false;
    }
    if (categoryFilter !== "all" && p.categorySlug !== categoryFilter) return false;
    if (stockFilter === "in" && (!p.inStock || p.stock === 0)) return false;
    if (stockFilter === "out" && p.inStock && p.stock > 0) return false;
    if (stockFilter === "disabled" && p.inStock) return false;
    return true;
  });

  // ── Bulk actions ─────────────────────────────────────────────
  const handleBulkAction = useCallback(async () => {
    if (!bulkAction || selected.size === 0) return;
    setBulkLoading(true);
    setBulkMsg(null);

    const ids = Array.from(selected);
    const data: Record<string, unknown> = {};

    if (bulkAction === "changeStatus") {
      // Toggled via the UI — handled below
    } else if (bulkAction === "updateStock") {
      data.stock = parseInt(bulkData.stock ?? "0", 10);
    } else if (bulkAction === "markFeatured") {
      data.badge = "Featured";
    }

    try {
      const res = await fetch("/api/admin/products/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: bulkAction, ids, data }),
      });
      const json = await res.json();
      if (!res.ok) {
        setBulkMsg({ text: json.error || "Bulk action failed", ok: false });
      } else {
        setBulkMsg({ text: json.message || `Done — ${json.affected} product(s) updated.`, ok: true });
        setSelected(new Set());
        setBulkAction("");
        startTransition(() => router.refresh());
      }
    } catch {
      setBulkMsg({ text: "Network error. Try again.", ok: false });
    } finally {
      setBulkLoading(false);
    }
  }, [bulkAction, selected, bulkData, router]);

  async function handleBulkSetStatus(inStock: boolean) {
    if (selected.size === 0) return;
    setBulkLoading(true);
    setBulkMsg(null);
    try {
      const res = await fetch("/api/admin/products/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "changeStatus", ids: Array.from(selected), data: { inStock } }),
      });
      const json = await res.json();
      if (!res.ok) {
        setBulkMsg({ text: json.error || "Failed", ok: false });
      } else {
        setBulkMsg({ text: `${json.affected} product(s) ${inStock ? "enabled" : "disabled"}.`, ok: true });
        setSelected(new Set());
        startTransition(() => router.refresh());
      }
    } catch {
      setBulkMsg({ text: "Network error", ok: false });
    } finally {
      setBulkLoading(false);
    }
  }

  async function handleDelete(productId: string, productName: { en: string; ar: string }) {
    if (!confirm(`Delete "${productName.en}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/admin/products/${productId}`, { method: "DELETE" });
      if (res.ok) {
        startTransition(() => router.refresh());
      } else {
        alert("Delete failed.");
      }
    } catch {
      alert("Network error.");
    }
  }

  async function handleBulkDelete() {
    if (selected.size === 0) return;
    if (!confirm(`Delete ${selected.size} selected product(s)? Products linked to orders will be skipped.`)) return;
    setBulkLoading(true);
    setBulkMsg(null);
    try {
      const res = await fetch("/api/admin/products/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", ids: Array.from(selected) }),
      });
      const json = await res.json();
      if (!res.ok) {
        setBulkMsg({ text: json.error || "Delete failed", ok: false });
      } else {
        setBulkMsg({ text: json.message || `${json.affected} deleted.`, ok: true });
        setSelected(new Set());
        startTransition(() => router.refresh());
      }
    } catch {
      setBulkMsg({ text: "Network error", ok: false });
    } finally {
      setBulkLoading(false);
    }
  }

  return (
    <>
      {/* ── Page header ───────────────────────────────────────── */}
      <div className="p-8 pb-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-stone-900">Products</h1>
            <p className="text-sm text-stone-500 mt-0.5">
              {products.length} products total
              {filtered.length !== products.length && ` · ${filtered.length} shown`}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Download template */}
            <div className="relative group">
              <button className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-stone-600 border border-stone-200 rounded-lg hover:border-stone-300 hover:bg-stone-50 transition-colors cursor-pointer">
                <TemplateIcon className="w-3.5 h-3.5" />
                Template
                <ChevronDown className="w-3 h-3" />
              </button>
              <div className="absolute right-0 top-full mt-1 bg-white border border-stone-200 rounded-xl shadow-lg p-1.5 w-44 hidden group-hover:block z-20">
                <a
                  href="/api/admin/products/template?format=xlsx"
                  download
                  className="flex items-center gap-2 px-3 py-2 text-xs text-stone-700 hover:bg-stone-50 rounded-lg cursor-pointer"
                >
                  <span className="text-green-600 font-bold">XLS</span> Excel Template
                </a>
                <a
                  href="/api/admin/products/template?format=csv"
                  download
                  className="flex items-center gap-2 px-3 py-2 text-xs text-stone-700 hover:bg-stone-50 rounded-lg cursor-pointer"
                >
                  <span className="text-blue-600 font-bold">CSV</span> CSV Template
                </a>
              </div>
            </div>

            {/* Export */}
            <button
              onClick={() => setShowExport(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-700 border border-emerald-200 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors cursor-pointer"
            >
              <DownloadIcon className="w-3.5 h-3.5" />
              Export
            </button>

            {/* Import */}
            <button
              onClick={() => setShowImport(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-amber-700 border border-amber-200 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors cursor-pointer"
            >
              <UploadIcon className="w-3.5 h-3.5" />
              Import
            </button>

            {/* Add product */}
            <Link
              href="/admin/products/new"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors cursor-pointer"
            >
              <PlusIcon className="w-4 h-4" />
              Add Product
            </Link>
          </div>
        </div>

        {/* ── Filters row ──────────────────────────────────────── */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="relative flex-1 min-w-[200px]">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              placeholder="Search products…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-stone-200 rounded-lg outline-none focus:ring-2 focus:ring-amber-200 bg-white"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-700 bg-white outline-none focus:ring-2 focus:ring-amber-200 cursor-pointer"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            className="border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-700 bg-white outline-none focus:ring-2 focus:ring-amber-200 cursor-pointer"
          >
            <option value="all">All Stock</option>
            <option value="in">In Stock</option>
            <option value="out">Out of Stock</option>
            <option value="disabled">Disabled</option>
          </select>
        </div>

        {/* ── Bulk actions bar ─────────────────────────────────── */}
        {selected.size > 0 && (
          <div className="flex flex-wrap items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-4">
            <span className="text-sm font-semibold text-amber-800">
              {selected.size} selected
            </span>
            <div className="h-4 w-px bg-amber-300" />

            {/* Enable */}
            <button
              onClick={() => handleBulkSetStatus(true)}
              disabled={bulkLoading}
              className="text-xs font-semibold text-emerald-700 border border-emerald-300 bg-white hover:bg-emerald-50 px-3 py-1.5 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
            >
              Enable
            </button>

            {/* Disable */}
            <button
              onClick={() => handleBulkSetStatus(false)}
              disabled={bulkLoading}
              className="text-xs font-semibold text-stone-600 border border-stone-300 bg-white hover:bg-stone-50 px-3 py-1.5 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
            >
              Disable
            </button>

            {/* Mark Featured */}
            <button
              onClick={async () => {
                setBulkLoading(true);
                setBulkMsg(null);
                try {
                  const res = await fetch("/api/admin/products/bulk", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ action: "markFeatured", ids: Array.from(selected), data: { badge: "Featured" } }),
                  });
                  const json = await res.json();
                  if (res.ok) {
                    setBulkMsg({ text: `${json.affected} marked as Featured.`, ok: true });
                    setSelected(new Set());
                    startTransition(() => router.refresh());
                  } else {
                    setBulkMsg({ text: json.error || "Failed", ok: false });
                  }
                } catch { setBulkMsg({ text: "Network error", ok: false }); }
                finally { setBulkLoading(false); }
              }}
              disabled={bulkLoading}
              className="text-xs font-semibold text-amber-700 border border-amber-300 bg-white hover:bg-amber-50 px-3 py-1.5 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
            >
              Mark Featured
            </button>

            {/* Remove badge */}
            <button
              onClick={async () => {
                setBulkLoading(true);
                setBulkMsg(null);
                try {
                  const res = await fetch("/api/admin/products/bulk", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ action: "unmarkFeatured", ids: Array.from(selected) }),
                  });
                  const json = await res.json();
                  if (res.ok) {
                    setBulkMsg({ text: `Badge removed from ${json.affected} product(s).`, ok: true });
                    setSelected(new Set());
                    startTransition(() => router.refresh());
                  } else {
                    setBulkMsg({ text: json.error || "Failed", ok: false });
                  }
                } catch { setBulkMsg({ text: "Network error", ok: false }); }
                finally { setBulkLoading(false); }
              }}
              disabled={bulkLoading}
              className="text-xs font-semibold text-stone-500 border border-stone-200 bg-white hover:bg-stone-50 px-3 py-1.5 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
            >
              Remove Badge
            </button>

            {/* Update stock inline */}
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                min="0"
                placeholder="Stock qty"
                value={bulkData.stock ?? ""}
                onChange={(e) => setBulkData((d) => ({ ...d, stock: e.target.value }))}
                className="w-24 border border-stone-200 rounded-lg px-2 py-1.5 text-xs outline-none focus:ring-2 focus:ring-amber-200"
              />
              <button
                onClick={async () => {
                  const stock = parseInt(bulkData.stock ?? "0", 10);
                  if (isNaN(stock) || stock < 0) return;
                  setBulkLoading(true);
                  setBulkMsg(null);
                  try {
                    const res = await fetch("/api/admin/products/bulk", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ action: "updateStock", ids: Array.from(selected), data: { stock } }),
                    });
                    const json = await res.json();
                    if (res.ok) {
                      setBulkMsg({ text: `Stock updated for ${json.affected} product(s).`, ok: true });
                      setSelected(new Set());
                      setBulkData({});
                      startTransition(() => router.refresh());
                    } else {
                      setBulkMsg({ text: json.error || "Failed", ok: false });
                    }
                  } catch { setBulkMsg({ text: "Network error", ok: false }); }
                  finally { setBulkLoading(false); }
                }}
                disabled={bulkLoading || !bulkData.stock}
                className="text-xs font-semibold text-blue-700 border border-blue-300 bg-white hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
              >
                Set Stock
              </button>
            </div>

            <div className="flex-1" />

            {/* Delete */}
            <button
              onClick={handleBulkDelete}
              disabled={bulkLoading}
              className="text-xs font-semibold text-red-600 border border-red-200 bg-white hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1"
            >
              <TrashIcon className="w-3.5 h-3.5" />
              Delete ({selected.size})
            </button>

            <button
              onClick={() => setSelected(new Set())}
              className="text-xs text-stone-400 hover:text-stone-600 transition-colors cursor-pointer"
            >
              Clear
            </button>
          </div>
        )}

        {/* Bulk feedback message */}
        {bulkMsg && (
          <div className={`mb-4 px-4 py-2.5 rounded-xl text-sm font-medium border ${
            bulkMsg.ok
              ? "bg-green-50 border-green-200 text-green-800"
              : "bg-red-50 border-red-200 text-red-700"
          }`}>
            {bulkMsg.text}
          </div>
        )}
      </div>

      {/* ── Table ────────────────────────────────────────────────── */}
      <div className="px-8 pb-8">
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-100 bg-stone-50 text-left">
                  <th className="px-4 py-3 w-10">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={toggleAll}
                      className="rounded border-stone-300 text-amber-600 cursor-pointer"
                    />
                  </th>
                  <th className="px-4 py-3 font-semibold text-stone-500 text-xs uppercase tracking-wide">Product</th>
                  <th className="px-4 py-3 font-semibold text-stone-500 text-xs uppercase tracking-wide">SKU</th>
                  <th className="px-4 py-3 font-semibold text-stone-500 text-xs uppercase tracking-wide">Category</th>
                  <th className="px-4 py-3 font-semibold text-stone-500 text-xs uppercase tracking-wide">Price</th>
                  <th className="px-4 py-3 font-semibold text-stone-500 text-xs uppercase tracking-wide">Stock</th>
                  <th className="px-4 py-3 font-semibold text-stone-500 text-xs uppercase tracking-wide">Badge</th>
                  <th className="px-4 py-3 font-semibold text-stone-500 text-xs uppercase tracking-wide">Rating</th>
                  <th className="px-4 py-3 font-semibold text-stone-500 text-xs uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filtered.map((p) => (
                  <tr
                    key={p.id}
                    className={`transition-colors duration-100 ${
                      selected.has(p.id) ? "bg-amber-50" : "hover:bg-stone-50"
                    }`}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selected.has(p.id)}
                        onChange={() => toggleOne(p.id)}
                        className="rounded border-stone-300 text-amber-600 cursor-pointer"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={p.image}
                          alt={p.name.en}
                          className="w-10 h-10 rounded-lg object-cover flex-shrink-0 bg-stone-100"
                          onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.svg"; }}
                        />
                        <div className="min-w-0">
                          <p className="font-medium text-stone-900 leading-snug truncate max-w-[180px]">{p.name.en}</p>
                          <p className="text-xs text-stone-400 truncate max-w-[180px]" dir="rtl">
                            {p.name.ar}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs font-mono text-stone-500">
                      {p.sku ?? <span className="text-stone-300">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                        {p.categorySlug}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="font-semibold text-stone-800">{p.price} AED</span>
                      {p.originalPrice && (
                        <span className="block text-xs text-stone-400 line-through">{p.originalPrice} AED</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {!p.inStock ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">Disabled</span>
                      ) : p.stock === 0 ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">Out of stock</span>
                      ) : p.stock <= 5 ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">Low — {p.stock}</span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">{p.stock} in stock</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-stone-500">{p.badge ?? "—"}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-amber-500">★</span>{" "}
                      <span className="text-stone-700 font-medium">{p.rating.toFixed(1)}</span>
                      <span className="text-stone-400 text-xs ml-1">({p.reviews})</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/products/${p.id}/edit`}
                          className="px-3 py-1.5 text-xs font-medium text-stone-600 border border-stone-200 rounded-lg hover:border-amber-300 hover:text-amber-700 transition-colors duration-150 cursor-pointer"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(p.id, p.name)}
                          className="px-3 py-1.5 text-xs font-medium text-red-500 border border-red-100 rounded-lg hover:bg-red-50 hover:border-red-200 transition-colors duration-150 cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={9} className="px-4 py-16 text-center">
                      <p className="text-stone-400 text-sm">
                        {searchQuery || categoryFilter !== "all" || stockFilter !== "all"
                          ? "No products match your filters."
                          : "No products yet."}
                      </p>
                      {!searchQuery && categoryFilter === "all" && stockFilter === "all" && (
                        <Link
                          href="/admin/products/new"
                          className="text-amber-600 hover:underline text-sm mt-1 inline-block"
                        >
                          Add your first product
                        </Link>
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {filtered.length > 0 && (
            <div className="px-4 py-3 border-t border-stone-100 text-xs text-stone-400 flex items-center justify-between">
              <span>Showing {filtered.length} of {products.length} products</span>
              {selected.size > 0 && (
                <span className="text-amber-700 font-medium">{selected.size} selected</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Modals ─────────────────────────────────────────────── */}
      {showImport && <ImportModal onClose={() => setShowImport(false)} />}
      {showExport && <ExportModal categories={categories} onClose={() => setShowExport(false)} />}
    </>
  );
}

// ── Icons ──────────────────────────────────────────────────────────

function PlusIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>;
}
function DownloadIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>;
}
function UploadIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>;
}
function TemplateIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
}
function SearchIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;
}
function TrashIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;
}
function ChevronDown({ className }: { className?: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>;
}
