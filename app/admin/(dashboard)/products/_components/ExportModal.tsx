"use client";
import { useState } from "react";

interface Props {
  categories: string[];
  onClose: () => void;
}

type ExportFormat = "xlsx" | "csv" | "pdf";
type StockFilter = "all" | "true" | "false";

export default function ExportModal({ categories, onClose }: Props) {
  const [format, setFormat] = useState<ExportFormat>("xlsx");
  const [category, setCategory] = useState("all");
  const [inStock, setInStock] = useState<StockFilter>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [exporting, setExporting] = useState(false);

  function buildUrl() {
    const params = new URLSearchParams({ format, category, inStock });
    if (dateFrom) params.set("dateFrom", dateFrom);
    if (dateTo) params.set("dateTo", dateTo);
    return `/api/admin/products/export?${params.toString()}`;
  }

  function handleExport() {
    const url = buildUrl();
    if (format === "pdf") {
      window.open(url, "_blank");
      return;
    }
    setExporting(true);
    const a = document.createElement("a");
    a.href = url;
    a.download = "";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => setExporting(false), 1500);
  }

  const formatOptions: { value: ExportFormat; label: string; desc: string; icon: React.ReactNode }[] = [
    {
      value: "xlsx",
      label: "Excel (.xlsx)",
      desc: "Best for editing and re-importing",
      icon: <ExcelIcon className="w-5 h-5 text-green-700" />,
    },
    {
      value: "csv",
      label: "CSV (.csv)",
      desc: "Universal format for any tool",
      icon: <CsvIcon className="w-5 h-5 text-blue-700" />,
    },
    {
      value: "pdf",
      label: "PDF (print)",
      desc: "Opens in browser for printing",
      icon: <PdfIcon className="w-5 h-5 text-red-600" />,
    },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-stone-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-emerald-100 rounded-lg flex items-center justify-center">
              <DownloadIcon className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <h2 className="font-bold text-stone-900 text-base">Export Products</h2>
              <p className="text-xs text-stone-500">Download filtered product list</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-600 transition-colors cursor-pointer p-1"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5">
          {/* Format selector */}
          <div>
            <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wide mb-2">
              Export Format
            </label>
            <div className="grid grid-cols-3 gap-2">
              {formatOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setFormat(opt.value)}
                  className={`flex flex-col items-start gap-1.5 px-3 py-3 rounded-xl border text-left transition-colors cursor-pointer ${
                    format === opt.value
                      ? "border-amber-500 bg-amber-50"
                      : "border-stone-200 hover:border-stone-300 hover:bg-stone-50"
                  }`}
                >
                  {opt.icon}
                  <span className="text-xs font-bold text-stone-800">{opt.label}</span>
                  <span className="text-[10px] text-stone-500 leading-tight">{opt.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Filters */}
          <div>
            <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wide mb-2">
              Filters
            </label>
            <div className="grid grid-cols-2 gap-3">
              {/* Category */}
              <div>
                <label className="block text-xs text-stone-500 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-800 bg-white outline-none focus:ring-2 focus:ring-amber-200 cursor-pointer"
                >
                  <option value="all">All Categories</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Stock status */}
              <div>
                <label className="block text-xs text-stone-500 mb-1">Stock Status</label>
                <select
                  value={inStock}
                  onChange={(e) => setInStock(e.target.value as StockFilter)}
                  className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-800 bg-white outline-none focus:ring-2 focus:ring-amber-200 cursor-pointer"
                >
                  <option value="all">All</option>
                  <option value="true">In Stock</option>
                  <option value="false">Out of Stock</option>
                </select>
              </div>

              {/* Date from */}
              <div>
                <label className="block text-xs text-stone-500 mb-1">Created From</label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-800 outline-none focus:ring-2 focus:ring-amber-200"
                />
              </div>

              {/* Date to */}
              <div>
                <label className="block text-xs text-stone-500 mb-1">Created To</label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-800 outline-none focus:ring-2 focus:ring-amber-200"
                />
              </div>
            </div>
          </div>

          {/* Exported fields info */}
          <div className="bg-stone-50 border border-stone-200 rounded-xl p-3">
            <p className="text-xs font-semibold text-stone-600 mb-2">Exported Fields</p>
            <div className="flex flex-wrap gap-1.5">
              {["ID", "SKU", "Name", "Description", "Category", "Price", "Sale Price", "Stock", "Status", "Badge", "Rating", "Reviews", "Images", "Created At", "Updated At"].map((f) => (
                <span key={f} className="text-[10px] font-medium bg-white border border-stone-200 text-stone-600 px-2 py-0.5 rounded">
                  {f}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-stone-100 flex items-center justify-between">
          <button
            onClick={onClose}
            className="text-sm text-stone-500 hover:text-stone-700 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700 transition-colors cursor-pointer disabled:opacity-60 shadow-sm"
          >
            {exporting ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <DownloadIcon className="w-4 h-4" />
            )}
            {exporting ? "Preparing…" : `Export ${format.toUpperCase()}`}
          </button>
        </div>
      </div>
    </div>
  );
}

function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function ExcelIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path strokeLinecap="round" d="M3 9h18M9 3v18M9 9l6 12M15 9l-6 12" />
    </svg>
  );
}

function CsvIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}

function PdfIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  );
}
