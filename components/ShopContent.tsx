"use client";
import { useState, useMemo, useEffect, useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import ProductCard from "@/components/ProductCard";
import { categories, parseMLText } from "@/lib/products";
import { useLanguage } from "@/contexts/LanguageContext";
import { useProducts } from "@/hooks/useProducts";
import type { Product } from "@/lib/products";

// ── Config ────────────────────────────────────────────────────────────────────
const SHOP_CONFIG = {
  productsPerPage: 12,
  showCategoryCounts: true,
  showCategorySlider: true,
  enablePagination: true,
} as const;

const CAT_IMAGES: Record<string, string> = {
  "dates":            "https://i.ibb.co/WvwTpK27/dates.jpg",
  "arabic-coffee":    "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&q=80",
  "specialty-coffee": "https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=400&q=80",
  "tea":              "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&q=80",
  "tools":            "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&q=80",
  "travel-tools":     "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=400&q=80",
  "sweets":           "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=400&q=80",
};

const RATING_OPTIONS = [
  { label: "4+ stars", value: 4 },
  { label: "3+ stars", value: 3 },
  { label: "Any rating", value: 0 },
];

// ── Skeleton card ─────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden animate-pulse">
      <div className="aspect-square bg-stone-50" />
      <div className="p-3 space-y-2">
        <div className="h-3 bg-stone-100 rounded w-2/3" />
        <div className="h-4 bg-stone-100 rounded w-full" />
        <div className="h-8 bg-stone-100 rounded w-full mt-3" />
      </div>
    </div>
  );
}

// ── Pagination ────────────────────────────────────────────────────────────────
function Pagination({
  currentPage,
  totalPages,
  onPage,
}: {
  currentPage: number;
  totalPages: number;
  onPage: (p: number) => void;
}) {
  const { lang } = useLanguage();
  if (totalPages <= 1) return null;

  const pages: (number | "…")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push("…");
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) pages.push(i);
    if (currentPage < totalPages - 2) pages.push("…");
    pages.push(totalPages);
  }

  const base = "flex items-center justify-center min-w-[36px] h-9 rounded-xl text-sm font-semibold transition-all cursor-pointer select-none";
  const idle = "bg-white border border-stone-200 text-stone-600 hover:border-brown hover:text-brown";
  const active = "bg-brown text-white shadow-sm shadow-brown/20";
  const disabled = "opacity-40 cursor-not-allowed bg-white border border-stone-200 text-stone-400";
  const isRtl = lang === "ar";

  return (
    <div className="flex items-center justify-center gap-1.5 pt-2 pb-4">
      <button onClick={() => onPage(currentPage - 1)} disabled={currentPage === 1}
        className={`${base} gap-1.5 px-3 ${currentPage === 1 ? disabled : idle}`}>
        <svg className={`w-4 h-4 flex-none ${isRtl ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        <span className="hidden sm:inline">{isRtl ? "السابق" : "Previous"}</span>
      </button>
      {pages.map((p, idx) =>
        p === "…" ? (
          <span key={`e-${idx}`} className="flex items-center justify-center min-w-[36px] h-9 text-stone-400 text-sm select-none">…</span>
        ) : (
          <button key={p} onClick={() => onPage(p as number)}
            className={`${base} px-2 ${p === currentPage ? active : idle}`}
            aria-current={p === currentPage ? "page" : undefined}>
            {p}
          </button>
        )
      )}
      <button onClick={() => onPage(currentPage + 1)} disabled={currentPage === totalPages}
        className={`${base} gap-1.5 px-3 ${currentPage === totalPages ? disabled : idle}`}>
        <span className="hidden sm:inline">{isRtl ? "التالي" : "Next"}</span>
        <svg className={`w-4 h-4 flex-none ${isRtl ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}

// ── Filter panel (shared between sidebar + mobile drawer) ─────────────────────
interface FilterPanelProps {
  products: Product[];
  minPrice: string;
  maxPrice: string;
  inStockOnly: boolean;
  minRating: number;
  onMinPrice: (v: string) => void;
  onMaxPrice: (v: string) => void;
  onInStock: (v: boolean) => void;
  onRating: (v: number) => void;
  onClear: () => void;
  activeCount: number;
}

function FilterPanel({
  products, minPrice, maxPrice, inStockOnly, minRating,
  onMinPrice, onMaxPrice, onInStock, onRating, onClear, activeCount,
}: FilterPanelProps) {
  const prices = products.map((p) => p.price);
  const maxProductPrice = prices.length > 0 ? Math.ceil(Math.max(...prices)) : 2000;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-stone-800 uppercase tracking-wider">Filters</h3>
        {activeCount > 0 && (
          <button
            onClick={onClear}
            className="text-xs text-amber-700 font-semibold hover:text-amber-900 cursor-pointer transition-colors"
          >
            Clear all ({activeCount})
          </button>
        )}
      </div>

      {/* Price range */}
      <div>
        <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-3">Price (AED)</p>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="number"
              min={0}
              max={maxProductPrice}
              placeholder="Min"
              value={minPrice}
              onChange={(e) => onMinPrice(e.target.value)}
              className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400 transition-all"
            />
          </div>
          <span className="text-stone-400 text-xs font-medium flex-none">to</span>
          <div className="relative flex-1">
            <input
              type="number"
              min={0}
              max={maxProductPrice}
              placeholder="Max"
              value={maxPrice}
              onChange={(e) => onMaxPrice(e.target.value)}
              className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400 transition-all"
            />
          </div>
        </div>
        {/* Quick price presets */}
        <div className="flex flex-wrap gap-1.5 mt-2.5">
          {[
            { label: "Under 100", min: "", max: "100" },
            { label: "100–300", min: "100", max: "300" },
            { label: "300+", min: "300", max: "" },
          ].map(({ label, min, max }) => {
            const isActive = minPrice === min && maxPrice === max;
            return (
              <button
                key={label}
                onClick={() => { onMinPrice(min); onMaxPrice(max); }}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                  isActive
                    ? "bg-amber-100 text-amber-800 border border-amber-300"
                    : "bg-stone-100 text-stone-600 border border-stone-200 hover:bg-stone-200"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* In stock */}
      <div>
        <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-3">Availability</p>
        <label className="flex items-center gap-3 cursor-pointer group">
          <div
            onClick={() => onInStock(!inStockOnly)}
            className={`relative w-10 h-5 rounded-full transition-colors flex-none ${inStockOnly ? "bg-amber-500" : "bg-stone-200"}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${inStockOnly ? "translate-x-5" : "translate-x-0"}`} />
          </div>
          <span className="text-sm text-stone-700 group-hover:text-stone-900">In stock only</span>
        </label>
      </div>

      {/* Minimum rating */}
      <div>
        <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-3">Customer Rating</p>
        <div className="space-y-2">
          {RATING_OPTIONS.map(({ label, value }) => (
            <label key={value} className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="radio"
                name="rating-filter"
                checked={minRating === value}
                onChange={() => onRating(value)}
                className="accent-amber-500 w-4 h-4 cursor-pointer"
              />
              <div className="flex items-center gap-1.5">
                {value > 0 && (
                  <span className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <svg key={s} className={`w-3.5 h-3.5 ${s <= value ? "text-amber-400" : "text-stone-200"}`} fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </span>
                )}
                <span className="text-sm text-stone-700 group-hover:text-stone-900">{label}</span>
              </div>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Active filter chip ─────────────────────────────────────────────────────────
function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-50 border border-amber-200 text-amber-800 rounded-full text-xs font-medium">
      {label}
      <button
        onClick={onRemove}
        className="ml-1 hover:text-amber-950 cursor-pointer transition-colors"
        aria-label={`Remove ${label} filter`}
      >
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </span>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function ShopContent({ initialProducts }: { initialProducts?: Product[] }) {
  const { tr, lang, dir } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { products, loading } = useProducts(initialProducts);

  // ── Filter state (all synced to URL) ──
  const [activeCategory, setActiveCategory] = useState(searchParams.get("category") ?? "all");
  const [sortBy, setSortBy] = useState(searchParams.get("sort") ?? "default");
  const [search, setSearch] = useState(searchParams.get("q") ?? "");
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") ?? "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") ?? "");
  const [inStockOnly, setInStockOnly] = useState(searchParams.get("inStock") === "1");
  const [minRating, setMinRating] = useState(Number(searchParams.get("minRating") ?? "0"));
  const [currentPage, setCurrentPage] = useState(Math.max(1, Number(searchParams.get("page") ?? "1")));
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const { productsPerPage, showCategoryCounts, showCategorySlider, enablePagination } = SHOP_CONFIG;

  // ── URL sync ──
  const pushUrl = useCallback(
    (overrides: Record<string, string | number | null> = {}) => {
      const current: Record<string, string | number | null> = {
        category: activeCategory !== "all" ? activeCategory : null,
        sort: sortBy !== "default" ? sortBy : null,
        q: search.trim() || null,
        minPrice: minPrice || null,
        maxPrice: maxPrice || null,
        inStock: inStockOnly ? "1" : null,
        minRating: minRating > 0 ? minRating : null,
        page: currentPage > 1 ? currentPage : null,
      };
      const merged = { ...current, ...overrides };
      const p = new URLSearchParams();
      for (const [k, v] of Object.entries(merged)) {
        if (v !== null && v !== undefined) p.set(k, String(v));
      }
      const qs = p.toString();
      router.replace(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
    },
    [pathname, router, activeCategory, sortBy, search, minPrice, maxPrice, inStockOnly, minRating, currentPage]
  );

  // Reset page to 1 on any filter change
  useEffect(() => { setCurrentPage(1); }, [activeCategory, sortBy, search, minPrice, maxPrice, inStockOnly, minRating]);

  const handleCategory = (cat: string) => {
    setActiveCategory(cat);
    pushUrl({ category: cat !== "all" ? cat : null, page: null });
  };
  const handleSearch = (q: string) => {
    setSearch(q);
    pushUrl({ q: q.trim() || null, page: null });
  };
  const handleSort = (s: string) => {
    setSortBy(s);
    pushUrl({ sort: s !== "default" ? s : null, page: null });
  };
  const handleMinPrice = (v: string) => {
    setMinPrice(v);
    pushUrl({ minPrice: v || null, page: null });
  };
  const handleMaxPrice = (v: string) => {
    setMaxPrice(v);
    pushUrl({ maxPrice: v || null, page: null });
  };
  const handleInStock = (v: boolean) => {
    setInStockOnly(v);
    pushUrl({ inStock: v ? "1" : null, page: null });
  };
  const handleRating = (v: number) => {
    setMinRating(v);
    pushUrl({ minRating: v > 0 ? v : null, page: null });
  };
  const handlePage = (page: number) => {
    setCurrentPage(page);
    pushUrl({ page: page > 1 ? page : null });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const clearAllFilters = () => {
    setMinPrice("");
    setMaxPrice("");
    setInStockOnly(false);
    setMinRating(0);
    pushUrl({ minPrice: null, maxPrice: null, inStock: null, minRating: null, page: null });
  };

  // ── Filtered + sorted products ──
  const filtered = useMemo(() => {
    let result = [...products];
    if (activeCategory !== "all") result = result.filter((p) => p.categorySlug === activeCategory);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter((p) => {
        const name = parseMLText(p.name);
        const desc = parseMLText(p.description);
        return (
          name.en.toLowerCase().includes(q) ||
          name.ar.toLowerCase().includes(q) ||
          desc.en.toLowerCase().includes(q) ||
          desc.ar.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
        );
      });
    }
    if (minPrice !== "") result = result.filter((p) => p.price >= Number(minPrice));
    if (maxPrice !== "") result = result.filter((p) => p.price <= Number(maxPrice));
    if (inStockOnly) result = result.filter((p) => p.inStock);
    if (minRating > 0) result = result.filter((p) => p.rating >= minRating);
    if (sortBy === "price-asc") result.sort((a, b) => a.price - b.price);
    else if (sortBy === "price-desc") result.sort((a, b) => b.price - a.price);
    else if (sortBy === "rating") result.sort((a, b) => b.rating - a.rating);
    // "newest" falls through to default order (server already returns newest-first)
    return result;
  }, [products, activeCategory, sortBy, search, minPrice, maxPrice, inStockOnly, minRating]);

  // ── Pagination ──
  const totalPages = enablePagination ? Math.max(1, Math.ceil(filtered.length / productsPerPage)) : 1;
  const safePage = Math.min(currentPage, totalPages);
  const startIdx = (safePage - 1) * productsPerPage;
  const paged = enablePagination ? filtered.slice(startIdx, startIdx + productsPerPage) : filtered;
  const startItem = filtered.length === 0 ? 0 : startIdx + 1;
  const endItem = Math.min(startIdx + productsPerPage, filtered.length);

  // ── Active filter count (excludes category + search + sort) ──
  const advancedFilterCount = [
    minPrice !== "",
    maxPrice !== "",
    inStockOnly,
    minRating > 0,
  ].filter(Boolean).length;

  const activeCatLabel = activeCategory === "all"
    ? tr("all")
    : tr(categories.find((c) => c.slug === activeCategory)?.nameKey ?? "all");
  const isRtl = lang === "ar";

  return (
    <div className="min-h-screen bg-stone-50" dir={dir}>

      {/* ── Page header ── */}
      <div className="bg-white border-b border-stone-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <h1 className="text-2xl md:text-3xl font-black text-ink mb-1.5">
            {activeCategory === "all" ? tr("shopPageTitle") : activeCatLabel}
          </h1>
          <nav className="flex items-center gap-1.5 text-sm text-stone-400" aria-label="breadcrumb">
            <Link href="/" className="hover:text-brown transition-colors">{tr("home")}</Link>
            <span>/</span>
            {activeCategory === "all" ? (
              <span className="text-ink font-medium">{tr("shop")}</span>
            ) : (
              <>
                <button onClick={() => handleCategory("all")} className="hover:text-brown transition-colors cursor-pointer">{tr("shop")}</button>
                <span>/</span>
                <span className="text-ink font-medium">{activeCatLabel}</span>
              </>
            )}
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-5">

        {/* ── Category slider ── */}
        {showCategorySlider && (
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm px-4 pt-4 pb-3">
            <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1 md:flex-wrap md:justify-center md:overflow-visible">

              <button onClick={() => handleCategory("all")} className="flex-none flex flex-col items-center gap-2 group cursor-pointer">
                <div className={`relative w-[72px] h-[72px] md:w-20 md:h-20 rounded-xl overflow-hidden border-2 transition-all duration-200 ${activeCategory === "all" ? "border-brown ring-2 ring-brown/20 shadow-md" : "border-stone-200 hover:border-brown/50"}`}>
                  <div className="w-full h-full bg-gradient-to-br from-brown to-gold flex items-center justify-center">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                  </div>
                  {activeCategory === "all" && <div className="absolute inset-0 bg-brown/10" />}
                </div>
                <span className={`text-xs font-semibold text-center leading-tight whitespace-nowrap transition-colors ${activeCategory === "all" ? "text-brown" : "text-stone-600 group-hover:text-brown"}`}>
                  {tr("all")}
                  {showCategoryCounts && <><br /><span className="text-[10px] font-normal text-stone-400">({products.length})</span></>}
                </span>
              </button>

              {categories.map((cat) => {
                const count = products.filter((p) => p.categorySlug === cat.slug).length;
                const isActive = activeCategory === cat.slug;
                return (
                  <button key={cat.id} onClick={() => handleCategory(cat.slug)} className="flex-none flex flex-col items-center gap-2 group cursor-pointer">
                    <div className={`relative w-[72px] h-[72px] md:w-20 md:h-20 rounded-xl overflow-hidden border-2 transition-all duration-200 ${isActive ? "border-brown ring-2 ring-brown/20 shadow-md" : "border-stone-200 hover:border-brown/50"}`}>
                      <Image src={CAT_IMAGES[cat.slug] ?? CAT_IMAGES["dates"]} alt={cat.name} fill sizes="80px" className="object-cover group-hover:scale-105 transition-transform duration-300" />
                      {isActive && <div className="absolute inset-0 bg-brown/20" />}
                    </div>
                    <span className={`text-xs font-semibold text-center leading-tight transition-colors max-w-[80px] ${isActive ? "text-brown" : "text-stone-600 group-hover:text-brown"}`}>
                      {tr(cat.nameKey)}
                      {showCategoryCounts && <><br /><span className="text-[10px] font-normal text-stone-400">({count})</span></>}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Toolbar: search + sort + mobile filter button ── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">

          {/* Search */}
          <div className="relative w-full sm:max-w-xs">
            <input
              type="text"
              placeholder={tr("searchPlaceholder")}
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full bg-white border border-stone-200 rounded-xl px-4 py-2.5 pe-9 text-sm outline-none focus:ring-2 focus:ring-brown/20 focus:border-brown transition-all shadow-sm"
            />
            {search ? (
              <button onClick={() => handleSearch("")} className="absolute end-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 cursor-pointer transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            ) : (
              <svg className="absolute end-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            )}
          </div>

          {/* Results count */}
          {!loading && (
            <p className="text-sm text-stone-500 sm:flex-1">
              {filtered.length === 0 ? (
                <span>{tr("noResults")}</span>
              ) : (
                <>
                  {tr("showing")}{" "}
                  <span className="font-bold text-ink">{startItem}–{endItem}</span>{" "}
                  {isRtl ? "من أصل" : "of"}{" "}
                  <span className="font-bold text-ink">{filtered.length}</span>{" "}
                  {tr("product")}
                  {enablePagination && totalPages > 1 && (
                    <span className="text-stone-400 ms-1.5">
                      ({isRtl ? `صفحة ${safePage} من ${totalPages}` : `page ${safePage} of ${totalPages}`})
                    </span>
                  )}
                </>
              )}
            </p>
          )}

          {/* Mobile filter button */}
          <button
            onClick={() => setMobileFiltersOpen((v) => !v)}
            className="lg:hidden relative flex items-center gap-2 px-4 py-2.5 bg-white border border-stone-200 rounded-xl text-sm font-medium text-stone-700 hover:bg-stone-50 shadow-sm cursor-pointer transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filters
            {advancedFilterCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-amber-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {advancedFilterCount}
              </span>
            )}
          </button>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => handleSort(e.target.value)}
            className="bg-white border border-stone-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brown/20 cursor-pointer shadow-sm min-w-[160px]"
          >
            <option value="default">{tr("sortDefault")}</option>
            <option value="price-asc">{tr("sortPriceAsc")}</option>
            <option value="price-desc">{tr("sortPriceDesc")}</option>
            <option value="rating">{tr("sortRating")}</option>
            <option value="newest">Newest first</option>
          </select>
        </div>

        {/* ── Active filter chips ── */}
        {advancedFilterCount > 0 && (
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs text-stone-400 font-medium">Active filters:</span>
            {minPrice !== "" && (
              <FilterChip label={`Min ${minPrice} AED`} onRemove={() => handleMinPrice("")} />
            )}
            {maxPrice !== "" && (
              <FilterChip label={`Max ${maxPrice} AED`} onRemove={() => handleMaxPrice("")} />
            )}
            {inStockOnly && (
              <FilterChip label="In stock" onRemove={() => handleInStock(false)} />
            )}
            {minRating > 0 && (
              <FilterChip label={`${minRating}+ stars`} onRemove={() => handleRating(0)} />
            )}
            <button
              onClick={clearAllFilters}
              className="text-xs text-stone-400 hover:text-stone-600 underline cursor-pointer transition-colors"
            >
              Clear all
            </button>
          </div>
        )}

        {/* ── Mobile filter panel (collapsible) ── */}
        {mobileFiltersOpen && (
          <div className="lg:hidden bg-white rounded-2xl border border-stone-200 shadow-sm p-5">
            <FilterPanel
              products={products}
              minPrice={minPrice}
              maxPrice={maxPrice}
              inStockOnly={inStockOnly}
              minRating={minRating}
              onMinPrice={handleMinPrice}
              onMaxPrice={handleMaxPrice}
              onInStock={handleInStock}
              onRating={handleRating}
              onClear={clearAllFilters}
              activeCount={advancedFilterCount}
            />
          </div>
        )}

        {/* ── Main layout: filter sidebar (desktop) + product grid ── */}
        <div className="flex gap-6 items-start">

          {/* Desktop filter sidebar */}
          <aside className="hidden lg:block w-56 flex-none bg-white rounded-2xl border border-stone-100 shadow-sm p-5 sticky top-24">
            <FilterPanel
              products={products}
              minPrice={minPrice}
              maxPrice={maxPrice}
              inStockOnly={inStockOnly}
              minRating={minRating}
              onMinPrice={handleMinPrice}
              onMaxPrice={handleMaxPrice}
              onInStock={handleInStock}
              onRating={handleRating}
              onClear={clearAllFilters}
              activeCount={advancedFilterCount}
            />
          </aside>

          {/* Product grid */}
          <div className="flex-1 min-w-0 space-y-5">
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                {Array.from({ length: productsPerPage }).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : paged.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                {paged.map((product, i) => (
                  <ProductCard key={product.id} product={product} priority={i < 4 && safePage === 1} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-stone-100 text-center py-20 text-stone-400">
                <svg className="w-16 h-16 mx-auto mb-4 text-stone-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <p className="text-lg font-semibold">{tr("noResults")}</p>
                <p className="text-sm mt-1">{tr("tryOther")}</p>
                <button
                  onClick={() => { handleSearch(""); handleCategory("all"); clearAllFilters(); }}
                  className="mt-4 px-5 py-2 bg-brown text-white text-sm font-semibold rounded-xl hover:bg-brown-dark transition-colors cursor-pointer"
                >
                  {tr("viewAll")}
                </button>
              </div>
            )}

            {enablePagination && !loading && filtered.length > 0 && (
              <Pagination currentPage={safePage} totalPages={totalPages} onPage={handlePage} />
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
