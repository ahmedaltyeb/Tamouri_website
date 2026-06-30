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

// ── CMS-ready shop config ─────────────────────────────────────────────────────
// Extracted here so future CMS integration only needs to change this object.
const SHOP_CONFIG = {
  productsPerPage: 12,
  showCategoryCounts: true,
  showCategorySlider: true,
  enablePagination: true,
} as const;

// ── Category thumbnail images ─────────────────────────────────────────────────
const CAT_IMAGES: Record<string, string> = {
  "dates":            "https://i.ibb.co/WvwTpK27/dates.jpg",
  "arabic-coffee":    "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&q=80",
  "specialty-coffee": "https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=400&q=80",
  "tea":              "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&q=80",
  "tools":            "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&q=80",
  "travel-tools":     "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=400&q=80",
  "sweets":           "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=400&q=80",
};

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
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPage: (p: number) => void;
}

function Pagination({ currentPage, totalPages, onPage }: PaginationProps) {
  const { lang } = useLanguage();
  if (totalPages <= 1) return null;

  // Build page number list with ellipsis
  const pages: (number | "…")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push("…");
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (currentPage < totalPages - 2) pages.push("…");
    pages.push(totalPages);
  }

  const base =
    "flex items-center justify-center min-w-[36px] h-9 rounded-xl text-sm font-semibold transition-all cursor-pointer select-none";
  const idle =
    "bg-white border border-stone-200 text-stone-600 hover:border-brown hover:text-brown";
  const active = "bg-brown text-white shadow-sm shadow-brown/20";
  const disabled = "opacity-40 cursor-not-allowed bg-white border border-stone-200 text-stone-400";

  const isRtl = lang === "ar";

  return (
    <div className="flex items-center justify-center gap-1.5 pt-2 pb-4">
      {/* Previous */}
      <button
        onClick={() => onPage(currentPage - 1)}
        disabled={currentPage === 1}
        className={`${base} gap-1.5 px-3 ${currentPage === 1 ? disabled : idle}`}
        aria-label={isRtl ? "الصفحة السابقة" : "Previous page"}
      >
        <svg
          className={`w-4 h-4 flex-none ${isRtl ? "rotate-180" : ""}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        <span className="hidden sm:inline">{isRtl ? "السابق" : "Previous"}</span>
      </button>

      {/* Page numbers */}
      {pages.map((p, idx) =>
        p === "…" ? (
          <span
            key={`ellipsis-${idx}`}
            className="flex items-center justify-center min-w-[36px] h-9 text-stone-400 text-sm select-none"
          >
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onPage(p as number)}
            className={`${base} px-2 ${p === currentPage ? active : idle}`}
            aria-current={p === currentPage ? "page" : undefined}
          >
            {p}
          </button>
        )
      )}

      {/* Next */}
      <button
        onClick={() => onPage(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`${base} gap-1.5 px-3 ${currentPage === totalPages ? disabled : idle}`}
        aria-label={isRtl ? "الصفحة التالية" : "Next page"}
      >
        <span className="hidden sm:inline">{isRtl ? "التالي" : "Next"}</span>
        <svg
          className={`w-4 h-4 flex-none ${isRtl ? "rotate-180" : ""}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function ShopContent({ initialProducts }: { initialProducts?: Product[] }) {
  const { tr, lang, dir } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { products, loading } = useProducts(initialProducts);

  const [activeCategory, setActiveCategory] = useState(
    searchParams.get("category") ?? "all"
  );
  const [sortBy, setSortBy] = useState("default");
  const [search, setSearch] = useState(searchParams.get("q") ?? "");
  const [currentPage, setCurrentPage] = useState(
    Math.max(1, Number(searchParams.get("page") ?? "1"))
  );

  const { productsPerPage, showCategoryCounts, showCategorySlider, enablePagination } =
    SHOP_CONFIG;

  // ── URL sync: preserves all filters when navigating ──
  const pushUrl = useCallback(
    (cat: string, q: string, page: number) => {
      const p = new URLSearchParams();
      if (cat !== "all") p.set("category", cat);
      if (q.trim()) p.set("q", q.trim());
      if (page > 1) p.set("page", String(page));
      const qs = p.toString();
      router.replace(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
    },
    [pathname, router]
  );

  // Reset to page 1 whenever filter/sort changes
  useEffect(() => { setCurrentPage(1); }, [activeCategory, search, sortBy]);

  const handleCategory = (cat: string) => {
    setActiveCategory(cat);
    setCurrentPage(1);
    pushUrl(cat, search, 1);
  };

  const handleSearch = (q: string) => {
    setSearch(q);
    setCurrentPage(1);
    pushUrl(activeCategory, q, 1);
  };

  const handlePage = (page: number) => {
    setCurrentPage(page);
    pushUrl(activeCategory, search, page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ── Filtered + sorted product list ──
  const filtered = useMemo(() => {
    let result = [...products];
    if (activeCategory !== "all") {
      result = result.filter((p) => p.categorySlug === activeCategory);
    }
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
    if (sortBy === "price-asc") result.sort((a, b) => a.price - b.price);
    else if (sortBy === "price-desc") result.sort((a, b) => b.price - a.price);
    else if (sortBy === "rating") result.sort((a, b) => b.rating - a.rating);
    return result;
  }, [products, activeCategory, sortBy, search]);

  // ── Pagination slice ──
  const totalPages = enablePagination
    ? Math.max(1, Math.ceil(filtered.length / productsPerPage))
    : 1;
  const safePage = Math.min(currentPage, totalPages);
  const startIdx = (safePage - 1) * productsPerPage;
  const paged = enablePagination
    ? filtered.slice(startIdx, startIdx + productsPerPage)
    : filtered;

  const startItem = filtered.length === 0 ? 0 : startIdx + 1;
  const endItem = Math.min(startIdx + productsPerPage, filtered.length);

  const activeCatLabel =
    activeCategory === "all"
      ? tr("all")
      : tr(categories.find((c) => c.slug === activeCategory)?.nameKey ?? "all");

  const isRtl = lang === "ar";

  return (
    <div className="min-h-screen bg-stone-50" dir={dir}>

      {/* ── 1. Page header: title + breadcrumb ── */}
      <div className="bg-white border-b border-stone-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <h1 className="text-2xl md:text-3xl font-black text-ink mb-1.5">
            {activeCategory === "all" ? tr("shopPageTitle") : activeCatLabel}
          </h1>
          <nav className="flex items-center gap-1.5 text-sm text-stone-400" aria-label="breadcrumb">
            <Link href="/" className="hover:text-brown transition-colors">{tr("home")}</Link>
            <span aria-hidden>/</span>
            {activeCategory === "all" ? (
              <span className="text-ink font-medium">{tr("shop")}</span>
            ) : (
              <>
                <button
                  onClick={() => handleCategory("all")}
                  className="hover:text-brown transition-colors cursor-pointer"
                >
                  {tr("shop")}
                </button>
                <span aria-hidden>/</span>
                <span className="text-ink font-medium">{activeCatLabel}</span>
              </>
            )}
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-5">

        {/* ── 2. Category slider ── */}
        {showCategorySlider && (
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm px-4 pt-4 pb-3">
            {/*
              Mobile:  flex-nowrap + overflow-x-auto → horizontal scroll
              Desktop: flex-wrap + justify-center + overflow-visible → centered wrap
            */}
            <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1 md:flex-wrap md:justify-center md:overflow-visible">

              {/* "All" pill */}
              <button
                onClick={() => handleCategory("all")}
                className="flex-none flex flex-col items-center gap-2 group cursor-pointer"
              >
                <div className={`relative w-[72px] h-[72px] md:w-20 md:h-20 rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                  activeCategory === "all"
                    ? "border-brown ring-2 ring-brown/20 shadow-md"
                    : "border-stone-200 hover:border-brown/50"
                }`}>
                  <div className="w-full h-full bg-gradient-to-br from-brown to-gold flex items-center justify-center">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                      />
                    </svg>
                  </div>
                  {activeCategory === "all" && (
                    <div className="absolute inset-0 bg-brown/10" />
                  )}
                </div>
                <span className={`text-xs font-semibold text-center leading-tight whitespace-nowrap transition-colors ${
                  activeCategory === "all" ? "text-brown" : "text-stone-600 group-hover:text-brown"
                }`}>
                  {tr("all")}
                  {showCategoryCounts && (
                    <><br /><span className="text-[10px] font-normal text-stone-400">({products.length})</span></>
                  )}
                </span>
              </button>

              {/* Category cards */}
              {categories.map((cat) => {
                const count = products.filter((p) => p.categorySlug === cat.slug).length;
                const isActive = activeCategory === cat.slug;
                return (
                  <button
                    key={cat.id}
                    onClick={() => handleCategory(cat.slug)}
                    className="flex-none flex flex-col items-center gap-2 group cursor-pointer"
                  >
                    <div className={`relative w-[72px] h-[72px] md:w-20 md:h-20 rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                      isActive
                        ? "border-brown ring-2 ring-brown/20 shadow-md"
                        : "border-stone-200 hover:border-brown/50"
                    }`}>
                      <Image
                        src={CAT_IMAGES[cat.slug] ?? CAT_IMAGES["dates"]}
                        alt={cat.name}
                        fill
                        sizes="80px"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {isActive && (
                        <div className="absolute inset-0 bg-brown/20" />
                      )}
                    </div>
                    <span className={`text-xs font-semibold text-center leading-tight transition-colors max-w-[80px] ${
                      isActive ? "text-brown" : "text-stone-600 group-hover:text-brown"
                    }`}>
                      {tr(cat.nameKey)}
                      {showCategoryCounts && (
                        <><br /><span className="text-[10px] font-normal text-stone-400">({count})</span></>
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── 3. Toolbar: search + count + sort ── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">

          {/* Search input */}
          <div className="relative w-full sm:max-w-xs">
            <input
              type="text"
              placeholder={tr("searchPlaceholder")}
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full bg-white border border-stone-200 rounded-xl px-4 py-2.5 pe-9 text-sm outline-none focus:ring-2 focus:ring-brown/20 focus:border-brown transition-all shadow-sm"
            />
            <svg
              className="absolute end-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none"
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          {/* Results count — correct range display */}
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

          {/* Sort select */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-white border border-stone-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brown/20 cursor-pointer shadow-sm min-w-[160px]"
          >
            <option value="default">{tr("sortDefault")}</option>
            <option value="price-asc">{tr("sortPriceAsc")}</option>
            <option value="price-desc">{tr("sortPriceDesc")}</option>
            <option value="rating">{tr("sortRating")}</option>
          </select>
        </div>

        {/* ── 4. Product grid ── */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {Array.from({ length: productsPerPage }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : paged.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {paged.map((product, i) => (
              <ProductCard
                key={product.id}
                product={product}
                priority={i < 4 && safePage === 1}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-stone-100 text-center py-20 text-stone-400">
            <svg className="w-16 h-16 mx-auto mb-4 text-stone-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <p className="text-lg font-semibold">{tr("noResults")}</p>
            <p className="text-sm mt-1">{tr("tryOther")}</p>
            <button
              onClick={() => { handleSearch(""); handleCategory("all"); }}
              className="mt-4 px-5 py-2 bg-brown text-white text-sm font-semibold rounded-xl hover:bg-brown-dark transition-colors cursor-pointer"
            >
              {tr("viewAll")}
            </button>
          </div>
        )}

        {/* ── 5. Pagination ── */}
        {enablePagination && !loading && filtered.length > 0 && (
          <Pagination
            currentPage={safePage}
            totalPages={totalPages}
            onPage={handlePage}
          />
        )}

      </div>
    </div>
  );
}
