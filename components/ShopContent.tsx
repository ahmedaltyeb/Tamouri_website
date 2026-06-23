"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import ProductCard from "@/components/ProductCard";
import { categories } from "@/lib/products";
import { useLanguage } from "@/contexts/LanguageContext";
import { useProducts } from "@/hooks/useProducts";

// Category thumbnail images (Unsplash)
const CAT_IMAGES: Record<string, string> = {
  "dates":            "https://images.unsplash.com/photo-1559628233-100c798642d6?w=400&q=80",
  "arabic-coffee":    "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&q=80",
  "specialty-coffee": "https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=400&q=80",
  "tea":              "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&q=80",
  "tools":            "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&q=80",
  "travel-tools":     "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=400&q=80",
  "sweets":           "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=400&q=80",
};

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

export default function ShopContent() {
  const { tr } = useLanguage();
  const searchParams = useSearchParams();
  const { products, loading } = useProducts();

  const [activeCategory, setActiveCategory] = useState(
    searchParams.get("category") ?? "all"
  );
  const [sortBy, setSortBy] = useState("default");
  const [search, setSearch] = useState(searchParams.get("q") ?? "");

  const filtered = useMemo(() => {
    let result = [...products];
    if (activeCategory !== "all") {
      result = result.filter((p) => p.categorySlug === activeCategory);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }
    if (sortBy === "price-asc") result.sort((a, b) => a.price - b.price);
    else if (sortBy === "price-desc") result.sort((a, b) => b.price - a.price);
    else if (sortBy === "rating") result.sort((a, b) => b.rating - a.rating);
    return result;
  }, [products, activeCategory, sortBy, search]);

  const activeCatLabel =
    activeCategory === "all"
      ? tr("all")
      : tr(categories.find((c) => c.slug === activeCategory)?.nameKey ?? "all");

  return (
    <div className="min-h-screen bg-stone-50">

      {/* ── Page title + breadcrumb ── */}
      <div className="bg-white border-b border-stone-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <h1 className="text-2xl md:text-3xl font-black text-ink mb-1">
            {activeCategory === "all" ? tr("shopPageTitle") : activeCatLabel}
          </h1>
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-sm text-stone-400">
            <Link href="/" className="hover:text-brown transition-colors">{tr("home")}</Link>
            <span>/</span>
            {activeCategory === "all" ? (
              <span className="text-ink font-medium">{tr("shop")}</span>
            ) : (
              <>
                <button onClick={() => setActiveCategory("all")} className="hover:text-brown transition-colors cursor-pointer">
                  {tr("shop")}
                </button>
                <span>/</span>
                <span className="text-ink font-medium">{activeCatLabel}</span>
              </>
            )}
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">

        {/* ── Category cards row ── */}
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4 mb-6">
          <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">

            {/* "All" card */}
            <button
              onClick={() => setActiveCategory("all")}
              className={`flex-none flex flex-col items-center gap-2 group cursor-pointer`}
            >
              <div className={`relative w-20 h-20 md:w-24 md:h-24 rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                activeCategory === "all"
                  ? "border-brown ring-2 ring-brown/20 shadow-md"
                  : "border-stone-200 hover:border-brown/50"
              }`}>
                <div className="w-full h-full bg-gradient-to-br from-brown to-gold flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/>
                  </svg>
                </div>
              </div>
              <span className={`text-xs font-semibold text-center leading-tight whitespace-nowrap transition-colors ${
                activeCategory === "all" ? "text-brown" : "text-stone-600 group-hover:text-brown"
              }`}>
                {tr("all")}
                <br />
                <span className="text-[10px] font-normal text-stone-400">({products.length})</span>
              </span>
            </button>

            {/* Category cards */}
            {categories.map((cat) => {
              const count = products.filter((p) => p.categorySlug === cat.slug).length;
              const isActive = activeCategory === cat.slug;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.slug)}
                  className="flex-none flex flex-col items-center gap-2 group cursor-pointer"
                >
                  <div className={`relative w-20 h-20 md:w-24 md:h-24 rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                    isActive
                      ? "border-brown ring-2 ring-brown/20 shadow-md"
                      : "border-stone-200 hover:border-brown/50"
                  }`}>
                    <Image
                      src={CAT_IMAGES[cat.slug] ?? CAT_IMAGES["dates"]}
                      alt={cat.name}
                      fill
                      sizes="96px"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {isActive && (
                      <div className="absolute inset-0 bg-brown/20" />
                    )}
                  </div>
                  <span className={`text-xs font-semibold text-center leading-tight transition-colors max-w-[88px] ${
                    isActive ? "text-brown" : "text-stone-600 group-hover:text-brown"
                  }`}>
                    {tr(cat.nameKey)}
                    <br />
                    <span className="text-[10px] font-normal text-stone-400">({count})</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Toolbar: search + results count + sort ── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-5">
          {/* Search */}
          <div className="relative w-full sm:max-w-xs">
            <input
              type="text"
              placeholder={tr("searchPlaceholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-stone-200 rounded-xl px-4 py-2.5 pe-9 text-sm outline-none focus:ring-2 focus:ring-brown/20 focus:border-brown transition-all shadow-sm"
            />
            <svg className="absolute end-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
          </div>

          {/* Results count */}
          {!loading && (
            <p className="text-sm text-stone-500 sm:flex-1">
              {tr("showing")}{" "}
              <span className="font-bold text-ink">
                1–{Math.min(filtered.length, filtered.length)}
              </span>{" "}
              {tr("showing") === "عرض" ? "من أصل" : "of"}{" "}
              <span className="font-bold text-ink">{filtered.length}</span>{" "}
              {tr("product")}
            </p>
          )}

          {/* Sort */}
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

        {/* ── Product grid ── */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-stone-100 text-center py-20 text-stone-400">
            <svg className="w-16 h-16 mx-auto mb-4 text-stone-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <p className="text-lg font-semibold">{tr("noResults")}</p>
            <p className="text-sm mt-1">{tr("tryOther")}</p>
            <button
              onClick={() => { setSearch(""); setActiveCategory("all"); }}
              className="mt-4 px-5 py-2 bg-brown text-white text-sm font-semibold rounded-xl hover:bg-brown-dark transition-colors cursor-pointer"
            >
              {tr("viewAll")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
